import http from 'http';

const makeRequest = (options, data = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Body: ${body}`);
        resolve({ status: res.statusCode, body });
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(data);
    }
    req.end();
  });
};

console.log('Testing health endpoint...');
await makeRequest({
  hostname: 'localhost',
  port: 3001,
  path: '/api/health',
  method: 'GET'
});
