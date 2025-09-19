# Axios Clients

This directory contains the HTTP client setup for connecting to multiple backend services.

## Available Clients

All clients are now consolidated in `axios.ts`:

### 1. **apiClient** - Main API Server
- **Base URL**: `https://api.optimai.network` (or from `VITE_API_URL`)
- **Purpose**: General API operations (user, auth, app features)
- **Features**: Automatic token injection, 401 refresh handling
- **Usage**:
```typescript
import { apiClient } from '@/libs/axios'
const user = await apiClient.get('/user/profile')
```

### 2. **minerClient** - Miner/Blockchain Server
- **Base URL**: `https://api-onchain-staging.optimai.network` (or from `VITE_MINER_URL`)
- **Purpose**: Blockchain and mining operations
- **Features**: Same auth handling as apiClient, custom headers
- **Usage**:
```typescript
import { minerClient } from '@/libs/axios'
const stats = await minerClient.get('/mining/stats')
```

### 3. **localClient** - Local CLI Server
- **Base URL**: Dynamically fetched via IPC (`http://127.0.0.1:<port>`)
- **Purpose**: Control the wrapped node-cli process
- **Features**:
  - No authentication (local only)
  - Port fetched from IPC on each request
  - Supports all HTTP methods (GET, POST, PUT, PATCH, DELETE)
  - WebSocket URL generation
- **Usage**:
```typescript
import { localClient } from '@/libs/axios'

// Regular HTTP requests
const status = await localClient.get('/node/status')
await localClient.post('/node/start')

// Get WebSocket URL
const wsUrl = await localClient.getWebSocketURL()
const ws = new WebSocket(wsUrl)
```

## Key Design Decisions

1. **Three Separate Clients**: Clear separation of concerns for different backend services
2. **Dynamic Port for Local Client**: Uses IPC to get port on each request, avoiding initialization issues
3. **Shared Auth Logic**: `apiClient` and `minerClient` share authentication interceptors
4. **No Authentication for Local**: Local CLI is trusted as it runs on localhost
5. **Single File**: All clients consolidated in `axios.ts` for simplicity

## Environment Variables

Add these to your `.env` file:
```env
VITE_API_URL=https://api.optimai.network
VITE_MINER_URL=https://api-onchain-staging.optimai.network
```