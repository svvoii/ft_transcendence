from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager # importing the AbstractBaseUser and BaseUserManager classes to extend them in custom user model


class MyAccountManager(BaseUserManager):

	def create_user(self, email, username, password=None):
		if not email:
			raise ValueError("Users must have an email address")
		if not username:
			raise ValueError("Users must have a username")

		user = self.model(
			email=self.normalize_email(email),
			username=username,
		)

		user.set_password(password)
		user.save(using=self._db)
		return user

	def create_superuser(self, email, username, password):
		user = self.create_user(
			email=self.normalize_email(email),
			username=username,
			password=password,
		)

		user.is_admin = True
		user.is_staff = True
		user.is_superuser = True
		user.save(using=self._db)
		return user


# This function will be used to get the profile image path of the user. User custom images will be stored in the `media_cdn/profile_images` directory
def get_profile_image_filepath(self, filename):
	return f'profile_images/{self.pk}/{"profile_image.png"}'

# This function will be used to get the default profile image of the user.. in `static/images` directory
def get_default_profile_image():
	return "profile_images/default.png"

class Account(AbstractBaseUser):

	# Overriding the default fields of the AbstractBaseUser class
	email = models.EmailField(verbose_name="email", max_length=60, unique=True) # unique=True is to make sure the email is unique
	username = models.CharField(max_length=30, unique=True)
	date_joined = models.DateTimeField(verbose_name='date joined', auto_now_add=True)
	last_login = models.DateTimeField(verbose_name='last login', auto_now=True)
	is_admin = models.BooleanField(default=False)
	is_active = models.BooleanField(default=True)
	is_staff = models.BooleanField(default=False)
	is_superuser = models.BooleanField(default=False)
	profile_image = models.ImageField(max_length=255, upload_to=get_profile_image_filepath, null=True, blank=True, default=get_default_profile_image)
	hide_email = models.BooleanField(default=True)
	online = models.BooleanField(default=False)

	objects = MyAccountManager()

	USERNAME_FIELD = 'email' # This will be used to login the user
	REQUIRED_FIELDS = ['username'] # This will be required as well to create an account
	
	def __str__(self):
		return self.username
	
	# This will be used to get the profile image name of the user
	def get_profile_image_filename(self):
		return str(self.profile_image)[str(self.profile_image).index('profile_images/{self.pk}/'):]	

	def has_perm(self, perm, obj=None):
		return self.is_admin

	def has_module_perms(self, app_label):
		return True

	# Here we override the default save method to create a UserGameStats object for the user as soon as the user is created
	def save(self, *args, **kwargs):
		super().save(*args, **kwargs)
		if not hasattr(self, 'usergamestats'):
			UserGameStats.objects.create(user=self)


# This model is addition to the default Account model to store the uo to date statistics of games played by the user
class UserGameStats(models.Model):
	user = models.OneToOneField(Account, on_delete=models.CASCADE)
	total_games_played = models.IntegerField(default=0)
	total_wins = models.IntegerField(default=0)
	total_losses = models.IntegerField(default=0)

	def update_stats(self, is_win):
		self.total_games_played += 1
		if is_win:
			self.total_wins += 1
		else:
			self.total_losses += 1
		self.save()
	
	def __str__(self):
		return f'{self.user.username}\'s game stats'


# The following model / db table will store the blocked users relationship.
class BlockedUser(models.Model):
	user = models.ForeignKey(Account, related_name='blocked_users', on_delete=models.CASCADE)
	blocked_user = models.ForeignKey(Account, related_name='blocked_by', on_delete=models.CASCADE)

	class Meta:
		unique_together = ('user', 'blocked_user')
	
	def __str__(self):
		return f'{self.user.username} blocked {self.blocked_user.username}'
