from django.shortcuts import render


def home_view(request, *args, **kwargs):
	context = {}
	return render(request, "homepage/home.html", context)

