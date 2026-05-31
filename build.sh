#!/bin/bash
set -e

# Build frontend
cd frontend
npm install
npm run build
cd ..

# Copy built frontend into backend/static
rm -rf backend/static
cp -r frontend/dist backend/static

# Install backend dependencies
cd backend
pip install -r requirements.txt
