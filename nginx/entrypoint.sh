#!/bin/bash

echo "Generating self-signed certificates."
mkdir -p /etc/nginx/certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/certs/selfsigned.key -out /etc/nginx/certs/selfsigned.crt -subj "/CN=localhost"

nginx -g "daemon off;"
