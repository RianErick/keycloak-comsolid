.PHONY: up build update clean

MVN := mvn

ifneq (,$(wildcard .env))
include .env
export SPRING_DATASOURCE_URL
export SPRING_DATASOURCE_USERNAME
export SPRING_DATASOURCE_PASSWORD
export KEYCLOAK_SERVER_URL
export KEYCLOAK_REALM
export KEYCLOAK_CLIENT_ID
export KEYCLOAK_CLIENT_SECRET
endif

up:
	$(MVN) spring-boot:run

build:
	$(MVN) package

update:
	$(MVN) -U package

clean:
	$(MVN) clean
