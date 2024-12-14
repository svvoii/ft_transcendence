FROM certbot/certbot:v1.27.0

RUN apk add --no-cache bash netcat-openbsd

COPY certify-init.sh /opt/certify-init.sh
RUN chmod +x /opt/certify-init.sh

ENTRYPOINT []
CMD ["certbot", "renew"]