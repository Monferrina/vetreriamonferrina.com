# Makefile — Vetreria Monferrina

start:
	docker compose up --build -d
	@echo "Sito avviato su http://localhost:4321"

stop:
	docker compose down

logs:
	docker logs -f MonferrinaProject

test:
	docker compose -f docker-compose.test.yml up --build --abort-on-container-exit
