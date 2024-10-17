from django.shortcuts import render
from .models import BlogPost
from .serializers import BlogPostSerializer
from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Create your views here.

class BlogPostListCreate(generics.ListCreateAPIView):
  queryset = BlogPost.objects.all()
  serializer_class = BlogPostSerializer

class BlogPostRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
  queryset = BlogPost.objects.all()
  serializer_class = BlogPostSerializer
  lookup_field = "pk"

@api_view(["GET"])
def api_http_test_func(request):
  p = 100
  retStr = "Value of p: " + str(p)
  data = { "message": retStr }
  return Response(data)

@api_view(["GET"])
def api_json_test_func(request):
  p = 100
  # print("Value of p:", p)
  data = { "Value of p": p }
  return Response(data)