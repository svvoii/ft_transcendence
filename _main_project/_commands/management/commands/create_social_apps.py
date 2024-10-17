from django.core.management.base import BaseCommand
from allauth.socialaccount.models import SocialApp
from django.contrib.sites.models import Site
from django.conf import settings

class Command(BaseCommand):
	help = 'Create social applications for allauth'

	def handle(self, *args, **kwargs):
		site = Site.objects.get_current()

		social_apps = [
			{
				'provider': '42',
				'name': '42',
				'client_id': settings.SOCIALACCOUNT_PROVIDERS['42']['CLIENT_ID'],
				'secret': settings.SOCIALACCOUNT_PROVIDERS['42']['SECRET'],
			},
			{
				'provider': 'google',
				'name': 'Google',
				'client_id': settings.SOCIALACCOUNT_PROVIDERS['google']['CLIENT_ID'],
				'secret': settings.SOCIALACCOUNT_PROVIDERS['google']['SECRET'],
			},
			# Add more social apps here if needed
		]

		for app_data in social_apps:
			app, created = SocialApp.objects.get_or_create(
				provider=app_data['provider'],
				name=app_data['name'],
				defaults={
					'client_id': app_data['client_id'],
					'secret': app_data['secret'],
				}
			)
			if created:
				app.sites.add(site)
				self.stdout.write(self.style.SUCCESS(f'Successfully created social application for {app_data["name"]}'))
			else:
				self.stdout.write(self.style.WARNING(f'Social application for {app_data["name"]} already exists'))
