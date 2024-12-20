from django.urls import path
from a_user.views import api_profile_view, api_edit_profile_view, api_block_user_view, api_unblock_user_view


app_name = 'a_user'

urlpatterns = [
	path('<user_id>/', api_profile_view, name='profile'),
	path('<user_id>/edit/', api_edit_profile_view, name='edit'),
	path('<user_id>/block/', api_block_user_view, name='block-user'),
	path('<user_id>/unblock/', api_unblock_user_view, name='unblock-user'),
]
