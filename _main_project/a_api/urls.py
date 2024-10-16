from django.urls import path
from . import views

urlpatterns = [
  path("blogposts/", views.BlogPostListCreate.as_view(), name="blogpost-list-create"),
  path("blogposts/<int:pk>/", views.BlogPostRetrieveUpdateDestroy.as_view(), name="blogpost-retrieve-update-destroy"),
  path("api_http_test_func/", views.api_http_test_func, name="api_http_test_func"),
  path("api_json_test_func/", views.api_json_test_func, name="api_json_test_func"),
]