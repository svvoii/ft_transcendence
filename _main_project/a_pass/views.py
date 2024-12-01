from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.forms import PasswordChangeForm, PasswordResetForm
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view


@api_view(['POST'])
def api_custom_password_change_view(request, *args, **kwargs):
  form = PasswordChangeForm(user=request.user, data=request.POST)
  if form.is_valid():
    user = form.save()
    update_session_auth_hash(request, user)  # Important for keeping the user logged in
    return Response({'status': 'success', 'message': 'Your password has been successfully updated.'}, status=status.HTTP_200_OK)
  else:
    return Response({'status': 'error', 'errors': form.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def api_custom_password_reset_view(request, *args, **kwargs):
  form = PasswordResetForm(data=request.POST)
  if form.is_valid():
    form.save(request=request)
    message = '''
We've emailed you instructions for setting your password, if an account exists with the email you entered.
You should receive them shortly.
If you don't receive an email, please make sure you've entered the address you registered with, and check your spam folder.
    '''
    return Response({'status': 'success', 'message': message}, status=status.HTTP_200_OK)
  else:
    return Response({'status': 'error', 'errors': form.errors}, status=status.HTTP_400_BAD_REQUEST)