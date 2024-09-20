# TRANSCENDENCE

## **Notes for teammembers:**  

*This repo includes the material from the following repositories, combined :*  

- [postgresql_django_docker](https://github.com/svvoii/postgresql_django_docker)  
- [custom_user_model](https://github.com/svvoii/custom_user_model)  
- [django_oauth_42api](https://github.com/svvoii/django_oauth_42api.git)  

*Each repository above is a tutorial on its own. So, feel free to check them out if needed.*   

- additionally the `live chat` has been added to the project as `a_chat` app in the `_main_project` directory. (no separate repository for this one).  

*To compare against the subject requirements this project includes the following, so far :*  

### Web
- (Major module): Use a Framework as backend. *(We use Django. Not sure what else they consider for this modul to be valid.)*
- (Minor module): Use a database for the backend. *(We use PostgreSQL.)*

### User Management
- (Major module): Standard user management, authentication, ... *(Covered in the custom user model repository.)*
- (Major module): Implementing a remote authentication. *(Covered in the 42 API repository.)*  

### Gameplay and user experience
- (Major module): Live chat. *(No separate repository for this one.)* 

<br><br>

## **TO RUN THE PROJECT**

<br>

***0. Clone the repository.***  

*not gonna tell you how :D*

<br>

***1. Create the `.env` file.***  

*This one is important since the project depends on the environment variables to set up all the business for different purposes..*  

*So, `.env` file should be created in the root directory of this repository.. here is the example (just copy-paste):*

```bash
# = = = = = = =
# PYTHON:
# = = = = = = =
PYTHONUNBUFFERED=1 # Prevents Python from writing pyc files to disc (equivalent to python -B option)
PYTHONDONTWRITEBYTECODE=1 # Prevents Python from buffering stdout and stderr (equivalent to python -u option)

# = = = = = = =
# DJANGO:
# = = = = = = =
DEBUG=True
SECRET_KEY='some_secret_words'
ALLOWED_HOSTS=*
DJANGO_SUPERUSER_EMAIL=admin@gmail.com
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_PASSWORD=qetwry135246

# sosial accounts settings for django-allauth
GOOGLE_CLIENT_ID='see-the-NOTE-below'
GOOGLE_SECRET='see-the-NOTE-below'

42_CLIENT_ID='see-the-NOTE-below'
42_SECRET='see-the-NOTE-below'

# = = = = = = =
# POSTGRES:
# = = = = = = =
# for PostgreSQL as well as Django in separate docker containers:
DATABASE_URL=postgres://postgres:postgres@db:5432/postgres

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=postgres

```

**NOTE:**  
- *Regarding the `GOOGLE_CLIENT_ID` and `GOOGLE_SECRET` refer to [this repo](https://github.com/svvoii/django_oauth_google) to set up your own Google API credentials. (See point 9 in the README)*
- *Regarding the `42_CLIENT_ID` and `42_SECRET` refer to [this repo](https://github.com/svvoii/django_oauth_42api.git) to set up your own 42 API credentials. (See point 12 in the README)*  
- *If you dont want to do that.. just ask me for my credentials..*  

<br>

***2. RUN the project.***  

*Once the `.env` file is created and filled all the variables listed above, the project can be run.*  

*The setup of this repository is set up to run the project completely in the docker containers with the ability to make changes to the code on the local machine.*  

*Also, the Makefile is available to run docker and docker compose commands to make it easier to manage the containers.*  

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
make re
```

- *`make up` command will build the images, create the containers and run the project.*  
- *`make re` command will remove the containers, volumes, rebuild the images and run the project.*  


<br><br>

## **ADDITIONAL INFO**

<br>

**1.** *All the requirements for the project are listed in the `requirements.txt` file. Those are installed in the docker container when the image is built with Dockerfile.*

<br>

**2.** *There is a `entrypoint.sh` file in the root directory of the repo. This file is used to run some additional commands when the container is created. This makes the setup of the project easier.*  

*For example:*  
- *The migrations are applied to the database when the container is created.*
- *The superuser is created for the admin panel once the migrations are applied.*
- *The social accounts are set up in the admin panel to use the 3rd party authentication to sign in with 42 API, Google, etc.*  
- *The is a public chat room available for all users, as soon as they sign in. The `public_chat` chat room is created in the database once the container is up.*
- *The last thing is the `entrypoint.sh` file is used to run the Django (Daphne) server.*

**NOTE**: *The logic in the `entrypoint.sh` setting up all the above as if those are python commands. Those custom commands are defined in the `_main_project/_commands/management/commands/` directory (should be like this). Feel free to check them out if curious.*  

<br>

**3.** *It is not possible to push any changes to the `main` branch of this repo. All the changes shall be made in the separate branches and then merged with the `main` branch via pull request.*  


<br><br>

## **LIVE CHAT FUNCTIONSLITY**

*The project is set up to run the Django server with the Daphne server. This is done to use the Django Channels for the live chat functionality.*

*So, the available functionality is the following :*  
- *There is a `Puplic Chat` room available for all users.*
- *The users can initiate a private chat with any other user, regardless of being friends or not.*
- *The users can create a group chat with multiple users. To join the group chat, the link should be shared with the respective users.*
- *The admin of the group chat can remove users from the group chat and delete the group chat.*
- *The users can block other users, this will prevent the exchange of private messages, as well as sending friend request.*
- *To block a user, the unfriend action should be taken first (the button `Block` is available if viewed user is not a friend).*

***To implement the live chat functionality, the following concepts were used :***
- *Django Channels (Websockets)*
- *ASGI (Asynchronous Server Gateway Interface) with Daphne server (pipenv install 'channels[daphne]'). In `settings.py` changed the `WSGI_APPLICATION` to `ASGI_APPLICATION`.*
- *Redis is used for handling the upload of messages between the users. (There is another container in the docker-compose file for the Redis server).*
- *HTMX (Hypertext Markup eXtension) for the frontend part of the chat application. (this allows to send the messages without refreshing the page).*

*This allows to have asynchronous experience in the chat application when the messages are sent and received in real time.*


**That should be it, so far.**  

