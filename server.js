const { exec } = require('child_process');
const express = require('express');
const promClient = require('prom-client');

// Create a Prometheus Registry
const register = new promClient.Registry();

const gaugeDefinitions = [
  { name: 'Ping', help: 'Ping' },
  { name: 'download', help: 'download' },
  { name: 'upload', help: 'upload' },
  { name: 'Jitter', help: 'Jitter' },
];

const gauges = {};

gaugeDefinitions.forEach(({ name, help }) => {
  const gauge = new promClient.Gauge({ name, help });
  gauges[name] = gauge;
});

const app = express();
const PORT = 8080;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Endpoint to expose metrics for Prometheus
app.get('/metrics', (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
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

    gauges[ping] = pingMatch ? pingMatch[1] : null;
    gauges[download] = downloadMatch ? downloadMatch[1] : null;
    gauges[upload] = uploadMatch ? uploadMatch[1] : null;
    gauges[jitter] = jitterMatch ? jitterMatch[1] : null;

  console.log(gauges);
}

async function postMetrics(metrics) {
  try {
    const response = await axios.post(`http://localhost:/metrics${PORT}`, metrics);
    console.log('Metrics posted successfully:', response.data);
  } catch (error) {
    console.error('Error posting metrics:', error.message);
  }
}

// Example usage
async function speedtest() {
  try {
    const response = await runSpeedtestCLI();
    metrics = getMetrics(response);
    postMetrics(metrics);
  } catch (error) {
    console.error('Error running speed test:', error);
  }
}

speedtest();