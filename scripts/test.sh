#!/bin/bash
echo "Running all tests..."
echo ""
echo "Frontend tests:"
cd frontend && npm test && cd ..
echo ""
echo "Backend tests:"
cd backend && pytest && cd ..
echo ""
echo "All tests completed!"
