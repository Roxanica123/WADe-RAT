
module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const result = new GatewayOrchestrator().orchestrate(req.body);

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
    orchestrate(body) {
        if (!this.inputValidator.isValid(body)) {
            return new ErrorResponse("Invalid input");
        }
        return new OkResponse("cv", "GET", {}, body);
    }
}


class OkResponse {
    body = {};
    status = 200;
    constructor(url, method, queryParameters = {}, body = {}) {
        this.body.url = url;
        this.body.method = method;
        this.body.queryParameters = queryParameters;
        this.body.body = body;
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
            let first =  body !== undefined;
            let second = requiredProperties.find(property => body[property] === undefined) === undefined;
            return first && second;
        }
        catch (e) {
            return false;
        }
    }
}