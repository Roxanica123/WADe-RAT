const requiredProperties = ["openApiDocumentUrl", "sentence", "language"];

class InputValidator{
    isValid(body){
        return requiredProperties.find(property=> body[property] === undefined) === undefined;
    }
}