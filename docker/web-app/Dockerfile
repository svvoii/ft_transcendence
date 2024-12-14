FROM python:3.12-slim

RUN apt-get update && apt-get install -y \
	build-essential \
	libpq-dev \
	&& rm -rf /var/lib/apt/lists/*

COPY ./docker/web-app/requirements.txt ./
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY ./_main_project /app

COPY ./docker/web-app/entrypoint.sh /entrypoint.sh

RUN ls -la
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/bin/bash", "/entrypoint.sh"]
