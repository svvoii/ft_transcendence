REEN = \033[0;32m
RED = \033[0;31m
MAGENTA = \033[0;35m
CYAN = \033[0;36m
NC = \033[0m


build:
	@echo -e "${GREEN}Building the project...${NC}"
	docker-compose build

build-no-cache:
	@echo -e "${RED}Building the project without cache...${NC}"
	docker-compose build --no-cache

# If there are no certificates this must be run first before everything else. It will take some time.
get-cert:
	@echo -e "${GREEN}Getting sertificates...${NC}"
	docker-compose build certbot
	docker-compose run --rm certbot

up:
	@echo -e "${GREEN}Starting the project...${NC}"
	docker-compose up

down:
	@echo -e "${RED}Stopping the project...${NC}"
	docker stop $$(docker ps -a -q) 2>/dev/null || true

rm:
	@echo -e "${RED}Removing the images...${NC}"
	docker rm $$(docker ps -a -q) 2>/dev/null || true
	docker rmi $$(docker images -q) --force 2>/dev/null || true

rmvol64:
	@echo -e "${RED}Removing the volumes with the name length of 64...${NC}"
	docker volume ls -q | awk 'length($0) == 64' | xargs -r docker volume rm 2>/dev/null || true

# rmvol: rm
# 	@echo -e "${RED}Removing the volumes...${NC}"
# 	docker volume rm $$(docker volume ls -q) 2>/dev/null || true

ls:
	@echo -e "${MAGENTA}-> Docker images:${NC}" && docker images
	@echo -e "${MAGENTA}-> Docker containers:${NC}" && docker ps -a
	@echo -e "${MAGENTA}-> Docker volumes:${NC}" && docker volume ls

logs:
	docker compose logs -f

clean-migrations:
	@echo -e "${RED}Cleaning migration files...${NC}"
	find . -path "*/migrations/*.py" ! -name "__init__.py" -delete

clean: down rm rmvol64 clean-migrations
	@echo -e "${RED}Cleaning all...${NC}"

re: clean up

enter-web-app:
	docker exec -it web-app bash

enter-proxy:
	docker exec -it proxy bash

status:
	docker ps -a && docker images && docker volume ls && docker network ls