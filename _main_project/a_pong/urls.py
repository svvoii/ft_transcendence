from django.urls import path
from . import views

urlpatterns = [
 path("pong_test_func/", views.pong_test_func, name="pong_test_func"),
]