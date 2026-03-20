# hevy-mcp

MCP server for the [Hevy](https://hevy.com/) workout tracking API.

## Setup

Requires [Hevy Pro](https://hevy.com/settings?developer) for an API key.

```bash
git clone https://github.com/jszuminski/hevy-mcp.git
cd hevy-mcp
bun install
```

### Claude Code

Add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "hevy": {
      "command": "bun",
      "args": ["run", "/path/to/hevy-mcp/src/index.ts"],
      "env": {
        "HEVY_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "hevy": {
      "command": "bun",
      "args": ["run", "/path/to/hevy-mcp/src/index.ts"],
      "env": {
        "HEVY_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `get_user_info` | Get user profile |
| `list_workouts` | List workouts (paginated) |
| `get_workout` | Get workout by ID |
| `get_workout_count` | Get total workout count |
| `get_workout_events` | Get workout update/delete events |
| `create_workout` | Create a workout |
| `update_workout` | Update a workout |
| `list_routines` | List routines (paginated) |
| `get_routine` | Get routine by ID |
| `create_routine` | Create a routine |
| `update_routine` | Update a routine |
| `list_exercise_templates` | List exercise templates |
| `get_exercise_template` | Get exercise template by ID |
| `create_exercise_template` | Create custom exercise |
| `get_exercise_history` | Get history for an exercise |
| `list_routine_folders` | List routine folders |
| `get_routine_folder` | Get folder by ID |
| `create_routine_folder` | Create a routine folder |

## Development

```bash
bun test              # unit tests
bun run test:watch    # watch mode
bun run check         # lint & format check
bun run check:fix     # auto-fix
bun run generate-types  # regenerate types from OpenAPI spec
```

Integration tests (requires API key):

```bash
HEVY_API_KEY=your-key bun run test:integration
```
