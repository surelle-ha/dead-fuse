const DeadFusePackage = require("dead-fuse");
const DeadFuse = DeadFusePackage.default || DeadFusePackage;

async function testDeadFuse() {
  console.log("Testing Dead Fuse client...");

  const config = {
    projectId: "test-project-id",
    master: "ws://localhost:3000/fuse",
    token: "test-token",
  };

  try {
    DeadFuse.activate(config);
    console.log("✅ DeadFuse activated");

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const state = DeadFuse.getState();
    console.log("Current state:", state);

    const currentConfig = DeadFuse.getConfig();
    console.log("Config:", currentConfig);

    DeadFuse.deactivate();
    console.log("✅ DeadFuse deactivated");
    console.log("🎉 Test script completed.");
  } catch (error) {
    console.error("❌ Test failed:", error?.message || error);
    process.exit(1);
  }
}

testDeadFuse();