#!bin/bash

set -e

echo "CHeck ofr dhparams.pem"

if [ ! -f /vol/proxy/ssl-dhparams.pem ]; then
	echo "dhparams.pem not found, generating..."
	openssl dhparam -out /vol/proxy/ssl-dhparams.pem 4096
fi

# Avoid replacing the env vars in the template
export host=\$host
export request_uri=\$request_uri

echo "Check for fullchain.pem"

if [ ! -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]; then
	echo "fullchain.pem not found, passing through http..."

	envsubst < /etc/nginx/default.conf.tpl > /etc/nginx/conf.d/default.conf
else
	echo "ssl cert exist / fullchain.pem found, passing through https..."

	envsubst < /etc/nginx/default-ssl.conf.tpl > /etc/nginx/conf.d/default.conf
fi

echo "Starting nginx..."

nginx -g "daemon off;"
