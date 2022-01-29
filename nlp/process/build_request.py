import re


def get_compound_regex(compound):
    rj = ""
    for i in range(len(compound) - 1):
        rj += f".?({compound[i]['lemma']})?"
    rj += f".?{compound[len(compound) - 1]['lemma']}"
    return rj


def get_regex_pattern(resource):
    if resource is not None and len(resource["compound"]) > 1:
        return f"/{get_compound_regex(resource['compound'])}.*"
    return f"/{resource['target']['lemma']}[^/]*(/" + "{.*})?"


def get_raw_input(value_token, sentence):
    return sentence[value_token["start"]:value_token["end"]]


def replace_with_identifier(path, value_token, sentence):
    return re.sub("{.*}", get_raw_input(value_token, sentence), path, count=1)


def filter_based_on_id_existence(paths, should_exist):
    return [p for p in paths if bool(re.match("^/.*/{.*}/.*", p)) == should_exist]


def filter_by_path_with_identifier(paths, matching_paths, possible_parameters, method):
    if len(matching_paths) <= 1:
        return "" if len(matching_paths) == 0 else matching_paths[0]
    for path in matching_paths:
        for param in paths[path][method.lower()]["parameters"]:
            if param["in"] == "path":
                searched = "identifier" if param["name"] == "id" else param["name"]
                matching_params = [p for p in possible_parameters if re.match(f"{p['lemma']}.*", searched)]
                if (len(matching_params)) >= 1:
                    return path
    return matching_paths[0]


def get_path(info, doc):
    doc["paths"]["/recommendations/{id}/available-genre-seeds"] = []
    paths = doc["paths"].keys()
    matching_paths = list(paths)
    dummy_pattern = ""
    pattern = ""
    if info["resource_parent"] is not None and info["resource_parent"]["parent"] is not None:
        pattern = "^" + get_regex_pattern(info['resource_parent']['parent']) + "/.*"
        dummy_pattern += "/" + info['resource_parent']['parent']["target"]["lemma"]
        matching_paths = filter_based_on_id_existence([p for p in paths if re.fullmatch(pattern, p.lower())],
                                                      info['resource_parent']['identifier_value'] is not None)
        pattern = ".*"
    pattern += get_regex_pattern(info['target_resource'])
    dummy_pattern += "/" + info['target_resource']["target"]["lemma"]
    matching_paths = [p for p in matching_paths if
                      re.fullmatch(pattern, p)]
    path = filter_by_path_with_identifier(doc["paths"], matching_paths, info["possible_params"], info["method"])
    if path == "":
        raise Exception(
            f"Could not find a path similar with: {dummy_pattern}, try to be more explicit")
    return path


def get_value_for_token(tokens, token, search_end):
    allowed_types = ["NOUN", "NUM", "PROPN", "ADJ"]
    children_of_token = [t for t in tokens if t["head"] == token["id"] and t["id"] != token["id"]]
    if (len(children_of_token) == 0 and token["head"] == token["id"] - 1) or (
            tokens[token["id"] - 1]["head"] == token["id"]):
        if tokens[token["id"] - 1]["pos"] in allowed_types:
            return tokens[token["id"] - 1]
    for i in range(token["id"] + 1, search_end):
        if tokens[i]["pos"] in allowed_types:
            return tokens[i]


def get_parameters(info, doc, path):
    header = []
    query = []
    tokens = info["tokens"]
    params = doc["paths"][path][info["method"].lower()]["parameters"]
    possible_params = info["possible_params"]

    search_end = info["resource_parent"]["parent"]["target"]["id"] \
        if info["resource_parent"] is not None and info["resource_parent"]["parent"] is not None \
           and info["resource_parent"]["parent"]["target"]["id"] > info["target_resource"]["target"]["id"] \
        else len(tokens)

    for possible_param in possible_params:
        for param in params:
            searched = "identifier" if param["name"] == "id" else param["name"]
            if re.match(f"{possible_param['lemma']}.*", searched):
                value = get_value_for_token(tokens, possible_param, search_end)
                if param["in"] == "path":
                    path = re.sub("{.*}$", get_raw_input(value, info["sentence"]), path)
                possible_param["used"] = True
                if param["in"] == "header":
                    header.append({"param": param, "value": value})
                if param["in"] == "query":
                    query.append({"param": param, "value": value})
            else:
                if param["required"] is True and param["in"] != "path":
                    if param["in"] == "header":
                        header.append({"param": param, "value": "{you_need_to_add_it}"})
                    else:
                        query.append({"param": param, "value": "{you_need_to_add_it}"})
    return query, header, path


def build_query(query, sentence):
    query_string = "?"
    for element in query:
        value = element["value"] if isinstance(element["value"], str) else get_raw_input(element["value"], sentence)
        query_string += f'{element["param"]["name"]}={value}&'
    return query_string[:-1]


def build_header(headers, sentence):
    header_obj = {}
    for element in headers:
        value = element["value"] if isinstance(element["value"], str) else get_raw_input(element["value"], sentence)
        header_obj[f'{element["param"]["name"]}'] = value
    return header_obj


def replace_path_identifiers(info, path):
    if info["resource_parent"] is not None and info["resource_parent"]["parent"] is not None:
        return replace_with_identifier(path, info["resource_parent"]["identifier_value"], info["sentence"])
    return path


def get_result(info, doc):
    path = get_path(info, doc)
    query, header, path = get_parameters(info, doc, path)
    path = replace_path_identifiers(info, path)
    query = build_query(query, info["sentence"])
    header = build_header(header, info["sentence"])
    url = doc["servers"][0]["url"] + path + query
    return {"url": url, "method" : info["method"], "headers": header, "body": {}}