#!/bin/bash

# Function to generate self-signed certificates
generate_self_signed_cert() {
    mkdir -p /etc/nginx/certs
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/certs/selfsigned.key -out /etc/nginx/certs/selfsigned.crt -subj "/CN=localhost"
}

# Check if a domain is provided
if [ -z "$DOMAIN" ]; then
    echo "No domain provided. Generating self-signed certificates."
    generate_self_signed_cert
else
    echo "Domain provided: $DOMAIN. Obtaining certificates from Let's Encrypt."
    certbot certonly --webroot --webroot-path=/var/lib/letsencrypt/webroot -d $DOMAIN --non-interactive --agree-tos --email $EMAIL

    # Add a cron job to renew certificates
    echo "0 0 * * * certbot renew --webroot --webroot-path=/var/lib/letsencrypt/webroot --quiet && service nginx reload" > /etc/cron.d/certbot-renew
    cron
fi

service nginx start

# Keep the container running
tail -f /var/log/nginx/access.log
