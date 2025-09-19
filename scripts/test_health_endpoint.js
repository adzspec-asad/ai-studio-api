// Simple script to test the health endpoint
import http from 'http';

function testHealthEndpoint() {
  const options = {
    hostname: 'localhost',
    port: 3333,
    path: '/health',
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  };

  console.log('🔍 Testing health endpoint...');
  console.log(`   URL: http://${options.hostname}:${options.port}${options.path}`);

  const req = http.request(options, (res) => {
    console.log(`📊 Status Code: ${res.statusCode}`);
    console.log(`📋 Headers:`, res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('📄 Response Body:', data);
      
      if (res.statusCode === 200) {
        console.log('✅ Health endpoint is working correctly!');
      } else {
        console.log('❌ Health endpoint returned an error');
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
  });

  req.end();
}

// Test other endpoints too
function testOtherEndpoints() {
  const endpoints = [
    '/health/liveness',
    '/health/readiness',
    '/'
  ];

  endpoints.forEach((endpoint, index) => {
    setTimeout(() => {
      console.log(`\n🔍 Testing ${endpoint}...`);
      
      const options = {
        hostname: 'localhost',
        port: 3333,
        path: endpoint,
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      };

      const req = http.request(options, (res) => {
        console.log(`📊 ${endpoint} - Status: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode < 400) {
            console.log(`✅ ${endpoint} is working`);
          } else {
            console.log(`❌ ${endpoint} failed: ${data}`);
          }
        });
      });

      req.on('error', (error) => {
        console.error(`❌ ${endpoint} request failed:`, error.message);
      });

      req.end();
    }, index * 1000); // Stagger requests by 1 second
  });
}

// Run tests
testHealthEndpoint();
setTimeout(testOtherEndpoints, 2000);
