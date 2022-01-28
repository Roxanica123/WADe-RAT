import urllib.request
import logging
import json

import azure.functions as func

from preprocess.preprocess import get_all_info

from .resorces import get_resources_from_paths
from .tokens import get_tokens


def download_doument(url):
    with urllib.request.urlopen(url) as url:
        data = json.loads(url.read().decode())
        data.pop("info", None)
        data.pop("externalDocs", None)
        data.pop("tags", None)
        return data
    

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        req_body = req.get_json()
        document =  download_doument(req_body["openApiDocumentUrl"])
        sentence_info = get_all_info(req_body["sentence"])
        logging.info(sentence_info)
        response = {
            "openApiDocument": document, 
            "sentenceInfo": sentence_info, 
            }
        return func.HttpResponse(json.dumps(response), status_code=200)
    except Exception:
        return func.HttpResponse("Something went wrong", status_code=500)

