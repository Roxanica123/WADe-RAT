const axios = require('axios')

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const result = await new GatewayOrchestrator().orchestrate(req.body, context);

    context.res = {
        status: result.status,
        body: result.body,
        contentType: 'application/json'
    };
}

class GatewayOrchestrator {
    inputValidator;
    constructor() {
        this.inputValidator = new InputValidator();
    }
    async orchestrate(body, context) {
        if (!this.inputValidator.isValid(body)) {
            return new ErrorResponse("Invalid input");
        }
        try {
            const preprocessedBody = await new PreprocessingService().getPreprocessedBody(body);
            if (preprocessedBody["error"] !== undefined) {
                return new ErrorResponse(preprocessedBody["error"], preprocessedBody["status"]);
            }
            if(body["path"]!==undefined){
                preprocessedBody["path"] = body["path"]
            }
            const nlpResult = await new NLPService().getNlpResult(preprocessedBody);
            if (nlpResult["error"] !== undefined) {
                return new ErrorResponse(nlpResult["error"], nlpResult["status"]);
            }
            return new OkResponse(nlpResult);
        } catch (error) {
            context.log(error);
            return new ErrorResponse("Something went wrong", 500);
        }
    }
}

class OkResponse {
    body = {};
    status = 200;
    constructor(body) {
        this.body = body;
    }
}

class ErrorResponse {
    body = {};
    status;
    constructor(message, status = 400) {
        this.status = status;
        this.body.message = message;
    }
}

const requiredProperties = ["openApiDocumentUrl", "sentence", "language"];

class InputValidator {
    isValid(body) {
        try {
            let first = body !== undefined;
            let second = requiredProperties.find(property => body[property] === undefined) === undefined;
            return first && second;
        }
        catch (e) {
            return false;
        }
    }
}

class PreprocessingService {
    url = "https://rat-preprocessing.azurewebsites.net/api/preprocess";
    async getPreprocessedBody(body) {
        return (await post(this.url, body)).data;
    }
}

class NLPService {
    url = "https://rat-nlp.azurewebsites.net/api/process";
    async getNlpResult(body) {
        return (await post(this.url, body)).data;
    }
}

async function post(url, data) {
    return await (axios.post(url, JSON.stringify(data), {
        headers: {
            'Content-Type': 'application/json'
        }
    }).catch(error => { return { data: { "error": error.response.data, "status": error.response.status } } }));
}