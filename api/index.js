// Vercel Serverless Entry Point
const path = require('path');

// Ensure dist exists
const fs = require('fs');
const distPath = path.join(__dirname, '..', 'dist', 'main.js');

if (!fs.existsSync(distPath)) {
  console.error('Error: dist/main.js not found. Please run "pnpm run build" first.');
  process.exit(1);
}

// Load the compiled NestJS application
const mainModule = require('../dist/main');

// Export the handler for Vercel
module.exports = mainModule.default || mainModule.handler || mainModule;
