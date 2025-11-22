// Plesk startup file for MicroCredit Backend
// This file is used by Plesk Node.js to start the application

require("dotenv").config();
const { exec } = require("child_process");
const { promisify } = require("util");
const execPromise = promisify(exec);

const PORT = process.env.PORT || 4000;

console.log("🚀 MicroCredit Backend startup initiated via Plesk");
console.log(`📍 Environment: ${process.env.NODE_ENV || "production"}`);
console.log(`🔌 Port: ${PORT}`);

// Function to kill any process running on the specified port (Linux/Debian compatible)
async function killPortProcess(port) {
  try {
    console.log(`🔍 Checking for processes on port ${port}...`);

    // Linux command to find process on port using lsof
    const { stdout } = await execPromise(`lsof -ti:${port}`);

    if (stdout && stdout.trim()) {
      const pids = stdout.trim().split("\n").filter(Boolean);

      if (pids.length > 0) {
        console.log(
          `⚠️  Found ${pids.length} process(es) on port ${port}: ${pids.join(
            ", "
          )}`
        );

        // Kill each process
        for (const pid of pids) {
          try {
            await execPromise(`kill -9 ${pid}`);
            console.log(`✅ Killed process ${pid}`);
          } catch (killErr) {
            console.error(
              `❌ Failed to kill process ${pid}: ${killErr.message}`
            );
          }
        }
      } else {
        console.log(`✅ No processes found on port ${port}`);
      }
    } else {
      console.log(`✅ Port ${port} is free`);
    }
  } catch (err) {
    // If no process is found, lsof returns error - this is OK
    console.log(`✅ Port ${port} is available`);
  }
}

// Kill any existing process on the port, then start the server
killPortProcess(PORT)
  .then(() => {
    console.log("🚀 Starting server...");
    // Load and start the main server
    // The server.js file handles all initialization, middleware, routes, and error handling
    require("./src/server");
  })
  .catch((err) => {
    console.error("❌ Error during startup:", err);
    process.exit(1);
  });
