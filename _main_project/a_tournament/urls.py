from django.urls import path
from . import views

app_name = 'a_tournament'

urlpatterns = [
    path('create_tournament/', views.create_tournament, name='create_tournament'),
    # path('delete_tournament/', views.delete_tournament, name='delete_tournament'),
    path('delete_tournament/<str:tournament_name>/', views.delete_tournament, name='delete_tournament'),
    path('get_tournament/<str:tournament_name>/', views.get_tournament, name='get_tournament'),
    path('tournament_check_in/<str:tournament_name>/', views.tournament_check_in, name='tournament_check_in'),
    path('remove_player_from_tournament/<str:tournament_name>/', views.remove_player_from_tournament, name='remove_player_from_tournament'),
    # path('check_if_exists/<str:tournament_name>/', views.check_if_exists, name='check_if_exists'),
]