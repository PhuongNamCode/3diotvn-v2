#!/usr/bin/env node

/**
 * News Scheduler Script
 * This script should be run as a cron job to automatically update news
 * 
 * Setup cron job:
 * 1. For daily updates at 8 AM: 0 8 * * * cd /path/to/web && node scripts/news-scheduler.js
 * 2. For weekly updates (Monday 8 AM): 0 8 * * 1 cd /path/to/web && node scripts/news-scheduler.js
 * 3. For monthly updates (1st at 8 AM): 0 8 1 * * cd /path/to/web && node scripts/news-scheduler.js
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';

async function callScheduler() {
  try {
    console.log(`[${new Date().toISOString()}] Running news scheduler...`);
    
    const url = new URL('/api/news/scheduler', BASE_URL);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 300000, // 5 minutes timeout
    };

    const req = client.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.success) {
            console.log(`[${new Date().toISOString()}] ✅ ${result.message}`);
            if (result.nextUpdate) {
              console.log(`[${new Date().toISOString()}] Next update: ${result.nextUpdate}`);
            }
            if (result.data) {
              console.log(`[${new Date().toISOString()}] Ingested: ${result.data.ingested || 0}, Skipped: ${result.data.skipped || 0}`);
            }
          } else {
            console.error(`[${new Date().toISOString()}] ❌ Error: ${result.error}`);
            process.exit(1);
          }
        } catch (parseError) {
          console.error(`[${new Date().toISOString()}] ❌ Parse error:`, parseError.message);
          console.error('Response:', data);
          process.exit(1);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`[${new Date().toISOString()}] ❌ Request error:`, error.message);
      process.exit(1);
    });

    req.on('timeout', () => {
      console.error(`[${new Date().toISOString()}] ❌ Request timeout`);
      req.destroy();
      process.exit(1);
    });

    req.end();
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Fatal error:`, error.message);
    process.exit(1);
  }
}

// Run the scheduler
callScheduler();
