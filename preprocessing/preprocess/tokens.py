from charset_normalizer import logging
import spacy


def get_tokens(sentence):
    nlp = spacy.load('en_core_web_sm', disable=['ner', 'textcat'])
    doc = nlp(sentence)
    json = doc.to_json()
    tokens_kept = []
    for i in range(len(json["tokens"])):
        if (json["tokens"][i]["pos"] != "DET" and json["tokens"][i]["pos"] != "PRON") or (
                len([t for t in doc[json["tokens"][i]["id"]].subtree]) != 1):
            tokens_kept.append(json["tokens"][i])
    return tokens_kept
