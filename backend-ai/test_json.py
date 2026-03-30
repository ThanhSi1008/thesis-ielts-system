import json
s = '{"a": "b\nc"}'
try:
    print(json.loads(s))
except Exception as e:
    print(f"Normal fail: {e}")
try:
    print(json.loads(s, strict=False))
except Exception as e:
    print(f"Strict fail: {e}")
