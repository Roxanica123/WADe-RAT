class OkResponse{
    body;
    status = 200;
    contentType = 'application/json';
    constructor(url, method, queryParameters={}, body={}){
        body.url = url;
        body.method = method;
        body.queryParameters = queryParameters;
        body.body = body;
    }
}
class ErrorResponse{
    body;
    status;
    contentType = 'application/json';
    constructor(message, status = 400){
        this.status = status;
        body.message = message;
    }
}