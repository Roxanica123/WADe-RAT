import re

import logging

from .tokens import get_tokens

ROOT = "ROOT"
VERB = "VERB"
NOUN = "NOUN"
ADPOSITION = "ADP"

GET_VERBS = ["get"]
POST_VERBS = ["post", "create"]
PUT_VERBS = ["put", "update"]
DELETE_VERBS = ["delete"]


def get_children_of_token(tokens, parent):
    return [t for t in tokens if t["head"] == parent["id"] and t["id"] != parent["id"]]


def find_verb_with_noun_child(tokens, child):
    children = get_children_of_token(tokens, child)
    if child["pos"] == VERB and len([c for c in children if c["pos"] == NOUN]) != 0:
        return child
    else:
        wanted_verbs = []
        for c in children:
            wanted_verb = find_verb_with_noun_child(tokens, c)
            if wanted_verb is not None:
                wanted_verbs.append(wanted_verb)
        return None if len(wanted_verbs) == 0 else sorted(wanted_verbs, key=lambda v: v["id"])[0]


def identify_method(verb_token):
    if verb_token is None:
        raise Exception("Could not identify the Rest API method")
    verb = verb_token["lemma"].lower()
    if verb in GET_VERBS:
        return "GET"
    if verb in POST_VERBS:
        return "POST"
    if verb in PUT_VERBS:
        return "PUT"
    if verb in DELETE_VERBS:
        return "DELETE"
    raise Exception("Could not identify the Rest API method")


def get_verb(tokens):
    root = [t for t in tokens if t["dep"] == ROOT][0]
    return find_verb_with_noun_child(tokens, root)


def get_parts_of_resource(tokens, resource):
    possible_parts_of_resource = sorted(
        [c for c in get_children_of_token(tokens, resource) if c["pos"] == NOUN or c["pos"] == "ADJ"],
        key=lambda v: v["id"], reverse=True)
    parts_of_resource = [resource]
    i = 1
    for r in possible_parts_of_resource:
        if r["id"] == resource["id"] - i:
            parts_of_resource.append(r)
            i += 1
    return sorted(parts_of_resource, key=lambda v: v["id"])


def get_target_resource(tokens, verb):
    nouns = [t for t in get_children_of_token(tokens, verb) if t["pos"] == NOUN]
    if len(nouns) == 0:
        raise Exception("Could not identify the target resource")
    resource = nouns[0]
    return {"target": resource, "compound": get_parts_of_resource(tokens, resource)}


def can_lead_to_spec(token, target_resource):
    return token["pos"] == ADPOSITION or token["pos"] == VERB or (
            token["pos"] == NOUN and token["id"] > target_resource["id"])


def get_next_child_with_pos(tokens, root, pos):
    children = [t for t in get_children_of_token(tokens, root)]
    nouns = sorted([t for t in children if t["pos"] == pos], key=lambda t: t["id"])
    if len(nouns) != 0:
        return nouns[0]
    possible = []
    for child in children:
        possible_pos = get_next_child_with_pos(tokens, child, pos)
        if possible_pos is not None:
            possible.append(possible_pos)
    return None if len(possible) == 0 else sorted(possible, key=lambda t: t["id"])[0]


def has_token_with_id_as_parent(tokens, parent_id, id):
    current_id = id
    while current_id != parent_id and tokens[current_id]["head"] != current_id:
        current_id = tokens[current_id]["head"]
    return current_id == parent_id


def get_next_linear_in_pos_list_with_parent(tokens, start_id, pos_list):
    for i in range(start_id + 1, len(tokens)):
        if tokens[i]["pos"] in pos_list and has_token_with_id_as_parent(tokens, start_id, i):
            return tokens[i]
    return None


def get_resource_parent(tokens, verb):
    adpositions = sorted([t for t in get_children_of_token(tokens, verb) if t["pos"] == ADPOSITION],
                         key=lambda t: t["id"])
    if len(adpositions) == 0:
        return None
    root = adpositions[0]
    resource_parent = get_next_child_with_pos(tokens, root, NOUN)
    value = None
    if resource_parent is not None:
        identifier = get_next_linear_in_pos_list_with_parent(tokens, resource_parent["id"], [NOUN, "ADJ", "PROPN"])
        if identifier is not None:
            value = tokens[identifier["head"]]
            if len(get_children_of_token(tokens, identifier)) != 0:
                value = get_next_linear_in_pos_list_with_parent(tokens, identifier["id"], [NOUN, "NUM", "PROPN", "ADJ"])
        resource_parent_parts = get_parts_of_resource(tokens, resource_parent)
        resource_parent = {"target": resource_parent, "compound": resource_parent_parts}
    return {"parent": resource_parent, "identifier_value": value}


def get_possible_parameters(tokens, target_resource, resource_parent):
    possible_parameters = []
    end = resource_parent["parent"]["target"]["id"] \
        if resource_parent is not None and resource_parent["parent"] is not None and \
           resource_parent["parent"]["target"]["id"] > \
           target_resource["target"]["id"] else len(tokens)
    for i in range(target_resource["target"]["id"] + 1, end):
        if tokens[i]["pos"] in [NOUN, "PROPN", "ADJ"]:
            possible_parameters.append(tokens[i])
    return possible_parameters


def replace_ids(sentence):
    sentence = re.sub(" id ", " identifier ", sentence)
    return re.sub(" ids ", " identifiers ", sentence)


def get_all_info(sentence):
    sentence = replace_ids(sentence)
    tokens = get_tokens(sentence)
    verb = get_verb(tokens)
    method = identify_method(verb)
    target_resource = get_target_resource(tokens, verb)
    resource_parent = get_resource_parent(tokens, verb)
    possible_parameters = get_possible_parameters(tokens, target_resource, resource_parent)
    return {"tokens": tokens, "verb": verb, "method": method, "target_resource": target_resource,
            "resource_parent": resource_parent, "possible_params": possible_parameters,
            "sentence": sentence}
