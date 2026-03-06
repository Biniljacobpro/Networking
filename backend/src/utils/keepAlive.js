const https = require('https');
const http = require('http');

/**
 * Keep-Alive Service to Prevent Cold Starts on Render
 * 
 * Pings the health endpoint every 14 minutes to keep the service active.
 * Render's free tier spins down after 15 minutes of inactivity.
 */

const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes in milliseconds

let intervalId = null;

function pingServer(url) {
  const protocol = url.startsWith('https') ? https : http;
  const endpoint = `${url}/health`;

  protocol.get(endpoint, (res) => {
    if (res.statusCode === 200) {
      console.log(`✅ Keep-alive ping successful at ${new Date().toISOString()}`);
    } else {
      console.log(`⚠️  Keep-alive ping returned status ${res.statusCode}`);
    }
  }).on('error', (err) => {
    console.error(`❌ Keep-alive ping failed: ${err.message}`);
  });
}

function start(serverUrl) {
  if (!serverUrl) {
    console.warn('⚠️  No server URL provided for keep-alive service');
    return;
  }

  console.log(`🔄 Starting keep-alive service for ${serverUrl}`);
  console.log(`📍 Ping interval: ${PING_INTERVAL / 1000 / 60} minutes`);

  // Initial ping after 1 minute
  setTimeout(() => {
    pingServer(serverUrl);
  }, 60000);

  // Regular interval pings
  intervalId = setInterval(() => {
    pingServer(serverUrl);
  }, PING_INTERVAL);
}

function stop() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('🛑 Keep-alive service stopped');
  }
}

module.exports = {
  start,
  stop,
};
