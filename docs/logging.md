# Logging

File-based logging uses a consistent format across all logs:

```
{ISO timestamp} [LEVEL] {message} {optional JSON meta}
```

Example: `2026-03-07T12:30:45.123Z [INFO] Connection established {"remoteCount":1}`

## Log files

| File | Source | Contents |
|------|--------|----------|
| **logs/agent.log** | Voice agent | INFO, WARN, ERROR (default); DEBUG when enabled |
| **logs/error.log** | Next.js API, client | API and client-reported errors |

## LOG_LEVEL (.env.local)

Controls agent verbosity. Set in `.env.local` and restart the agent:

| Level | Agent logs |
|-------|------------|
| `error` | Errors only |
| `info` | Connection established, session started, agent state (listening → thinking → speaking), errors |
| `debug` | Above + user speech, transcripts, participant events |

Default: `info`

```bash
# Minimal (errors only)
LOG_LEVEL=error

# Normal operation (default)
LOG_LEVEL=info

# Triage / troubleshooting
LOG_LEVEL=debug
```

## Agent log coverage

**INFO** (default):

- Job received
- Session started
- Connection established
- Agent state transitions: `Agent: listening`, `Agent: thinking`, `Agent: speaking`
- Errors

**DEBUG** (when `LOG_LEVEL=debug`):

- User state changes (speaking, listening, away)
- User input transcribed
- Speech handle created
- Participant connected
- Audio track subscribed
