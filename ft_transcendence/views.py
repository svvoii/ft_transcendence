from django.shortcuts import render

def homepage(request):
	return render(request, 'home.html')

# def login(request):
	# return render(request, 'login.html')
