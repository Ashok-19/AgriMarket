#!/bin/bash

# Start Frontend Static Server
echo "🚀 Starting AgriMarket Dashboard Frontend..."
echo ""
echo "✓ Frontend will be available at http://localhost:8000"
echo "✓ Backend API should be running on http://localhost:5000"
echo ""
echo "📂 Serving files from: $(pwd)"
echo ""

# Start Python's built-in HTTP server
python3 -m http.server 8000
