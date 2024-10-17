from django.shortcuts import render

# Create your views here.
def index(request, pk=None):
  return render(request, "index.html")