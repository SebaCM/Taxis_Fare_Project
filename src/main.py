import redis

# Connect to Redis
redis_client = redis.StrictRedis(host='localhost', port=6379, decode_responses=True)

# Simple Example: Set and Get
redis_client.set('example_key', 'value')
value = redis_client.get('example_key')
print(value)  # Output: value