from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import os


class Command(BaseCommand):
	help = 'Create a superuser if it does not exist'

	def handle(self, *args, **kwargs):
		User = get_user_model()
		email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
		username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
		password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')

		if not User.objects.filter(email=email).exists():
			User.objects.create_superuser(email=email, username=username, password=password)
			self.stdout.write(self.style.SUCCESS('Superuser created.'))
		else:
			self.stdout.write(self.style.WARNING('Superuser already exists.'))
