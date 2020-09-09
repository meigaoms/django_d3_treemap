from django.conf.urls import url


from .views import treemap

urlpatterns = [
    url(r'^$', treemap, name='synset'),

]
