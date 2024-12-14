#!/bin/bash

# Waiting for proxy to be ready, then start certbot

set -e

echo "Certifying domain: $DOMAIN"
echo "Using email: $EMAIL"

# Wait for proxy to be ready
until nc -z proxy 80; do
	echo "Waiting for proxy to be ready..."
	sleep 5s & wait ${!}
done

echo "Proxy is ready, starting certbot..."

certbot certonly \
	--webroot \
	--webroot-path "/vol/www/" \
	-d "$DOMAIN" \
	--email "$EMAIL" \
	--rsa-key-size 2048 \
	--agree-tos \
	--non-interactive