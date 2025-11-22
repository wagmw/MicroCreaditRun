const { exec } = require("child_process");

const PORT = 4000;

// Find processes using the port
exec(`lsof -i tcp:${PORT} -t`, (err, stdout, stderr) => {
  if (err) {
    console.error(`Error finding processes: ${err.message}`);
    return;
  }

  const pids = stdout.split("\n").filter(Boolean);
  if (pids.length === 0) {
    console.log(`No processes found on port ${PORT}`);
    return;
  }

  console.log(`Found processes on port ${PORT}: ${pids.join(", ")}`);

  // Kill all processes
  pids.forEach((pid) => {
    exec(`kill -9 ${pid}`, (killErr) => {
      if (killErr) {
        console.error(`Failed to kill process ${pid}: ${killErr.message}`);
      } else {
        console.log(`Killed process ${pid}`);
      }
    });
  });
});
