from django.conf.urls import url
from tsne.views import tsne as tsnepage
from tsne.dash_apps import tsne
from tsne.dash_apps import SimpleExample

urlpatterns = [
    url(r'^$', tsnepage, name='tsne'),
]
