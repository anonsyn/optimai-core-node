# OptimAI Core Node - Error Code Reference

This document lists all error codes used in the OptimAI Core Node application.

## Error Code Format

Format: `CATEGORY_NNNN`

- **CATEGORY**: Error category (AUTH, DOCKER, MINING, etc.)
- **NNNN**: Numeric code within category (e.g., 1001, 2001)

## Authentication Errors (AUTH_10xx)

| Code          | Description              | Common Causes                      | Resolution                 |
| ------------- | ------------------------ | ---------------------------------- | -------------------------- |
| **AUTH_1001** | No authentication tokens | Session expired or never logged in | Please log in again        |
| **AUTH_1002** | User fetch failed        | Network issue or API unavailable   | Check connection and retry |
| **AUTH_1003** | User payload missing     | Invalid API response               | Contact support            |
| **AUTH_1004** | No refresh token         | Refresh token not stored           | Log in again               |
| **AUTH_1005** | Token refresh failed     | Refresh token expired              | Log in again               |

## Docker Errors (DOCKER_20xx)

| Code            | Description               | Common Causes                   | Resolution                          |
| --------------- | ------------------------- | ------------------------------- | ----------------------------------- |
| **DOCKER_2001** | Docker not installed      | Docker Desktop not on system    | Install Docker Desktop              |
| **DOCKER_2002** | Docker daemon not running | Docker Desktop not started      | Start Docker Desktop                |
| **DOCKER_2003** | Docker CLI not found      | Docker not in PATH              | Reinstall Docker or set DOCKER_PATH |
| **DOCKER_2004** | Container not running     | Container stopped or failed     | Restart the container               |
| **DOCKER_2005** | Health check failed       | Container unhealthy             | Check container logs                |
| **DOCKER_2006** | Image pull failed         | Network issue or invalid image  | Check connection and retry          |
| **DOCKER_2007** | Container run failed      | Port conflict or resource issue | Check Docker resources              |
| **DOCKER_2008** | Container start failed    | Container in bad state          | Remove and recreate container       |
| **DOCKER_2009** | Container stop failed     | Container frozen                | Force stop or restart Docker        |
| **DOCKER_2010** | Container restart failed  | Container in bad state          | Remove and recreate container       |

## Mining Worker Errors (MINING_30xx)

| Code            | Description                | Common Causes                     | Resolution                          |
| --------------- | -------------------------- | --------------------------------- | ----------------------------------- |
| **MINING_3001** | Crawler init failed        | Docker issues or resource limits  | Check Docker and restart mining     |
| **MINING_3002** | Assignment already started | Another worker took it            | System will fetch new assignments   |
| **MINING_3003** | Platform mismatch          | Assignment for different platform | System will skip automatically      |
| **MINING_3004** | Task not assignable        | Task in wrong state               | System will skip automatically      |
| **MINING_3005** | Assignment not found       | Assignment removed/expired        | System will fetch new assignments   |
| **MINING_3006** | Not authorized             | Permission denied                 | Contact support                     |
| **MINING_3007** | Server error               | Backend API issue                 | Retry or wait for recovery          |
| **MINING_3008** | Network error              | Connection issue                  | Check network connection            |
| **MINING_3009** | No URL in assignment       | Invalid task data                 | System will skip automatically      |
| **MINING_3010** | No content crawled         | Site blocked or empty             | System will abandon task            |
| **MINING_3011** | SSE connection failed      | Network or server issue           | Connection will retry automatically |
| **MINING_3012** | Preferences update failed  | API issue                         | Non-critical, retry later           |
| **MINING_3013** | Heartbeat failed           | Network or API issue              | Will retry automatically            |
| **MINING_3014** | Missing user/device ID     | Session issue                     | Restart node or re-login            |
| **MINING_3015** | Assignment submit failed   | Network or API issue              | Retry submission                    |
| **MINING_3016** | Assignment abandon failed  | Network or API issue              | Retry abandon                       |
| **MINING_3017** | Assignment conflict        | Generic conflict                  | System will handle automatically    |

## Crawler Service Errors (CRAWLER_40xx)

| Code             | Description                | Common Causes                   | Resolution                       |
| ---------------- | -------------------------- | ------------------------------- | -------------------------------- |
| **CRAWLER_4001** | Service not initialized    | Called before initialization    | Wait for initialization          |
| **CRAWLER_4002** | Health check timeout       | Service slow to start           | Restart mining worker            |
| **CRAWLER_4003** | Session create failed      | Resource limits or API issue    | Restart crawler service          |
| **CRAWLER_4004** | Crawl failed               | Target site issue or timeout    | System will retry or abandon     |
| **CRAWLER_4005** | Restart failed             | Service in bad state            | Restart mining worker completely |
| **CRAWLER_4006** | Session destroy failed     | Non-critical cleanup issue      | Usually safe to ignore           |
| **CRAWLER_4007** | Service close failed       | Non-critical cleanup issue      | Usually safe to ignore           |
| **CRAWLER_4008** | Service URL unavailable    | Service not started properly    | Restart mining worker            |
| **CRAWLER_4009** | Service not healthy        | Service degraded or crashed     | Restart mining worker            |
| **CRAWLER_4010** | Endpoint resolution failed | Service didn't restart properly | Restart mining worker            |

## Uptime Tracking Errors (UPTIME_50xx)

| Code            | Description         | Common Causes         | Resolution                  |
| --------------- | ------------------- | --------------------- | --------------------------- |
| **UPTIME_5001** | User info missing   | Session expired       | Re-login to continue        |
| **UPTIME_5002** | Cycle too short     | Stopped too quickly   | System will skip report     |
| **UPTIME_5003** | Report failed       | Network or API issue  | Will retry automatically    |
| **UPTIME_5004** | Reward parse failed | Invalid API response  | Contact support if persists |
| **UPTIME_5005** | Tick error          | Internal timing issue | Will retry automatically    |

## Device Registration Errors (DEVICE_60xx)

| Code            | Description            | Common Causes        | Resolution                  |
| --------------- | ---------------------- | -------------------- | --------------------------- |
| **DEVICE_6001** | User not authenticated | Not logged in        | Log in before starting node |
| **DEVICE_6002** | Registration failed    | Network or API issue | Retry starting node         |
| **DEVICE_6003** | Device ID missing      | Invalid API response | Contact support             |
| **DEVICE_6004** | Response decode failed | Invalid API response | Contact support             |

## Node Runtime Errors (NODE_70xx)

| Code          | Description       | Common Causes               | Resolution             |
| ------------- | ----------------- | --------------------------- | ---------------------- |
| **NODE_7001** | Node start failed | See inner error for details | Check logs and retry   |
| **NODE_7002** | Node stop failed  | Service cleanup issue       | Usually safe to ignore |

## Crawl4AI Service Errors (CRAWL4AI_80xx)

| Code              | Description              | Common Causes              | Resolution              |
| ----------------- | ------------------------ | -------------------------- | ----------------------- |
| **CRAWL4AI_8001** | Container init failed    | Docker or resource issue   | Check Docker and retry  |
| **CRAWL4AI_8002** | Container stop failed    | Container frozen           | Force stop via Docker   |
| **CRAWL4AI_8003** | Container restart failed | Container in bad state     | Remove and recreate     |
| **CRAWL4AI_8004** | Status check failed      | Docker communication issue | Check Docker is running |

## Unknown Errors (UNKNOWN_99xx)

| Code              | Description         | Common Causes              | Resolution                     |
| ----------------- | ------------------- | -------------------------- | ------------------------------ |
| **UNKNOWN_ERROR** | Uncategorized error | Unexpected error condition | Check logs and contact support |

---

## For Support

When contacting support, please provide:

1. The error code (e.g., `MINING_3001`)
2. What you were doing when the error occurred
3. Application logs (found in app logs directory)
4. Your device information

## For Developers

See `src/main/errors/error-codes.ts` for the ErrorCode enum and `src/main/errors/error-factory.ts` for error creation helpers.
