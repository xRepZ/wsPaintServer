#! /bin/bash

# migrate create -ext sql -dir database/migration/ init

migrate -path . -database 'mysql://dakz:123321@tcp(localhost:3306)/todo' up

