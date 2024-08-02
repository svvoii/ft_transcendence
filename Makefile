GREEN = \033[0;32m
RED = \033[0;31m
MAGENTA = \033[0;35m
CYAN = \033[0;36m
NC = \033[0m


build:
	@echo "${GREEN}Building the project...${NC}"
	docker-compose build

build-no-cache:
	@echo "${RED}Building the project without cache...${NC}"
	docker-compose build --no-cache

up:
	@echo "${GREEN}Starting the project...${NC}"
	docker-compose up

up-db:
	@echo "${GREEN}Starting container with database only...${NC}"
	docker-compose up -d db

down:
	@echo "${RED}Stopping the project...${NC}"
	docker stop $$(docker ps -a -q) 2>/dev/null || true
	docker rm $$(docker ps -a -q) 2>/dev/null || true

rmi:
	@echo "${RED}Removing the images...${NC}"
	docker rmi $$(docker images -q) --force 2>/dev/null || true

rmvol:
	@echo "${RED}Removing the volumes...${NC}"
	docker volume rm $$(docker volume ls -q) 2>/dev/null || true

ls:
	@echo "${MAGENTA}-> Docker images:${NC}" && docker images
	@echo "${MAGENTA}-> Docker containers:${NC}" && docker ps -a
	@echo "${MAGENTA}-> Docker volumes:${NC}" && docker volume ls

clean:
	@echo "${RED}Cleaning all...${NC}"
	make down
	make rmi
	make rmvol

