FROM nginx:1.23.0-alpine

COPY ./nginx/* /etc/nginx/
COPY ./run.sh /run.sh

RUN apk add --no-cache bash openssl
RUN chmod +x /run.sh

CMD ["/run.sh"]
