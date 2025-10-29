#!/usr/bin/env node

/**
 * Environment Variables Validation Script
 * Run this script to validate that all required environment variables are set
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET'
]

const optionalEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
]

console.log('🔍 Validating environment variables...\n')

let hasErrors = false

// Check required variables
console.log('📋 Required Variables:')
requiredEnvVars.forEach(varName => {
  const value = process.env[varName]
  if (!value) {
    console.log(`❌ ${varName} - MISSING`)
    hasErrors = true
  } else {
    console.log(`✅ ${varName} - SET`)
  }
})

console.log('\n📋 Optional Variables (for Google OAuth):')
optionalEnvVars.forEach(varName => {
  const value = process.env[varName]
  if (!value) {
    console.log(`⚠️  ${varName} - NOT SET (Google OAuth will be disabled)`)
  } else {
    console.log(`✅ ${varName} - SET`)
  }
})

// Validate specific formats
console.log('\n🔍 Format Validation:')

// Check Supabase URL format
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
  console.log('❌ NEXT_PUBLIC_SUPABASE_URL should start with https://')
  hasErrors = true
} else if (supabaseUrl) {
  console.log('✅ NEXT_PUBLIC_SUPABASE_URL format is valid')
}

// Check NEXTAUTH_URL format
const nextAuthUrl = process.env.NEXTAUTH_URL
if (nextAuthUrl && !nextAuthUrl.startsWith('http')) {
  console.log('❌ NEXTAUTH_URL should start with http:// or https://')
  hasErrors = true
} else if (nextAuthUrl) {
  console.log('✅ NEXTAUTH_URL format is valid')
}

// Check JWT_SECRET length
const jwtSecret = process.env.JWT_SECRET
if (jwtSecret && jwtSecret.length < 32) {
  console.log('⚠️  JWT_SECRET should be at least 32 characters long for security')
} else if (jwtSecret) {
  console.log('✅ JWT_SECRET length is adequate')
}

console.log('\n' + '='.repeat(50))

if (hasErrors) {
  console.log('❌ Environment validation FAILED')
  console.log('Please set the missing required environment variables.')
  process.exit(1)
} else {
  console.log('✅ Environment validation PASSED')
  console.log('All required environment variables are set!')
}

console.log('\n💡 Tips:')
console.log('- Copy .env.example to .env.local for local development')
console.log('- Set environment variables in Vercel dashboard for production')
console.log('- Never commit .env files to version control')