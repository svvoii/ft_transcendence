from django.urls import path, re_path
from . import views

urlpatterns = [
  path("", views.index),
  path("settings", views.index),
  path("game", views.index),
]