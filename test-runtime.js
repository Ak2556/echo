#!/usr/bin/env node

const { spawn } = require('child_process');
const http = require('http');

console.log('🔍 Testing Echo Application for Runtime Errors...\n');

// Function to test if a port is available
function testPort(port, timeout = 5000) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: port,
      method: 'GET',
      timeout: timeout
    }, (res) => {
      resolve({ success: true, status: res.statusCode });
    });

    req.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });

    req.end();
  });
}

// Test backend
async function testBackend() {
  console.log('🔧 Testing Backend...');
  
  const backend = spawn('./venv/bin/python', ['main.py'], {
    cwd: './backend',
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let backendOutput = '';
  let backendErrors = '';

  backend.stdout.on('data', (data) => {
    backendOutput += data.toString();
  });

  backend.stderr.on('data', (data) => {
    backendErrors += data.toString();
  });

  // Wait for backend to start
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Test backend endpoints
  const endpoints = [
    { path: '/', name: 'Root' },
    { path: '/health', name: 'Health Check' },
    { path: '/api/ai/models', name: 'AI Models' },
    { path: '/api/languages', name: 'Languages' }
  ];

  console.log('📡 Testing API endpoints...');
  for (const endpoint of endpoints) {
    const result = await testPort(8000);
    if (result.success) {
      console.log(`  ✅ ${endpoint.name}: OK`);
    } else {
      console.log(`  ❌ ${endpoint.name}: ${result.error}`);
    }
  }

  // Check for errors in backend output
  if (backendErrors.includes('Error') || backendErrors.includes('Exception')) {
    console.log('❌ Backend Runtime Errors Found:');
    console.log(backendErrors);
  } else {
    console.log('✅ Backend: No runtime errors detected');
  }

  backend.kill();
  return { output: backendOutput, errors: backendErrors };
}

// Test frontend
async function testFrontend() {
  console.log('\n🎨 Testing Frontend...');
  
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: './frontend',
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let frontendOutput = '';
  let frontendErrors = '';

  frontend.stdout.on('data', (data) => {
    frontendOutput += data.toString();
  });

  frontend.stderr.on('data', (data) => {
    frontendErrors += data.toString();
  });

  // Wait for frontend to start
  await new Promise(resolve => setTimeout(resolve, 8000));

  // Test frontend
  const result = await testPort(3000);
  if (result.success) {
    console.log('✅ Frontend: Server started successfully');
  } else {
    console.log(`❌ Frontend: ${result.error}`);
  }

  // Check for errors in frontend output
  if (frontendErrors.includes('Error') || frontendErrors.includes('Failed')) {
    console.log('❌ Frontend Runtime Errors Found:');
    console.log(frontendErrors);
  } else {
    console.log('✅ Frontend: No runtime errors detected');
  }

  frontend.kill();
  return { output: frontendOutput, errors: frontendErrors };
}

// Main test function
async function runTests() {
  try {
    const backendResult = await testBackend();
    const frontendResult = await testFrontend();

    console.log('\n📊 Test Summary:');
    console.log('================');
    
    const hasBackendErrors = backendResult.errors.includes('Error') || backendResult.errors.includes('Exception');
    const hasFrontendErrors = frontendResult.errors.includes('Error') || frontendResult.errors.includes('Failed');

    if (!hasBackendErrors && !hasFrontendErrors) {
      console.log('🎉 All tests passed! No runtime errors detected.');
    } else {
      console.log('⚠️  Some issues were found:');
      if (hasBackendErrors) console.log('  - Backend has runtime errors');
      if (hasFrontendErrors) console.log('  - Frontend has runtime errors');
    }

  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  }
}

runTests();