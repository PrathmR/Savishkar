#!/usr/bin/env node

/**
 * Email Configuration Checker
 * Run this script to verify your email environment variables are set correctly
 * Usage: node scripts/checkEmailConfig.js
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

console.log('\n🔍 Email Configuration Checker');
console.log('═'.repeat(60));

// Check if all required variables are set
const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'];
const missingVars = [];
const setVars = [];

console.log('\n📋 Environment Variables Status:\n');

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    setVars.push(varName);
    if (varName === 'EMAIL_PASS') {
      // Mask password but show first 3 and last 3 characters
      const masked = value.length > 6 
        ? `${value.substring(0, 3)}${'*'.repeat(value.length - 6)}${value.substring(value.length - 3)}`
        : '*'.repeat(value.length);
      console.log(`✅ ${varName.padEnd(15)} = ${masked} (${value.length} chars)`);
    } else {
      console.log(`✅ ${varName.padEnd(15)} = ${value}`);
    }
  } else {
    missingVars.push(varName);
    console.log(`❌ ${varName.padEnd(15)} = NOT SET`);
  }
});

console.log('\n' + '─'.repeat(60));

// Summary
if (missingVars.length === 0) {
  console.log('\n✅ All required variables are set!\n');
  
  // Validate configuration
  console.log('🔍 Configuration Validation:\n');
  
  const host = process.env.EMAIL_HOST;
  const port = process.env.EMAIL_PORT;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  
  // Check for common providers
  if (host === 'smtp.gmail.com') {
    console.log('📧 Provider: Gmail');
    console.log('   Expected PORT: 587 or 465');
    console.log(`   Your PORT: ${port} ${port === '587' || port === '465' ? '✅' : '⚠️'}`);
    console.log('   Expected USER: your-email@gmail.com');
    console.log(`   Your USER: ${user} ${user.includes('@gmail.com') ? '✅' : '⚠️'}`);
    console.log('   Expected PASS: 16-character App Password (no spaces)');
    console.log(`   Your PASS: ${pass.length} characters ${pass.length === 16 && !/\s/.test(pass) ? '✅' : '⚠️'}`);
    
    if (pass.includes(' ')) {
      console.log('\n⚠️  WARNING: EMAIL_PASS contains spaces!');
      console.log('   Gmail App Passwords should have spaces removed.');
      console.log('   Example: "abcd efgh ijkl mnop" → "abcdefghijklmnop"');
    }
    
    if (pass.length !== 16) {
      console.log('\n⚠️  WARNING: EMAIL_PASS is not 16 characters!');
      console.log('   Gmail App Passwords are exactly 16 characters (without spaces).');
      console.log('   Make sure you copied the entire password and removed spaces.');
    }
  } else if (host === 'smtp.sendgrid.net') {
    console.log('📧 Provider: SendGrid');
    console.log('   Expected PORT: 587');
    console.log(`   Your PORT: ${port} ${port === '587' ? '✅' : '⚠️'}`);
    console.log('   Expected USER: apikey');
    console.log(`   Your USER: ${user} ${user === 'apikey' ? '✅' : '⚠️'}`);
    console.log('   Expected PASS: API key starting with "SG."');
    console.log(`   Your PASS: ${pass.startsWith('SG.') ? '✅ Starts with SG.' : '⚠️ Does not start with SG.'} (${pass.length} chars)`);
    
    if (user !== 'apikey') {
      console.log('\n⚠️  WARNING: EMAIL_USER should be exactly "apikey" for SendGrid!');
      console.log('   Not your email address, just the word "apikey".');
    }
    
    if (!pass.startsWith('SG.')) {
      console.log('\n⚠️  WARNING: EMAIL_PASS should start with "SG." for SendGrid!');
      console.log('   Make sure you copied the full API key from SendGrid.');
    }
  } else {
    console.log(`📧 Provider: Custom (${host})`);
    console.log(`   PORT: ${port}`);
    console.log(`   USER: ${user}`);
    console.log(`   PASS: ${pass.length} characters`);
  }
  
  console.log('\n' + '─'.repeat(60));
  console.log('\n💡 Next Steps:\n');
  console.log('1. If using locally: Configuration looks good!');
  console.log('2. If using on Render: Make sure these same values are set in Render Dashboard');
  console.log('3. After updating Render variables: Click "Manual Deploy" → "Deploy latest commit"');
  console.log('4. Check Render logs for: "✅ Email Server Connected Successfully!"');
  
} else {
  console.log(`\n❌ Missing ${missingVars.length} required variable(s):\n`);
  missingVars.forEach(varName => {
    console.log(`   • ${varName}`);
  });
  
  console.log('\n💡 How to Fix:\n');
  console.log('1. Create/update .env file in server directory');
  console.log('2. Add the missing variables:');
  console.log('');
  missingVars.forEach(varName => {
    if (varName === 'EMAIL_HOST') {
      console.log(`   ${varName}=smtp.gmail.com  # or smtp.sendgrid.net`);
    } else if (varName === 'EMAIL_PORT') {
      console.log(`   ${varName}=587`);
    } else if (varName === 'EMAIL_USER') {
      console.log(`   ${varName}=your-email@gmail.com  # or "apikey" for SendGrid`);
    } else if (varName === 'EMAIL_PASS') {
      console.log(`   ${varName}=your-app-password  # or SendGrid API key`);
    }
  });
  console.log('');
  console.log('3. For Render: Add these in Dashboard → Environment tab');
  console.log('4. Redeploy after adding variables');
}

console.log('\n═'.repeat(60));
console.log('\n📚 Documentation:');
console.log('   • Quick Fix: EMAIL_QUICK_FIX.md');
console.log('   • Full Guide: RENDER_EMAIL_PRODUCTION_FIX.md');
console.log('   • Gmail Setup: GMAIL_RENDER_FIX.md');
console.log('   • SendGrid Setup: RENDER_EMAIL_FIX.md');
console.log('\n');
