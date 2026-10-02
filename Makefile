.PHONY: dev build test lint-new

dev:
	npm run dev

build:
	npm run build

test:
	npm test

lint-new:
	npm run lint

# Override for a controller checkout outside the usual sibling directory.
SERVER_UI_DIR ?= ../fxcontrol/ui

.PHONY: sync-server-ui
sync-server-ui: build
	test -f "$(SERVER_UI_DIR)/assets.go"
	rm -rf "$(SERVER_UI_DIR)/dist"
	mkdir -p "$(SERVER_UI_DIR)/dist"
	cp -R dist/. "$(SERVER_UI_DIR)/dist/"
