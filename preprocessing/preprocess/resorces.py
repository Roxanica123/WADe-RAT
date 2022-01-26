def get_resources_from_paths(paths):
    resources = []
    for path in paths:
        rec_create_resource(path[1:], resources)
    return resources


def rec_create_resource(path, resources):
    split_path = path.split(sep="/", maxsplit=1)
    root = split_path[0]

    if "{" in root:
        if len(split_path) != 1:
            rec_create_resource(split_path[1], resources)
        return

    resource = [r for r in resources if r["name"] == root]
    if len(resource) == 0:
        resource = {"name": root, "resources": []}
        resources.append(resource)
    else:
        resource = resource[0]
    if len(split_path) != 1:
        rec_create_resource(split_path[1], resource["resources"])