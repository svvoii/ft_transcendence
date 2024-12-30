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

# Creating public caht room (this set up as a command in the _commands app)
echo "Creating public chat room..."
python _main_project/manage.py create_public_chatroom

# Loading active `game_states` from the database
echo "Loading active game states..."
python _main_project/manage.py load_active_game_states

# Starting the server
python _main_project/manage.py runserver 0.0.0.0:8000
