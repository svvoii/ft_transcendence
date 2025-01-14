from django.urls import path
# from a_user.views import api_profile_view, api_edit_profile_view, api_block_user_view, api_unblock_user_view, api_user_game_stats_view
from a_user import views


app_name = 'a_user'

urlpatterns = [
	path('<user_id>/', views.api_profile_view, name='profile'),
	path('<user_id>/edit/', views.api_edit_profile_view, name='edit'),
	path('<user_id>/block/', views.api_block_user_view, name='block-user'),
	path('<user_id>/unblock/', views.api_unblock_user_view, name='unblock-user'),
	# path('update_online_status/', views.api_update_online_status_view, name='update-online-status'),
	# path('check_online_status/<str:username>/', views.api_get_online_status_view, name='get-online-status'),
	path('stats/<str:stats_username>/', views.api_user_game_stats_view, name='stats'),
	path('match_history/<str:username>/', views.api_get_match_history_view, name='match-history'),
]
