# Makefile — Test in Docker per Vetreria Monferrina
# Uso: make test | make test-unit | make test-e2e | make clean

COMPOSE := docker compose -f docker-compose.test.yml

.PHONY: test test-unit test-e2e build clean logs-unit logs-e2e

## Esegui tutti i test (unit + e2e) in sequenza
test: test-unit test-e2e

## Test unitari (Vitest)
test-unit:
	$(COMPOSE) build unit
	$(COMPOSE) run --rm unit

## Test end-to-end (Playwright + Chromium)
test-e2e:
	$(COMPOSE) build e2e
	$(COMPOSE) run --rm e2e

## Build di produzione (verifica che la build compili)
build:
	$(COMPOSE) build --target build

## Rimuovi container, immagini e volumi dei test
clean:
	$(COMPOSE) down --rmi local --volumes --remove-orphans

## Log dell'ultimo run unit
logs-unit:
	docker logs MonferrinaProject-unit

## Log dell'ultimo run e2e
logs-e2e:
	docker logs MonferrinaProject-e2e
