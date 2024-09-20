#!/bin/bash

# Creating the database tables
echo "Applying database migrations..."
python _main_project/manage.py makemigrations
python _main_project/manage.py migrate

# Creating a superuser (this set up as a command in the _commands app)
echo "Creating superuser..."
python _main_project/manage.py create_superuser

# Creating social applications (this set up as a command in the _commands app)
echo "Creating social applications..."
python _main_project/manage.py create_social_apps

# Starting the server
python _main_project/manage.py runserver 0.0.0.0:8000
