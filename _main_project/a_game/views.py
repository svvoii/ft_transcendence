from django.shortcuts import render

from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["GET"])
def pong_test_func(request):
  retStr = "This is going to be legendary."
  data = { retStr }
  return Response(data)