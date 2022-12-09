FROM python:3

WORKDIR /app
COPY . .
RUN setup.sh

ENTRYPOINT ["/bin/bash", "start.sh"]
