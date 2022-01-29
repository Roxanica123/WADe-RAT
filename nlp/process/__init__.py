import logging
import urllib.request
import json


import azure.functions as func

from process.build_request import CustomException, get_result



def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        req_body = req.get_json()
        doc = req_body["openApiDocument"]
        info = req_body["sentenceInfo"]
        path = req_body["path"] if "path" in list(req_body.keys()) else None
        result = get_result(info, doc, path)
        response = result
        return func.HttpResponse(json.dumps(response), status_code=200)
    except CustomException as err:
         return func.HttpResponse(f"{err}", status_code=400)
    except:
        return func.HttpResponse("Something went wrong", status_code=500)
