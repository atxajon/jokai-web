#!/bin/bash
cd "$(dirname "$0")"
echo "Jokai web -> http://localhost:8000  (Ctrl+C para parar)"
python3 -m http.server 8000
