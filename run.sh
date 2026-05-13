#!/bin/bash
if [ "$#" -ne 1 ]; then
  echo "Uso: ./run.sh <archivo_nivel>"
  exit 1
fi

npm start -- "$@"
