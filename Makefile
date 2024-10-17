GREEN = \033[0;32m
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

up: build
	@echo -e "${GREEN}Starting the project...${NC}"
	docker-compose up -d

up-db:
	@echo -e  "${GREEN}Starting container with database only...${NC}"
	docker-compose up -d db

up-redis:
	@echo -e "${GREEN}Starting container with redis only...${NC}"
	docker-compose up -d redis

down:
	@echo -e "${RED}Stopping the project...${NC}"
	docker stop $$(docker ps -a -q) 2>/dev/null || true
	docker rm $$(docker ps -a -q) 2>/dev/null || true

rmi:
	@echo -e "${RED}Removing the images...${NC}"
	docker rmi $$(docker images -q) --force 2>/dev/null || true

rmvol:
	@echo -e "${RED}Removing the volumes...${NC}"
	docker volume rm $$(docker volume ls -q) 2>/dev/null || true

ls:
	@echo -e "${MAGENTA}-> Docker images:${NC}" && docker images
	@echo -e "${MAGENTA}-> Docker containers:${NC}" && docker ps -a
	@echo -e "${MAGENTA}-> Docker volumes:${NC}" && docker volume ls

logs:
	docker compose logs -f

clean-migrations:
	@echo -e "${RED}Cleaning migration files...${NC}"
	find . -path "*/migrations/*.py" ! -name "__init__.py" -delete

clean: down rmi rmvol
	@echo -e "${RED}Cleaning all...${NC}"

re: clean up

enter-web-app:
	docker exec -it web-app bash

status:
	docker ps -a && docker images && docker volume ls && docker network ls