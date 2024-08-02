from django.urls import path
from user.views import profile_view, edit_profile_view


app_name = 'user'

urlpatterns = [
	path('<user_id>/', profile_view, name='profile'),
	path('<user_id>/edit/', edit_profile_view, name='edit'),
]

# urlpatterns = [
# 	path('accounts/<int:account_id>/login/', custom_login, name='custom_login'),
# ]
