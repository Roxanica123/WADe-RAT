import logging
import urllib.request
import json


import azure.functions as func

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
        open_api_doc = req_body["openApiDocument"]
        logging.info(open_api_doc)
        resources = req_body["resources"]
        logging.info(resources)
        tokens = req_body["tokens"]
        logging.info(tokens)
        response = {
            "url": "https://tesla.crypto.net/api/gallery", 
            "method": "GET", 
            "queryParameters": {}, 
            "body":{}}
        return func.HttpResponse(json.dumps(response), status_code=200)
    except:
        return func.HttpResponse("Something went wrong", status_code=500)
