# TRANSCENDENCE

## **Notes for teammembers:**  

*This repo includes the material from the following repositories, combined :*  

- [postgresql_django_docker](https://github.com/svvoii/postgresql_django_docker)  
- [custom_user_model](https://github.com/svvoii/custom_user_model)  
- [django_oauth_42api](https://github.com/svvoii/django_oauth_42api.git)  

*Each repository above is a tutorial on its own. So, feel free to check them out if needed.*   

*To compare against the subject requirements this project includes the following, so far :*  

### Web
- (Major module): Use a Framework as backend. *(We use Django. Not sure what else they consider for this modul to be valid.)*
- (Minor module): Use a database for the backend. *(We use PostgreSQL.)*

### User Management
- (Major module): Standard user management, authentication, ... *(Covered in the custom user model repository.)*
- (Major module): Implementing a remote authentication. *(Covered in the 42 API repository.)*  

<br><br>

## **TO RUN THE PROJECT FROM THIS REPOSITORY**

***1. Create virtual environment.***  

*After cloning the repository, the virtual environment should be created and activated. I was using `pipenv` (for setup see the beginning of README file from any of the above repositories).*  

<br><br>

***2. Create the `.env` file.***  

*`.env` file should be created in the root directory of this repository (for more about the content of .env go to : [postgresql_django_docker](https://github.com/svvoii/postgresql_django_docker) repository).*

<br><br>

***3. Dependencies.***  

*The necessary dependencies in the virtual environment should be installed to tun the project. Should be a combination of the dependencies from the above repositories.* 

For using the django framework (custom user model):  
```bash
pipenv install django
pipenv install pillow
```

For using postgresql database and `.env` file:  
```bash
pipenv install django-environ
pipenv install psycopg2
```
**NOTE:**  
- *If you are on the school's computer, use `psycopg2-binary` instead of `psycopg2`.*
- *This package is needed for postgresql to work with django.* 
- *`psychopg2` requires some pre-installed packages which are not available on the school's computers and requires `sudo` rights.*    

For setting up the 42 API:  
```bash
pipenv install django-allauth
pipenv install requests
pipenv install pyjwt
pipenv install cryptography
```

<br><br>

***4. Use the Makefile to run the database.***

- *The setting in this repo will allow to run the django server in the docker container OR on the local machine (tiny change in `.env` file is needed to swich between two options).* 
- *The database will be running in the docker container.*   

*From the root directory, same level as the `Makefile` file:*  

```bash
make up-db
```

*This will spin up only the postgresql database in the docker container.*  

*To check the status of the docker containers, images and volumes use : `make ls`*  

All `make` commands:  
```bash
make build
make build-no-cache
make up
make up-db
make down
make rmi
make rmvol
make ls
make clean
```

<br><br>

***5. Migrate the database.***

*Once the database is running (it will be empty), the migrations should be applied to the database before running the django server.*  

*From the `_main_project` directory (sama level as `manage.py` file):*  

```bash
python manage.py makemigrations
python manage.py migrate
```

*Once this done all the tables, models from the project will be created in the database.*  

<br><br>

***6. Create a superuser.***  

*To access the admin panel of the django project, the superuser should be created.*  

*From the `_main_project` directory (sama level as `manage.py` file):*  

```bash
python manage.py createsuperuser
```

*Follow the instructions in the terminal to create the superuser.*   
*Once the superuser is created, the admin panel can be accessed via : `http://127.0.0.1:8000/admin/` in the browser, once the server is running.*  

<br><br>

***7. Run the server.***  

*From the `_main_project` directory (sama level as `manage.py` file):*  

```bash
python manage.py runserver
```

<br><br>

***8. Activate 3rd party authentication.***  

*The use of 42 API to authenticate users as well as athentication with Google (more social platforms can be added), there are some additional steps to be taken in the admin panel.*  

*For detailed instructions refer to the step 12 in the [django_oauth_42api](https://github.com/svvoii/django_oauth_42api.git) repository.*  



**That should be it, so far.**  

*I might have missed somethings, so please just ask if anything from the above is not clear.*  

