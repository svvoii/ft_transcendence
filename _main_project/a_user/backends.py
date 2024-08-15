from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend


class CaseInsensitiveModelBackend(ModelBackend):

	# Overriding the authenticate method
	def authenticate(self, request, username=None, password=None, **kwargs):
		
		UserModel = get_user_model() # Getting the user model defined in the settings.py file (AUTH_USER_MODEL..)

		if username is None:
			username = kwargs.get(UserModel.USERNAME_FIELD) # Getting the username field from models.py (USERNAME_FIELD..)
		try:
			# case_insensitive_username_field = f'{UserModel.USERNAME_FIELD}__iexact'
			case_insensitive_username_field = '{}__iexact'.format(UserModel.USERNAME_FIELD)
			user = UserModel._default_manager.get(**{case_insensitive_username_field: username})
		except UserModel.DoesNotExist:
			UserModel().set_password(password)

		else:
			if user.check_password(password) and self.user_can_authenticate(user):
				return user
