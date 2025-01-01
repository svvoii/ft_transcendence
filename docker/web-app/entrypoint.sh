#!/bin/bash

# Check current directory
echo "Current directory: $(pwd)"
# echo "Listing files in current directory..."
# ls -l
# echo "Listing files in /app directory..."
cd /app
# ls -l

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Creating the database tables
echo "Applying database migrations..."
python manage.py makemigrations
python manage.py migrate

# Creating a superuser (this set up as a command in the _commands app)
echo "Creating superuser..."
python manage.py create_superuser

# Creating social applications (this set up as a command in the _commands app)
echo "Creating social applications..."
python manage.py create_social_apps

# Creating public caht room (this set up as a command in the _commands app)
echo "Creating public chat room..."
python manage.py create_public_chatroom

# Loading active game states
echo "Loading active game states..."
python manage.py load_active_game_states

# Starting the server
python manage.py runserver 0.0.0.0:8000
