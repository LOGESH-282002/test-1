#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🚀 BlogApp Setup Script')
console.log('========================\n')

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local')
const envExamplePath = path.join(process.cwd(), '.env.local.example')

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log('📋 Creating .env.local from template...')
    fs.copyFileSync(envExamplePath, envPath)
    console.log('✅ .env.local created! Please update it with your credentials.\n')
  } else {
    console.log('⚠️  .env.local.example not found. Please create .env.local manually.\n')
  }
} else {
  console.log('✅ .env.local already exists.\n')
}

// Check Node.js version
console.log('🔍 Checking Node.js version...')
const nodeVersion = process.version
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])

if (majorVersion < 18) {
  console.log('❌ Node.js 18+ is required. Current version:', nodeVersion)
  process.exit(1)
} else {
  console.log('✅ Node.js version is compatible:', nodeVersion, '\n')
}

// Install dependencies
console.log('📦 Installing dependencies...')
try {
  execSync('npm install', { stdio: 'inherit' })
  console.log('✅ Dependencies installed successfully!\n')
} catch (error) {
  console.log('❌ Failed to install dependencies:', error.message)
  process.exit(1)
}

// Check if Tailwind is properly configured
console.log('🎨 Checking Tailwind CSS configuration...')
const tailwindConfigPath = path.join(process.cwd(), 'tailwind.config.js')
if (fs.existsSync(tailwindConfigPath)) {
  console.log('✅ Tailwind CSS is configured.\n')
} else {
  console.log('⚠️  Tailwind CSS configuration not found.\n')
}

// Setup complete
console.log('🎉 Setup Complete!')
console.log('==================\n')
console.log('Next steps:')
console.log('1. Update .env.local with your Supabase credentials')
console.log('2. Set up your Supabase database using database/schema.sql')
console.log('3. Run "npm run dev" to start the development server')
console.log('4. Visit http://localhost:3000 to see your app\n')

console.log('📚 Documentation:')
console.log('- README.md - Complete setup guide')
console.log('- docs/DEPLOYMENT.md - Production deployment guide')
console.log('- docs/API_REFERENCE.md - API documentation')
console.log('- docs/DEMO_SCRIPT.md - Demo presentation guide\n')

console.log('🧪 Testing:')
console.log('- Run "npm test" to execute the test suite')
console.log('- Run "npm run test:watch" for development testing\n')

console.log('Happy coding! 🚀')