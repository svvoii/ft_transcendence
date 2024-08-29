#!/bin/bash

# Creating the database tables
python _main_project/manage.py makemigrations
python _main_project/manage.py migrate

# Creating a superuser
python _main_project/manage.py shell << EOF
import os
from django.contrib.auth import get_user_model

User = get_user_model()
username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')

if not User.objects.filter(username=username).exists():
	User.objects.create_superuser(username=username, email=email, password=password)
	print('Superuser created.')
else:
	print('Superuser already exists.')

EOF

# Starting the server
python _main_project/manage.py runserver 0.0.0.0:8000
