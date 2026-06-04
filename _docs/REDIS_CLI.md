# Redis CLI Interactive Guide

Since the Redis caching database runs inside a local Docker container (`toeic-redis`), you can open a terminal and connect to it directly without installing any local Redis binaries.

## 1. Connecting to the Database
Run the following command in your terminal to open the interactive CLI:
```bash
docker exec -it toeic-redis redis-cli
```
Your prompt will change to:
```text
127.0.0.1:6379>
```

---

## 2. Essential Commands

### 🔍 Inspecting Caching Keys
* **List all active cache keys**:
  ```text
  KEYS *
  ```
* **Read JSON cache value** (e.g. cached vocabulary books catalog):
  ```text
  GET vocabulary:books
  ```
* **Verify Key TTL** (Check how many seconds are remaining before the key is auto-evicted):
  ```text
  TTL vocabulary:books
  ```

### 🧹 Cache Maintenance
* **Delete a single cache key**:
  ```text
  DEL vocabulary:books
  ```
* **Clear the entire Redis database** (Flushes all tables, sessions, and queues):
  ```text
  FLUSHALL
  ```

### 🚪 Disconnecting
* **Exit the interactive prompt**:
  ```text
  exit
  ```
