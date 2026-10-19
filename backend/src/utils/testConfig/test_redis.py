from src.utils.config.redis_client import redis_client
redis_client.set("test", "Hello from FastAPI")

print(redis_client.get("test"))