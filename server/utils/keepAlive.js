import https from 'https';
import http from 'http';

/**
 * Keep-Alive Service
 * Pings the server every 30 seconds to prevent it from going idle
 * Useful for free hosting services that spin down inactive servers
 */

class KeepAliveService {
  constructor(options = {}) {
    this.serverUrl = options.serverUrl || process.env.SERVER_URL || 'http://localhost:5000';
    this.interval = options.interval || 30000; // 30 seconds
    this.endpoint = options.endpoint || '/api/keep-alive';
    this.enabled = options.enabled !== false;
    this.intervalId = null;
    this.pingCount = 0;
    this.failCount = 0;
    this.lastPingTime = null;
    this.lastSuccessTime = null;
  }

  /**
   * Start the keep-alive service
   */
  start() {
    if (!this.enabled) {
      console.log('⏸️  Keep-Alive: DISABLED');
      return;
    }

    // Don't start in development unless explicitly enabled
    if (process.env.NODE_ENV !== 'production' && !process.env.ENABLE_KEEP_ALIVE) {
      console.log('⏸️  Keep-Alive: Skipped (development mode)');
      console.log('💡 Set ENABLE_KEEP_ALIVE=true to enable in development');
      return;
    }

    console.log('\n🔄 Keep-Alive Service Starting...');
    console.log('─'.repeat(50));
    console.log(`📡 Target URL: ${this.serverUrl}${this.endpoint}`);
    console.log(`⏱️  Interval: ${this.interval / 1000} seconds`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('─'.repeat(50));

    // Initial ping after 10 seconds
    setTimeout(() => {
      this.ping();
    }, 10000);

    // Set up recurring pings
    this.intervalId = setInterval(() => {
      this.ping();
    }, this.interval);

    console.log('✅ Keep-Alive Service Started');
  }

  /**
   * Stop the keep-alive service
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('⏹️  Keep-Alive Service Stopped');
      this.logStats();
    }
  }

  /**
   * Ping the server
   */
  async ping() {
    this.lastPingTime = new Date();
    const url = `${this.serverUrl}${this.endpoint}`;

    try {
      const protocol = url.startsWith('https') ? https : http;
      
      const response = await new Promise((resolve, reject) => {
        const req = protocol.get(url, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            resolve({
              statusCode: res.statusCode,
              data: data
            });
          });
        });

        req.on('error', reject);
        req.setTimeout(10000, () => {
          req.destroy();
          reject(new Error('Request timeout'));
        });
      });

      if (response.statusCode === 200) {
        this.pingCount++;
        this.lastSuccessTime = new Date();
        this.failCount = 0; // Reset fail count on success
        
        // Log every 10th ping to avoid spam
        if (this.pingCount % 10 === 0) {
          console.log(`💚 Keep-Alive: Ping #${this.pingCount} successful (${new Date().toLocaleTimeString()})`);
        }
      } else {
        throw new Error(`HTTP ${response.statusCode}`);
      }
    } catch (error) {
      this.failCount++;
      console.error(`❌ Keep-Alive: Ping failed (${error.message})`);
      
      // Alert if multiple consecutive failures
      if (this.failCount >= 3) {
        console.error(`⚠️  WARNING: ${this.failCount} consecutive ping failures!`);
        console.error(`   Server may be down or unreachable`);
      }
    }
  }

  /**
   * Log statistics
   */
  logStats() {
    console.log('\n📊 Keep-Alive Statistics:');
    console.log('─'.repeat(50));
    console.log(`✅ Total Pings: ${this.pingCount}`);
    console.log(`❌ Failed Pings: ${this.failCount}`);
    if (this.lastSuccessTime) {
      console.log(`🕐 Last Success: ${this.lastSuccessTime.toLocaleString()}`);
    }
    console.log('─'.repeat(50));
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      enabled: this.enabled,
      running: this.intervalId !== null,
      pingCount: this.pingCount,
      failCount: this.failCount,
      lastPingTime: this.lastPingTime,
      lastSuccessTime: this.lastSuccessTime,
      interval: this.interval,
      serverUrl: this.serverUrl
    };
  }
}

// Create singleton instance
const keepAliveService = new KeepAliveService({
  serverUrl: process.env.SERVER_URL,
  interval: parseInt(process.env.KEEP_ALIVE_INTERVAL) || 30000,
  enabled: process.env.ENABLE_KEEP_ALIVE !== 'false'
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received, stopping keep-alive service...');
  keepAliveService.stop();
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received, stopping keep-alive service...');
  keepAliveService.stop();
  process.exit(0);
});

export default keepAliveService;
