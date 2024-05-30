## README

This readme file contains steps to complete the project ft_transcendence.  

### Project Description

ft_transcendence is the last project of the common core curiculum at 42 school.  
The base requirement of the project is to create a website that allows multiple users to play a game of pong against each other.  

It is a versatile project that can be expanded in many ways including the range of different concepts and technologies. Some of the features include live chat, AI opponent, blockchain integration, remote play, cybersecutity components etc.   

Complete selection of additional project modules include:  
#### WEB:
- Backend framework: `Django`.
- Frontend framework: `Bootstrap`.
- Database: `PostgreSQL`.  
- Blockchain: to store the tournament results, `Etherium` and `Solidity` technology.

#### USER MANAGEMENT:
- Authentication: Secure login and registration. 
- Remote authentication: using `OAuth 2.0`.

#### GAME AND USER EXPERIENCE:
- Real-time remote play: using `Websockets`.  
- Multiple players: play with multiple players in the same game.  
- Another game: Implementing another online, real-time game.  
- Game customization: Customizable game settings, like ball speed, paddle size, etc.  
- Live chat: Implementing a live chat with direct messages with ability to send invitations etc.  

#### AI & ALGORITHMS:
- AI Opponent: Implementing an AI opponent for the game.  
- Game Statistics: Implementing game statistics dashboard.  

#### CYBERSECURITY:
- WAF: Implementing a Web Application Firewall.  
- ModSecurity: Implementing ModSecurity rules.  
- HashiCorp Vault: Implementing HashiCorp Vault for secrets management.  
- GDPR: Implementing GDPR compliance.  
- 2FA: Implementing Two-Factor Authentication.  

#### DEVOPS:
- ELK: Implementing ELK stack for logging (Elasticsearch, Logstash, Kibana).  
- Prometheus and Grafana: Implementing monitoring and alerting.  
- Backend as Microservices: Implementing backend as microservices.  

#### GAMING: 
- Another game: Implementing another online, real-time game.  
- Game customization: Customizable game settings, like ball speed, paddle size, etc.  

#### GRAPHICS:
- Advanced 3D Techniques: ThreeJS / WebGL.

#### ACCESSIBILITY:
- All devices: Responsive design to work on all devices.  
- Browser compatibility: Support for all major browsers.  
- Multilanguage: Support for multiple languages.  
- Accessibility: Implementing accessibility for Visually Impaired Users.  
- SSR: Implementing Server-Side Rendering.  
- SEO: Implementing Search Engine Optimization.  

#### SERVER-SIDE PONG:
- Server-side pong: Implementing a server-side pong game.  
- API: Implementing an API for the game.  
- CLI: Implementing a CLI for the gameplay against Web Users with API.  


## Project Structure


## Project Setup

# 1

I chose to use `Django` as the backend framework for the project. So, the first step is to install Django and set up the development environment.    

1) 

```bash
```


## PROJECT IMPLEMENTATION

### DJANGO SETUP

#### 1. Setting up virtual environment

1) Creating new directory for the project and navigating to it.  

2) Making sure that `python3` and `pip` are installed.  
`python3 --version` - to check python version.  
`pip3 --version` - to check pip version.  

3) Installing `virtualenv` using pipenv.  
`pip3 install pipenv` - to install pipenv.  

4) Creating Django project in the current directory.  
`pipenv install django` - to install Django in the virtual environment.  

This will create a new virtual environment and install Django in it. When done the path to the virtual environment will be displayed. 	
```bash
...
✔ Successfully created virtual environment!
Virtualenv location: /home/sbocanci/.local/share/virtualenvs/django_tuto-SIq5Ifcc
...
```
The path also can be verified by running `pipenv --venv`.    

To hook VSCode to this virtual environment automatically:  
- in command palette (Ctrl+Shift+P) type `Python: Select Interpreter` and select the virtual environment path from above.  
- or use the `add interpreter` option to add the virtual environment path from above adding `/bin/python' at the end.  

5) Activating the virtual environment.  

The environment must be automatically activated when the VSCode is opened.  

To activate the virtual environment manually from terminal window:    
`pipenv shell` - to activate the virtual environment.  

#### 2. Creating a new Django project  

1) Creating a new Django project.  
`django-admin` - to check if Django is installed. Also shows the available commands.  

`django-admin startproject ft_transcendence` - to create a new Django project.  

This will create a new directory `ft_transcendence` which is the Django project.  

2) Running the Django server.  
From the project directory (same directory with `manage.py` file) run:  

`python manage.py runserver` - to run the Django server.  

### USER MANAGEMENT MODULE  

#### 1. Creating a new Django app for user management  

1) Creating a new Django app for user management.  

`python manage.py startapp users` - to create a new Django app.  

This will create a new directory `users` with similar structure to the project directory.  

2) Adding the new app to the project.  
In the `ft_transcendence/settings.py` file adding the new app to the `INSTALLED_APPS` list.  

```python
INSTALLED_APPS = [
	...
	'users',
]
```

3) Adding the reference to the new app in the project's `ft_transcendence/urls.py` file.  

```python
...
from django.contrib import admin
from django.urls import path, include
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
	path('', views.homepage), # this will render the homepage view from the same directory
	path('users/', include('users.urls')), # this will include the urls from the users app
]
```

4) Adding the `templates` directory to the project. 

At the same level with `ft_transcendence`, `users` directories and `manage.py` file, create a new directory `templates`.  

In the `ft_transcendence/settings.py` file add the new directory to the `TEMPLATES` list.  

```python
...
TEMPLATES = [
	{
		...
		'DIRS': ['templates'],
		...
	},
]
...
```

5) Creating a new `layout.html` file in the `templates` directory.  

This file will contain the base HTML structure for the project.  

In the `templates/layout.html` file:  

```html
<!DOCTYPE html>
{% load static %}
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>
		{% block title %}
			ft_transcendence
		{% endblock %}
	</title>
</head>
<body>
	<nav>
		<a href="/" title="HOME">Home</a> |
		<a href="{% url 'users:login' %}" title="LOGIN">User Login</a> |
		<a href="{% url 'users:register' %}" title="REGISTER">Registration</a>
	</nav>

	<main>
		{% block content %}
		{% endblock %}
	</main>
</body>
</html>

```

6) Creating a new `home.html` file in the `templates` directory.  

This file will contain the HTML code for the homepage.  

In the `templates/home.html` file:  

```html
{% extends 'layout.html' %}

{% block content %}
	<h1>Welcome to ft_transcendence</h1>
{% endblock %}
```
**NOTE**: In the `views.py` file has been referenced in `ft_transcendence/urls.py` file (step 3).  

7) Creating `views.py` file in the `ft_transcendence` directory.  

In `ft_transcendence/views.py` file:  

```python
from django.shortcuts import render

def homepage(request):
	return render(request, 'home.html')
```

This will render the `home.html` file when the homepage is accessed.  


8) Creating `urls.py` file in the `users` directory.  

This file will contain the URL patterns for the users app.  
In the `users/urls.py` file:  

```python
from django.urls import path
from . import views

app_name = 'users' # this is NECESSARY for the {% url %} template tag used in `layout.html`

urlpatterns = [
	path('register/', views.register_view, name='register'),
	path('login/', views.login_view, name='login'),
	path('logout/', views.logout_view, name='logout'),
]
```

9) Creating `views.py` file in the `users` directory.  

This file will contain the views / functions to handle the logic and renderings respective pages.  

In the `users/views.py` file:  

```python
from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import authenticate, login, logout

def register_view(request):
	if request.method == 'POST':
		form = UserCreationForm(request.POST)
		if form.is_valid():
			login(request, form.save())
			return redirect('home')
	else:
		form = UserCreationForm()
	return render(request, 'users/register.html', {'form': form})
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 

def login_view(request):
	if request.method == 'POST':
		form = AuthenticationForm(data=request.POST)
		if form.is_valid():
			login(request, form.get_user())
			if 'next' in request.POST:
				return redirect(request.POST.get('next'))
			else:
				return redirect('home')
	else:
		form = AuthenticationForm()
	return render(request, 'users/login.html', {'form': form})
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 

def logout_view(request):
	if request.method == 'POST':
		logout(request)
		return redirect('home')
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 

```

10) Creating `register.html` file in the `users/templates/users` directory.  

This file will contain the HTML code for the registration page.  
In the `users/templates/users/register.html` file:  

```html
{% extends 'layout.html' %}

{% block content %}
	<h2>Register</h2>
	<form method="POST">
		{% csrf_token %}
		{{ form.as_p }}
		<button type="submit">Register</button>
	</form>
{% endblock %}
```

11) Creating `login.html` file in the `users/templates/users` directory.  

This file will contain the HTML code for the login page.  
In the `users/templates/users/login.html` file:  

```html
{% extends 'layout.html' %}

{% block content %}
	<h2>Login</h2>
	<form method="POST">
		{% csrf_token %}
		{{ form.as_p }}
		<button type="submit">Login</button>
	</form>
{% endblock %}
```

...


