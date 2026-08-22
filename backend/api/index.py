from pathlib import Path
import sys

backend_root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(backend_root))

from app.main import app as fastapi_app


async def app(scope, receive, send):
	if scope["type"] == "http":
		path = scope["path"]
		for prefix in ("/api/index.py", "/api/index", "/api"):
			if path == prefix:
				scope["path"] = "/"
				break
			if path.startswith(prefix + "/"):
				scope["path"] = path[len(prefix):]
				break
	await fastapi_app(scope, receive, send)
