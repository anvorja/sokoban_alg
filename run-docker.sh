#!/bin/bash
if [ "$#" -ne 1 ]; then
  echo "Uso: ./run-docker.sh <archivo_nivel>"
  exit 1
fi

docker run --rm -v "$(pwd):/app" sokoban npm start -- "$@"
