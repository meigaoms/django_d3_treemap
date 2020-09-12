from django.shortcuts import render


def tsne(request):
    return render(request, 'tsne.html')
