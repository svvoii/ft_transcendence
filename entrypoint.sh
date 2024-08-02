#!/bin/bash

python _my_project/manage.py migrate
python _my_project/manage.py runserver 0.0.0.0:8000
