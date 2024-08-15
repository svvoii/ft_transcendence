from django.urls import path
from a_user.views import profile_view, edit_profile_view


app_name = 'a_user'

urlpatterns = [
	path('<user_id>/', profile_view, name='profile'),
	path('<user_id>/edit/', edit_profile_view, name='edit'),
]
