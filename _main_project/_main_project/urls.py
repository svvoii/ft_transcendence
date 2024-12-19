"""
URL configuration for _main_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth import views as auth_views

from a_user.views import api_register_view, api_login_view, api_logout_view, api_account_search_view, api_logged_in_user_view
from a_spa_frontend.views import index
from a_pass import views




urlpatterns = [
    path('', index, name='js_home'),
    path('admin/', admin.site.urls),
	path('accounts/', include('allauth.urls')),
	path('chat/', include('a_chat.urls', namespace='chat')),
	path('tournament/', include('a_tournament.urls', namespace='tournament')),
	path('friends/', include('a_friends.urls', namespace='friends')),
    path('register_page/', index, name='register_page'),
	path('register/', api_register_view, name='register'),
	path('login/', api_login_view, name='login'),
    path('login_check/', api_logged_in_user_view, name='login_check'),
	path('logout/', api_logout_view, name='logout'),
	path('user/', include('a_user.urls', namespace='user')),
	path('search/', api_account_search_view, name='search'),
    path('game/', include('a_game.urls'), name='game'),
    path('password/', include('a_pass.urls'), name='password'),

	# Password reset links (ref: https://github.com/django/django/blob/master/django/contrib/auth/views.py)
    path('password_change/done/', auth_views.PasswordChangeDoneView.as_view(template_name='password_reset/password_change_done.html'), name='password_change_done'),
    path('password_change/', auth_views.PasswordChangeView.as_view(template_name='password_reset/password_change.html'), name='password_change'),
    path('password_reset/done/', auth_views.PasswordResetCompleteView.as_view(template_name='password_reset/password_reset_done.html'), name='password_reset_done'),
    path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'), 
    path('password_reset/', auth_views.PasswordResetView.as_view(), name='password_reset'),
    path('reset/done/', auth_views.PasswordResetCompleteView.as_view(template_name='password_reset/password_reset_complete.html'), name='password_reset_complete'),

    re_path(r'^.*/', include('a_spa_frontend.urls')),
]


if settings.DEBUG:
	urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
	urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
