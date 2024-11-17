from django.urls import path
from a_pass.views import api_custom_password_change_view, api_custom_password_reset_view

urlpatterns = [
  path('change/', api_custom_password_change_view, name='password_change_view'),
  path('reset/', api_custom_password_reset_view, name='password_reset_view'),
]