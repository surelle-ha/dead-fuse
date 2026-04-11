# Dead Fuse Test App

A comprehensive test suite and interactive UI for testing the Dead Fuse client library.

## Features

- 🌐 **Web UI** - Interactive dashboard to test Dead Fuse functionality
- 💻 **Code Editor** - Write and execute custom DeadFuse code directly in the browser
- 📊 **Live Status** - Real-time status updates and state monitoring
- 📝 **Logs Console** - View all console output and errors
- ⚙️ **Configuration Panel** - Easily adjust connection parameters

## Setup

1. Install dependencies from the workspace root:
   ```bash
   pnpm install
   ```

2. Build the Dead Fuse client package:
   ```bash
   pnpm --filter @surelle-ha/dead-fuse build
   ```

## Running the Test App

### With pnpm filter:
```bash
pnpm --filter test start
```

### Or from the test directory:
```bash
cd apps/test
pnpm start
```

Then open your browser to: **http://localhost:3001**

## Web UI Guide

### Configuration Panel
- Set your **Project ID**, **Master URL**, and **Token**
- Click **Activate** to initialize DeadFuse with these settings
- Click **Deactivate** to stop the connection
- View real-time configuration info below the buttons

### Code Editor
- Write custom DeadFuse code in the editor
- `DeadFuse` object is available in the global scope
- Click **Execute Code** to run your script
- Use the example buttons to load common code snippets:
  - **Get Current State** - Retrieve the current project state
  - **Get Configuration** - View active configuration
  - **Custom Script** - Example custom script

### Output Logs
- View all console output (logs, warnings, errors)
- Color-coded by log type
- Auto-scrolls to latest entries
- Click **Clear Logs** to reset

## Example Code Snippets

### Get the current state:
```javascript
const state = DeadFuse.getState();
console.log('Current state:', state);
```

### Get the configuration:
```javascript
const config = DeadFuse.getConfig();
console.log('Configuration:', config);
```

### Check if DeadFuse is active:
```javascript
const config = DeadFuse.getConfig();
if (config) {
  console.log('DeadFuse is active for project:', config.projectId);
} else {
  console.log('DeadFuse is not active');
}
```

## API Endpoints

The backend provides these REST endpoints:

- `GET /api/status` - Get current DeadFuse status
- `GET /api/logs` - Get all logs
- `POST /api/logs/clear` - Clear logs
- `POST /api/execute` - Execute custom code
- `POST /api/activate` - Activate DeadFuse
- `POST /api/deactivate` - Deactivate DeadFuse

## Troubleshooting

**Port already in use?**
- The test app runs on port 3001
- Make sure no other process is using this port

**Cannot connect to dashboard?**
- Make sure the dashboard is running on `http://localhost:3000`
- Update the Master URL in the configuration panel if using a different address

**Logs not showing?**
- Logs are captured from executed code
- Click **Execute Code** to see output