from django.shortcuts import render


def home_view(request, *args, **kwargs):
	context = {}
	return render(request, "a_homepage/home.html", context)

