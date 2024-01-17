const express = require('express');
const promClient = require('prom-client');
const { exec } = require('child_process');

// Create a Prometheus Registry
const register = new promClient.Registry();

// Create a counter metric
const requestsCounter = new promClient.Counter({
    name: 'app_requests_total',
    help: 'Total number of requests to the application',
});

const pingGauge = new promClient.Gauge({
    name: 'Ping',
    help: 'Ping',
});

const downloadGauge = new promClient.Gauge({
    name: 'download',
    help: 'download',
});

const uploadGauge = new promClient.Gauge({
    name: 'upload',
    help: 'upload',
});

const jitterGauge = new promClient.Gauge({
    name: 'Jitter',
    help: 'Jitter',
});

// Register the metric with the registry
register.registerMetric(pingGauge);
register.registerMetric(downloadGauge);
register.registerMetric(uploadGauge);
register.registerMetric(jitterGauge);


// Create an Express application
const app = express();

// Middleware to increment the counter on each request
app.use((req, res, next) => {
    requestsCounter.inc();
    next();
});

// Endpoint to expose metrics for Prometheus
app.get('/metrics', async (req, res) => {
    try {
        const metrics = await register.metrics();
        res.set('Content-Type', register.contentType);
        res.end(metrics);
    } catch (error) {
        console.error('Error generating metrics:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Start the Express application
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
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

    ping = pingMatch ? pingMatch[1] : null;
    download = downloadMatch ? downloadMatch[1] : null;
    upload = uploadMatch ? uploadMatch[1] : null;
    jitter = jitterMatch ? jitterMatch[1] : null;
    
    pingGauge.set(parseFloat(ping));
    downloadGauge.set(parseFloat(download));
    uploadGauge.set(parseFloat(upload));
    jitterGauge.set(parseFloat(jitter));
}

async function speedtest() {
    try {
        const response = await runSpeedtestCLI();
        await getMetrics(response);
    } catch (error) {
        console.error('Error running speed test:', error);
    }
}
  
// Run speedtest every 15 seconds
const interval = 15 * 1000; // 15 seconds in milliseconds

setInterval(() => {
  speedtest();
}, interval);