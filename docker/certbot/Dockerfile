FROM sertbot/certbot:latest

COPY sertify-init.sh /opt/sertify-init.sh
RUN chmod +x /opt/sertify-init.sh

ENTRYPOINT []
CMD ["certbot", "renew"]
