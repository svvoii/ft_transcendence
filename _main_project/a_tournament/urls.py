from django.urls import path
from . import views

app_name = 'a_tournament'

urlpatterns = [
    path('create_tournament/', views.create_tournament, name='create_tournament'),
    # path('delete_tournament/', views.delete_tournament, name='delete_tournament'),
    path('delete_tournament/<str:tournament_name>/', views.delete_tournament, name='delete_tournament'),
    path('get_tournament/<str:tournament_name>/', views.get_tournament, name='get_tournament'),
]