const express = require("express");
const cors = require("cors");
const path = require("path");

const DeadFusePackage = require("dead-fuse");
const DeadFuse = DeadFusePackage.default || DeadFusePackage;

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let executionContext = {
  logs: [],
  lastError: null,
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
  executionContext.logs.push({ type: "log", message });
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
  executionContext.logs.push({ type: "error", message });
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
  executionContext.logs.push({ type: "warn", message });
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
      token: config.token?.substring(0, 10) + "***",
    } : null,
    logs: executionContext.logs.slice(-100), // Last 100 logs
    lastError: executionContext.lastError,
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
  executionContext.logs = [];
  executionContext.lastError = null;
  res.json({ success: true });
});

// API: Execute custom code
app.post("/api/execute", express.json(), (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "No code provided" });
  }

  try {
    executionContext.logs = [];
    executionContext.lastError = null;

    // Create function with access to DeadFuse and console
    const fn = new Function("DeadFuse", "console", `
      (async () => {
        ${code}
      })()
    `);

    fn(DeadFuse, console);

    res.json({
      success: true,
      logs: executionContext.logs,
    });
  } catch (error) {
    executionContext.lastError = error.message;
    executionContext.logs.push({
      type: "error",
      message: error.message,
    });

    res.json({
      success: false,
      error: error.message,
      logs: executionContext.logs,
    });
  }
});

// API: Activate DeadFuse
app.post("/api/activate", express.json(), (req, res) => {
  const { projectId, master, token } = req.body;

  try {
    const config = {
      projectId: projectId || "test-project-id",
      master: master || "ws://localhost:3000/fuse",
      token: token || "test-token",
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