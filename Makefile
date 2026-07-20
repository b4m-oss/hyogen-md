APP_DIR := app
NPM := npm --prefix $(APP_DIR)

.DEFAULT_GOAL := help

.PHONY: help install build typecheck test test-watch dev clean

help: ## 利用可能なコマンド一覧
	@printf "Usage: make [target]\n\nTargets:\n"
	@grep -E '^[a-zA-Z0-9_.-]+:.*##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "}; {printf "  %-12s %s\n", $$1, $$2}'

install: ## app/ の依存関係をインストール
	$(NPM) install

build: ## Vite ライブラリビルド (app/dist)
	$(NPM) run build

typecheck: ## 型チェックのみ
	$(NPM) run typecheck

test: ## テスト実行 (Vitest)
	$(NPM) run test

test-watch: ## テスト監視 (Vitest watch)
	$(NPM) run test:watch

dev: ## 変更監視付きビルド (Vite watch)
	$(NPM) run dev

clean: ## ビルド成果物を削除
	rm -rf $(APP_DIR)/dist $(APP_DIR)/node_modules
