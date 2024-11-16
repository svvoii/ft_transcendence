from django.urls import path
from a_pass.views import api_custom_password_change_view

urlpatterns = [
  path('', api_custom_password_change_view, name='password_change_view'),
]