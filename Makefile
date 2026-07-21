APP_DIR := app
PG_DIR := playground
DOCS_DIR := docs-site
NPM := npm --prefix $(APP_DIR)
NPM_PG := npm --prefix $(PG_DIR)
NPM_DOCS := npm --prefix $(DOCS_DIR)

.DEFAULT_GOAL := help

.PHONY: help install install-pg install-docs install-all \
	build typecheck test test-watch test-pg test-all \
	dev dev-pg dev-docs clean clean-pg clean-docs clean-all \
	pack size check build-docs check-docs

help: ## Show available targets
	@printf "Usage: make [target]\n\nTargets:\n"
	@grep -E '^[a-zA-Z0-9_.-]+:.*##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "}; {printf "  %-14s %s\n", $$1, $$2}'

install: ## Install app/ dependencies
	$(NPM) install

install-pg: ## Install playground/ dependencies
	$(NPM_PG) install

install-docs: ## Install docs-site/ dependencies
	$(NPM_DOCS) install

install-all: install install-pg install-docs ## Install app + playground + docs-site dependencies

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

dev-docs: ## Start docs-site Nuxt dev server
	$(NPM_DOCS) run dev

build-docs: ## Generate static docs-site into docs-site/.output/public
	$(NPM_DOCS) run generate

clean: ## Remove app/dist (keeps node_modules)
	rm -rf $(APP_DIR)/dist

clean-pg: ## Remove playground/dist
	rm -rf $(PG_DIR)/dist

clean-docs: ## Remove docs-site build outputs
	rm -rf $(DOCS_DIR)/.output $(DOCS_DIR)/.nuxt $(DOCS_DIR)/.nitro $(DOCS_DIR)/.cache $(DOCS_DIR)/dist

clean-all: clean clean-pg clean-docs ## Remove build outputs
	rm -rf $(APP_DIR)/coverage $(PG_DIR)/coverage

pack: build ## npm pack --dry-run (shows tarball contents/size)
	@cd $(APP_DIR) && $(NPM) pack --dry-run

size: build ## Report dist JS / gzip / npm pack sizes
	@node scripts/report-size.mjs

check: typecheck test build pack ## Pre-publish: typecheck + test + build + pack dry-run
	@echo "check OK"

check-docs: build-docs ## Verify docs-site static generation
	@echo "check-docs OK"
