from django.urls import path, re_path
from . import views

urlpatterns = [
  path("", views.index, name="js_home_home"),
  path("settings", views.index, name="js_settings"),
  path("game_menu/", views.index, name="js_game_menu"),
  path("tournament_lobby/", views.index, name="js_tournament_lobby"),
  path("tournament_select/", views.index, name="js_tournament_select"),
  path("multiplayer_select/", views.index, name="js_multiplayer_select"),
  path("local_match_select/", views.index, name="js_local_match_select"),
  path("tournament_setup_create/", views.index, name="js_tournament_setup_create"),
  path("tournament_lobby/<str:name>/", views.index, name="js_tournament_lobby_name"),
  path("terms_of_service/", views.index, name="js_terms_of_service"),
  path("privacy_policy/", views.index, name="js_privacy_policy"),
  path("about_us/", views.index, name="js_about_us"),
]