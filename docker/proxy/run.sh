#!bin/bash

set -e

echo "Check for dhparams.pem.."

if [ ! -f /vol/proxy/ssl-dhparams.pem ]; then
	echo "dhparams.pem not found, generating..."
	openssl dhparam -out /vol/proxy/ssl-dhparams.pem 2048
else
	echo "dhparams.pem found in /vol/proxy, using it..."
fi

# Avoid replacing the env vars in the template
export host=\$host
export request_uri=\$request_uri
export remote_addr=\$remote_addr
export proxy_add_x_forwarded_for=\$proxy_add_x_forwarded_for
export scheme=\$scheme
export server_port=\$server_port
export http_upgrade=\$http_upgrade

echo "DOMAIN: $DOMAIN"
echo "Check for fullchain.pem.."

if [ ! -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]; then
	echo "fullchain.pem not found, passing through http..."
	envsubst < /etc/nginx/default.conf.tpl > /etc/nginx/conf.d/default.conf
else
	echo "ssl cert exist / fullchain.pem found, passing through https..."
	envsubst < /etc/nginx/default-ssl.conf.tpl > /etc/nginx/conf.d/default.conf
fi

# Print the final config file for debugging
# echo "Generated /etc/nginx/conf.d/default.conf:"
# cat /etc/nginx/conf.d/default.conf

echo "Starting nginx..."

nginx -g "daemon off;"
