FROM nginx:latest

# Install Certbot and OpenSSL
RUN apt-get update && apt-get install -y certbot python3-certbot-nginx openssl cron

# Copy Nginx configuration file
COPY nginx.conf /etc/nginx/nginx.conf

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Create directories for Certbot webroot and certificates
RUN mkdir -p /var/lib/letsencrypt/webroot /etc/nginx/certs

CMD ["/entrypoint.sh"]
