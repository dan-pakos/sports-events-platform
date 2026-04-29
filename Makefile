
dev:
	@docker-compose -f docker-compose.yml --env-file .env.development up

restart:
	@docker-compose -f docker-compose.yml --env-file .env.development down
	@docker-compose -f docker-compose.yml --env-file .env.development build --no-cache
	@docker-compose -f docker-compose.yml --env-file .env.development up --force-recreate --renew-anon-volumes

down:
	@docker-compose -f docker-compose.yml --env-file .env.development down
