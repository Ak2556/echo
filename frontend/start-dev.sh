#!/bin/bash
# Kill any existing processes
lsof -ti:3000 | xargs kill -9 2>/dev/null
sleep 1

# Start Next.js with verbose output
npm run dev 2>&1 | tee /tmp/nextjs-output.log
