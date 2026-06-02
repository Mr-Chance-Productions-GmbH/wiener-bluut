# =============================================================
# Wiener Bluut — site
# =============================================================
SITE_DIR := docs
PORT     := 8000

.DEFAULT_GOAL := help
.PHONY: help serve

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[1m%-8s\033[0m %s\n", $$1, $$2}'

serve: ## Serve the site locally (http://localhost:8000)
	cd $(SITE_DIR) && python3 -m http.server $(PORT)
