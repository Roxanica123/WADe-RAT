const { InputValidator } = require("./input-validator");
const { ErrorResponse, OkResponse } = require("./response")

class GatewayOrchestrator {
    inputValidator;
    constructor() {
        this.inputValidator = new InputValidator();
    }
    orchestrate(body) {
        if (!this.inputValidator) {
            return new ErrorResponse("Invalid input");
        }
        return new OkResponse("cv", "GET", {}, body);
    }
}