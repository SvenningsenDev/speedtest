const { exec } = require('child_process');
const express = require('express');
const app = express();


const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Define the /metrics endpoint
app.get('/metrics', (req, res) => {
  res.json(speedtest());
});

async function runSpeedtestCLI() {
  return new Promise((resolve, reject) => {
    const command = '/usr/bin/speedtest --accept-license --accept-gdpr';

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }

      // Combine stdout and stderr into the response variable
      const response = `${stdout}${stderr}`;

      resolve(response);
    });
  });
}

async function getMetrics(response) {
  const latencyRegex = /Latency:\s+(.*?)\s/m;
  const downloadRegex = /Download:\s+(.*?)\s/m;
  const uploadRegex = /Upload:\s+(.*?)\s/m;
  const jitterRegex = /Latency:.*?jitter:\s+(.*?)ms/m;

  const pingMatch = response.match(latencyRegex);
  const downloadMatch = response.match(downloadRegex);
  const uploadMatch = response.match(uploadRegex);
  const jitterMatch = response.match(jitterRegex);

  // Check if the matches are found before accessing the values
  const metrics = {
    ping: pingMatch ? pingMatch[1] : null,
    download: downloadMatch ? downloadMatch[1] : null,
    upload: uploadMatch ? uploadMatch[1] : null,
    jitter: jitterMatch ? jitterMatch[1] : null,
  };

  console.log('Metrics:', metrics);

  // console.log('Ping:', ping);
  // console.log('Download:', download);
  // console.log('Upload:', upload);
  // console.log('Jitter:', jitter);
  // console.log('Speed Test Output:', response);
}

// Example usage
async function speedtest() {
  try {
    const response = await runSpeedtestCLI();
    metrics = getMetrics(response);
  } catch (error) {
    console.error('Error running speed test:', error);
  }
  return metrics
}

