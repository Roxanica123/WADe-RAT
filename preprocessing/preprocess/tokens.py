from charset_normalizer import logging
import spacy


def get_tokens(sentence):
    nlp = spacy.load('en_core_web_sm', disable=['ner', 'textcat'])
    doc = nlp(sentence)
    json = doc.to_json()
    return json["tokens"]
