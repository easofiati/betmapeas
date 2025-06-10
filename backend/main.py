import logging
import json


class JsonFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            'level': record.levelname,
            'timestamp': self.formatTime(record, self.datefmt),
            'message': record.getMessage(),
            'name': record.name,
        }
        return json.dumps(log_record)


logging.basicConfig(level=logging.INFO, handlers=[logging.StreamHandler()])
logger = logging.getLogger("betmapeas")
for handler in logger.handlers:
    handler.setFormatter(JsonFormatter())


def main():
    logger.info("Backend iniciado com logging estruturado em JSON.")


if __name__ == "__main__":
    main()
