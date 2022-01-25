import urllib.request
import logging
import json

import azure.functions as func


def download_doument(url):
    with urllib.request.urlopen(url) as url:
        data = json.loads(url.read().decode())
        return data

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        req_body = req.get_json()
        response = {"openApiDocument": download_doument(req_body["openApiDocumentUrl"]), "resources":[], "tokens":[]}
        return func.HttpResponse(json.dumps(response), status_code=200)
    except:
        return func.HttpResponse("Something went wrong", status_code=500)

