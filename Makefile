.PHONY: install-hooks format check

install-hooks:
	git config core.hooksPath .githooks
	chmod +x .githooks/pre-commit

format:
	(cd frontend && bun run format)
	$(MAKE) -C backend format

check:
	(cd frontend && bun run check)
	$(MAKE) -C backend check
