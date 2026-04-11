const express = require("express");
const cors = require("cors");
const path = require("path");

const DeadFusePackage = require("@surelle-ha/dead-fuse");
const DeadFuse = DeadFusePackage.default || DeadFusePackage;

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let appState = {
  logs: [],
  lastError: null,
  currentMessage: null,
  messageType: null, // 'warning', 'locked', 'readonly', 'active'
};

// Intercept console methods to capture output
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

function captureLog(...args) {
  const message = args.map((arg) => {
    if (typeof arg === "object") {
      try {
        return JSON.stringify(arg, null, 2);
      } catch {
        return String(arg);
      }
    }
    return String(arg);
  }).join(" ");
  appState.logs.push({ type: "log", message, timestamp: new Date().toISOString() });
  originalLog(...args);
}

function captureError(...args) {
  const message = args.map((arg) => {
    if (typeof arg === "object") {
      try {
        return JSON.stringify(arg, null, 2);
      } catch {
        return String(arg);
      }
    }
    return String(arg);
  }).join(" ");
  appState.logs.push({ type: "error", message, timestamp: new Date().toISOString() });
  originalError(...args);
}

function captureWarn(...args) {
  const message = args.map((arg) => {
    if (typeof arg === "object") {
      try {
        return JSON.stringify(arg, null, 2);
      } catch {
        return String(arg);
      }
    }
    return String(arg);
  }).join(" ");
  appState.logs.push({ type: "warn", message, timestamp: new Date().toISOString() });
  originalWarn(...args);
}

console.log = captureLog;
console.error = captureError;
console.warn = captureWarn;

// API: Get current status
app.get("/api/status", (req, res) => {
  const state = DeadFuse.getState();
  const config = DeadFuse.getConfig();

  res.json({
    state,
    config: config ? {
      projectId: config.projectId,
      master: config.master,
    } : null,
    message: appState.currentMessage,
    messageType: appState.messageType,
    logs: appState.logs.slice(-50), // Last 50 logs
  });
});

// API: Get logs
app.get("/api/logs", (req, res) => {
  res.json({
    logs: executionContext.logs,
  });
});

// API: Clear logs
app.post("/api/logs/clear", (req, res) => {
  appState.logs = [];
  res.json({ success: true });
});

// API: Clear message
app.post("/api/message/clear", (req, res) => {
  appState.currentMessage = null;
  appState.messageType = null;
  res.json({ success: true });
});



// API: Activate DeadFuse
app.post("/api/activate", express.json(), (req, res) => {
  const { projectId, master, token, fallbackMode } = req.body;

  try {
    const config = {
      projectId: projectId || "test-project-id",
      master: master || "ws://localhost:3000/fuse",
      token: token || "test-token",
      fallbackMode: fallbackMode || "readonly",
      onActive: () => {
        appState.currentMessage = "DeadFuse is active";
        appState.messageType = "active";
        captureLog("[DeadFuse] Active");
      },
      onWarning: (msg) => {
        appState.currentMessage = msg;
        appState.messageType = "warning";
        captureWarn("[DeadFuse] Warning:", msg);
      },
      onReadonly: () => {
        appState.currentMessage = "Read-only mode enabled";
        appState.messageType = "readonly";
        captureWarn("[DeadFuse] Read-only mode");
      },
      onLocked: (msg) => {
        appState.currentMessage = msg;
        appState.messageType = "locked";
        captureError("[DeadFuse] Locked:", msg);
      },
    };

    DeadFuse.activate(config);

    res.json({
      success: true,
      config: {
        projectId: config.projectId,
        master: config.master,
      },
    });
  } catch (error) {
    appState.lastError = error.message;
    captureError(error.message);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// API: Deactivate DeadFuse
app.post("/api/deactivate", (req, res) => {
  try {
    DeadFuse.deactivate();
    appState.currentMessage = null;
    appState.messageType = null;
    captureLog("[DeadFuse] Deactivated");
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🔥 Dead Fuse Test UI running on http://localhost:${PORT}`);
});