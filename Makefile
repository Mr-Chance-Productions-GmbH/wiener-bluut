# =============================================================
# Wiener Bluut — site orchestration
# =============================================================
SITE_DIR := site
PORT     := 8000
NETLIFY  := npx netlify-cli

.DEFAULT_GOAL := help
.PHONY: help serve login preview deploy status open

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[1m%-10s\033[0m %s\n", $$1, $$2}'

serve: ## Serve the site locally (default http://localhost:8000)
	cd $(SITE_DIR) && python3 -m http.server $(PORT)

login: ## Authenticate the Netlify CLI (opens a browser)
	$(NETLIFY) login

preview: ## Deploy a draft and print a temporary obscure URL (for feedback)
	$(NETLIFY) deploy

deploy: ## Deploy to the site's stable production URL
	$(NETLIFY) deploy --prod

status: ## Show the linked Netlify site and account
	$(NETLIFY) status

open: ## Open the live site in a browser
	$(NETLIFY) open:site
