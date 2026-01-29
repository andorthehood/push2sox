ifneq (,$(wildcard .env))
  include .env
  export
endif

.PHONY: free-serial
free-serial:
	@pids=$$(lsof -t $${SERIAL_PORT} 2>/dev/null); \
	if [ -z "$$pids" ]; then \
		echo "No process using $${SERIAL_PORT}"; \
	else \
		echo "Killing $$pids using $${SERIAL_PORT}"; \
		kill -9 $$pids; \
	fi

.PHONY: start
start:
	npm start
