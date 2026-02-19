#!/bin/bash
# Test proxy with real OpenAI call. Requires OPENAI_API_KEY in .env and backend running.
set -e
BACKEND_URL="${BACKEND_URL:-http://localhost:8000}"
echo "Testing proxy at $BACKEND_URL"
curl -s -X POST "$BACKEND_URL/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"Say hello in one word"}]}' \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('carbon_estimate_kg_co2eq:', d.get('carbon_estimate_kg_co2eq')); print('content:', d.get('choices',[{}])[0].get('message',{}).get('content',''))"
