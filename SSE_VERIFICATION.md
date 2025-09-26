# SSE Event Verification - Mining System

## Server-Side SSE Implementation

Based on analysis of the server code at `/Users/tiendungnguyen/CodeSpace/opai/api-server-onchain`, here's how SSE events work:

### 1. SSE Endpoint

- **URL**: `/workers/events`
- **Headers Required**:
  - `Authorization: Bearer <token>`
  - Response headers set by server:
    - `Content-Type: text/event-stream`
    - `Cache-Control: no-cache`
    - `Connection: keep-alive`

### 2. Event Types

The server emits the following SSE events:

#### a) **"assignment" Event**

Emitted when new assignments are available for the worker.

**Event Format**:

```
event: assignment
data: {"count": <number>, "search_query_id": "<string>"}
```

**When Triggered**:

1. During heartbeat when tasks are auto-assigned (line 255 in workers/index.ts)
2. When a new search query creates tasks (mining/query.ts)
3. When stale tasks are reassigned to online workers (mining-tasks.ts)
4. Manual reassignment by admin

#### b) **Keep-Alive**

Server sends periodic keep-alive messages to maintain connection:

```
:keep-alive
```

Sent every `SSE_HEARTBEAT_INTERVAL_MS` (defined in constants/scheduling)

### 3. Assignment Auto-Assignment Flow

When a worker sends a heartbeat (`POST /workers/heartbeat`):

1. Server updates worker's last_seen_at timestamp
2. Attempts to auto-assign up to 8 pending tasks (`ASSIGN_ON_HEARTBEAT_LIMIT`)
3. Respects worker platform preferences (google/twitter)
4. If tasks assigned, emits "assignment" event via SSE
5. Has cooldown of 8 seconds (`ASSIGN_ON_HEARTBEAT_COOLDOWN_SECONDS`)

### 4. Worker Preferences

Workers can set platform preferences:

- **GET /workers/preferences** - Get current preferences
- **PUT /workers/preferences** - Set platforms: ['google', 'twitter']

Server respects these when assigning tasks.

### 5. Test Script Verification

The test script (`test-mining-flow.ts`) shows proper SSE usage:

1. Opens SSE connection with auth token
2. Listens for "assignment" events
3. Parses JSON data from events
4. Counts assignment events per worker

## Client-Side Implementation Issues Found

### Current Implementation (MiningWorkerV2)

✅ **Correct**:

- Connects to SSE endpoint with proper headers
- Handles reconnection with backoff
- Parses SSE events

❌ **Issues**:

1. Not parsing the event data JSON correctly
2. Missing proper event type detection

### Fix Needed in MiningWorkerV2

The `handleSseEvent` method should parse the JSON data:

```typescript
private handleSseEvent(raw: string) {
  if (!this.running) {
    return
  }

  let eventType = 'message'
  let eventData = ''

  for (const line of raw.split('\n')) {
    if (line.startsWith('event:')) {
      eventType = line.slice(6).trim()
    } else if (line.startsWith('data:')) {
      eventData += `${line.slice(5).trim()}\n`
    }
  }

  eventData = eventData.trim()

  // Parse assignment events
  if (eventType === 'assignment') {
    try {
      const data = JSON.parse(eventData)
      log.info(`[mining] Assignment event received: ${data.count} tasks, query: ${data.search_query_id}`)
      // Trigger assignment processing
      void this.processAssignments()
    } catch (error) {
      log.error('[mining] Failed to parse assignment event:', error)
    }
  }
}
```

## How Assignment Distribution Works

1. **Query Submission**: User submits a mining query
2. **Task Creation**: Server creates mining tasks from the query
3. **Task Assignment**:
   - Immediate: During query creation, assigns to online workers
   - Heartbeat: Auto-assigns during worker heartbeats
   - SSE Event: Notifies workers via "assignment" event
4. **Worker Processing**:
   - Receives SSE event
   - Fetches assignments via GET /mining/assignments
   - Processes Google platform tasks with crawler
   - Submits results

## Verification Steps

To verify SSE is working:

1. **Check Connection**:

   - Look for log: `[mining] Connected to miner SSE stream`

2. **Monitor Events**:

   - Add logging in `handleSseEvent` to see raw events
   - Should see periodic `:keep-alive` messages
   - Should see `event: assignment` when tasks available

3. **Test Assignment**:
   - Send heartbeat → Should trigger auto-assignment if tasks pending
   - Submit query → Should trigger assignment event to online workers

## Worker Lifecycle

1. **Start**: Connect SSE, set preferences, send heartbeat
2. **Maintain**: Keep SSE connected, send periodic heartbeats
3. **Process**: Listen for assignment events, fetch and process tasks
4. **Submit**: Complete assignments with crawled content
5. **Stop**: Close SSE, stop heartbeats

This architecture ensures:

- Real-time task distribution
- Automatic task assignment
- Platform preference respect
- Connection resilience
