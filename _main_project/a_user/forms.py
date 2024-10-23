import json

from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import authenticate

from a_user.models import Account

class RegistrationForm(UserCreationForm):

	email = forms.EmailField(max_length=255, help_text='Required. Add a valid email address')
 
	class Meta:
		model = Account
		fields = ('email', 'username', 'password1', 'password2')

	# This method is used to clean the data of the form (validate the data)
	def clean_email(self):
		email = self.cleaned_data['email'].lower() # ..`email` is the name of the field which passed from `register.html`
		try:
			account = Account.objects.get(email=email)
		except Exception as e:
			return email
		raise forms.ValidationError(f'Email {email} is already in use.')
	
	def clean_username(self):
		username = self.cleaned_data['username']
		try:
			account = Account.objects.get(username=username)
		except Exception as e:
			return username
		raise forms.ValidationError(f'Username {username} is already in use.')

	def getErrors(self):
		'''
		This method is used to get the error message from the form in a text format
		'''
		text_errors = ''
		errors = json.loads(self.errors.as_json())
		for field, message in errors.items():
			if (text_errors != ''):
				text_errors += '\n'
			text_errors += message[0]['message']
		return text_errors


class AccountAuthenticationForm(forms.ModelForm):

	password = forms.CharField(label='Password', widget=forms.PasswordInput) # `widget..` makes the password field to be displayed as a password field

	class Meta:
		model = Account
		fields = ('email', 'password')

	def clean(self):
		if self.is_valid():
			email = self.cleaned_data['email']
			password = self.cleaned_data['password']
			if not authenticate(email=email, password=password):
				raise forms.ValidationError('Invalid login')
	
	def getErrors(self):
		'''
		This method is used to get the error message from the form in a text format
		'''
		try:
			text_errors = json.loads(self.errors.as_json())['__all__'][0]['message']
		except Exception as e:
			print('Error finding error message from froms.ModelForm')
		return text_errors


class AccountUpdateForm(forms.ModelForm):
	class Meta:
		model = Account
		fields = ('email', 'username', 'profile_image', 'hide_email')
	
	def clean_email(self):
		email = self.cleaned_data['email']
		try:
			account = Account.objects.exclude(pk=self.instance.pk).get(email=email)
		except Account.DoesNotExist:
			return email
		raise forms.ValidationError(f'Email {email} is already in use.')

	def clean_username(self):
		username = self.cleaned_data['username']
		try:
			account = Account.objects.exclude(pk=self.instance.pk).get(username=username)
		except Account.DoesNotExist:
			return username
		raise forms.ValidationError(f'Username {username} is already in use.')

	def save(self, commit=True):
		account = super(AccountUpdateForm, self).save(commit=False)
		account.email = self.cleaned_data['email']
		account.username = self.cleaned_data['username']
		account.profile_image = self.cleaned_data['profile_image']
		account.hide_email = self.cleaned_data['hide_email']
		if commit:
			account.save()
		return account

