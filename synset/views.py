from django.db import connections
from django.db.models import Count
from django.http import JsonResponse
from django.http import request
from django.shortcuts import render
import json


# def treemap(request):
#     return render(request, 'treemap.html')


def treemap(request):
    def dfs(tree, result, path):
        if not 'children' in tree.keys():
            key = '/'.join(path + [tree['name']])
            result[key] = tree['n_offset']
            return
        for each in tree["children"]:
            path.append(tree['name'])
            dfs(each, result, path)
            path.pop()

    result = {}
    data = json.load(open("/Users/meigao/work/sandbox/django-d3-example/static/synset_hierarchy_v2.json"))
    dfs(data, result, [])
    return render(request, 'treemap.html', {'synset':json.dumps(result)})
