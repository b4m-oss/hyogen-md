APP_DIR := app
PG_DIR := playground
NPM := npm --prefix $(APP_DIR)
NPM_PG := npm --prefix $(PG_DIR)

.DEFAULT_GOAL := help

.PHONY: help install install-pg install-all \
	build typecheck test test-watch test-pg test-all \
	dev dev-pg clean clean-pg clean-all \
	pack size check

help: ## Show available targets
	@printf "Usage: make [target]\n\nTargets:\n"
	@grep -E '^[a-zA-Z0-9_.-]+:.*##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "}; {printf "  %-14s %s\n", $$1, $$2}'

install: ## Install app/ dependencies
	$(NPM) install

install-pg: ## Install playground/ dependencies
	$(NPM_PG) install

install-all: install install-pg ## Install app + playground dependencies

build: ## Build library into app/dist (minified)
	$(NPM) run build

typecheck: ## Typecheck app/
	$(NPM) run typecheck

test: ## Run app/ Vitest once
	$(NPM) run test

test-watch: ## Run app/ Vitest in watch mode
	$(NPM) run test:watch

test-pg: ## Run playground/ Vitest once
	$(NPM_PG) run test

test-all: test test-pg ## Run app + playground tests

dev: ## Watch-build app/ library
	$(NPM) run dev

dev-pg: ## Start playground Vite dev server
	$(NPM_PG) run dev

clean: ## Remove app/dist (keeps node_modules)
	rm -rf $(APP_DIR)/dist

clean-pg: ## Remove playground/dist
	rm -rf $(PG_DIR)/dist

clean-all: clean clean-pg ## Remove build outputs
	rm -rf $(APP_DIR)/coverage $(PG_DIR)/coverage

pack: build ## npm pack --dry-run (shows tarball contents/size)
	@cd $(APP_DIR) && $(NPM) pack --dry-run

size: build ## Report dist JS / gzip / npm pack sizes
	@node scripts/report-size.mjs

check: typecheck test build pack ## Pre-publish: typecheck + test + build + pack dry-run
	@echo "check OK"
