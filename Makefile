SERIAL_PORT ?= /dev/cu.usbmodem2102
BAUD_RATE ?= 9600

.PHONY: free-serial
free-serial:
	@pids=$$(lsof -t $(SERIAL_PORT) 2>/dev/null); \
	if [ -z "$$pids" ]; then \
		echo "No process using $(SERIAL_PORT)"; \
	else \
		echo "Killing $$pids using $(SERIAL_PORT)"; \
		kill -9 $$pids; \
	fi

.PHONY: start
start:
	SERIAL_PORT=$(SERIAL_PORT) BAUD_RATE=$(BAUD_RATE) npm start
