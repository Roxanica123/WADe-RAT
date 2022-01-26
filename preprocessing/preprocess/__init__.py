import urllib.request
import logging
import json

import azure.functions as func

from .resorces import get_resources_from_paths
from .tokens import get_tokens


def download_doument(url):
    with urllib.request.urlopen(url) as url:
        data = json.loads(url.read().decode())
        data.pop("info", None)
        data.pop("externalDocs", None)
        data.pop("tags", None)
        data.pop("components", None)
        return data
    

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        req_body = req.get_json()
        document =  download_doument(req_body["openApiDocumentUrl"])
        resources =  get_resources_from_paths(document["paths"])
        tokens = get_tokens(req_body["sentence"])
        response = {
            "openApiDocument": download_doument(req_body["openApiDocumentUrl"]), 
            "resources":resources, 
            "tokens":tokens
            }
        return func.HttpResponse(json.dumps(response), status_code=200)
    except:
        return func.HttpResponse("Something went wrong", status_code=500)

