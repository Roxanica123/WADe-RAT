import logging
import urllib.request
import json


import azure.functions as func

from process.build_request import get_result

# {
#   "openApiDocument": "string",
#   "resources": [
#     "string"
#   ],
#   "tokens": [
#     "string"
#   ]
# }

# {
#   "url": "https://tesla.crypto.net/api/gallery",
#   "method": "GET",
#   "queryParameters": {
#     "additionalProp1": "string",
#     "additionalProp2": "string",
#     "additionalProp3": "string"
#   },
#   "body": ""
# }

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        req_body = req.get_json()
        doc = req_body["openApiDocument"]
        info = req_body["sentenceInfo"]
        result = get_result(info, doc)
        response = result
        return func.HttpResponse(json.dumps(response), status_code=200)
    except:
        return func.HttpResponse("Something went wrong", status_code=500)
