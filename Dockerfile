FROM python:3.12-slim

# Seting working directory in the container:
WORKDIR /app

# Installing dependencies for psycopg2:
RUN apt-get update && apt-get install -y \
	build-essential \
	libpq-dev \
	&& rm -rf /var/lib/apt/lists/*

# Installing dependencies for the project:
RUN pip install --upgrade pip pipenv
COPY Pipfile ./
RUN pipenv install --system --skip-lock

# Copy the current directory contents into the working directory:
COPY . .
RUN chmod +x /app/entrypoint.sh
