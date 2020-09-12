from django.db import connections
from django.db.models import Count
from django.http import JsonResponse
from django.shortcuts import render


def treemap(request):
    return render(request, 'treemap.html')


