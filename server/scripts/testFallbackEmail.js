#!/usr/bin/env node

/**
 * Test Fallback Email System
 * This script tests both primary and fallback email credentials
 * Usage: node scripts/testFallbackEmail.js
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import sendEmail from '../utils/sendEmail.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('\n🧪 Testing Fallback Email System');
console.log('═'.repeat(70));

// Check configuration
const checkConfig = () => {
  console.log('\n📋 Checking Configuration...\n');
  
  const hasPrimary = process.env.EMAIL_USER && process.env.EMAIL_PASS;
  const hasFallback = process.env.FALLBACK_EMAIL_USER && process.env.FALLBACK_EMAIL_PASS;
  
  console.log('Primary Email:');
  console.log(`  EMAIL_USER: ${process.env.EMAIL_USER ? '✅ Set' : '❌ Missing'}`);
  console.log(`  EMAIL_PASS: ${process.env.EMAIL_PASS ? '✅ Set' : '❌ Missing'}`);
  console.log(`  EMAIL_HOST: ${process.env.EMAIL_HOST || 'smtp.gmail.com (default)'}`);
  console.log(`  EMAIL_PORT: ${process.env.EMAIL_PORT || '587 (default)'}`);
  
  console.log('\nFallback Email:');
  console.log(`  FALLBACK_EMAIL_USER: ${process.env.FALLBACK_EMAIL_USER ? '✅ Set' : '❌ Missing'}`);
  console.log(`  FALLBACK_EMAIL_PASS: ${process.env.FALLBACK_EMAIL_PASS ? '✅ Set' : '❌ Missing'}`);
  console.log(`  FALLBACK_EMAIL_HOST: ${process.env.FALLBACK_EMAIL_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com (default)'}`);
  console.log(`  FALLBACK_EMAIL_PORT: ${process.env.FALLBACK_EMAIL_PORT || process.env.EMAIL_PORT || '587 (default)'}`);
  
  console.log('\n' + '─'.repeat(70));
  
  if (!hasPrimary) {
    console.log('\n❌ Primary email not configured!');
    console.log('💡 Add EMAIL_USER and EMAIL_PASS to .env file');
    return false;
  }
  
  if (!hasFallback) {
    console.log('\n⚠️  Fallback email not configured');
    console.log('💡 Add FALLBACK_EMAIL_USER and FALLBACK_EMAIL_PASS to .env file');
    console.log('   The system will work but without fallback support');
  }
  
  return true;
};

// Test email sending
const testEmail = async (testEmail) => {
  console.log('\n🧪 Test 1: Normal Email Send (Primary Should Work)');
  console.log('─'.repeat(70));
  
  try {
    const result = await sendEmail({
      email: testEmail,
      subject: 'Test Email - Fallback System',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #4CAF50;">✅ Email System Test</h2>
          <p>This is a test email from the Savishkar fallback email system.</p>
          <p><strong>Test Type:</strong> Normal Send</p>
          <p><strong>Expected:</strong> Should use PRIMARY credentials</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            If you received this email, the email system is working correctly!
          </p>
        </div>
      `
    });
    
    console.log('\n✅ Test 1 PASSED!');
    console.log(`   Service Used: ${result.service}`);
    console.log(`   Used Fallback: ${result.usedFallback ? 'Yes' : 'No'}`);
    console.log(`   Duration: ${result.duration}ms`);
    console.log(`   Message ID: ${result.messageId}`);
    
    return true;
  } catch (error) {
    console.log('\n❌ Test 1 FAILED!');
    console.log(`   Error: ${error.message}`);
    return false;
  }
};

// Test with intentionally wrong primary credentials
const testFallback = async (testEmail) => {
  console.log('\n🧪 Test 2: Fallback Email Send (Simulating Primary Failure)');
  console.log('─'.repeat(70));
  
  if (!process.env.FALLBACK_EMAIL_USER || !process.env.FALLBACK_EMAIL_PASS) {
    console.log('\n⚠️  Test 2 SKIPPED - No fallback credentials configured');
    return null;
  }
  
  // Temporarily break primary credentials
  const originalUser = process.env.EMAIL_USER;
  const originalPass = process.env.EMAIL_PASS;
  
  process.env.EMAIL_USER = 'invalid@example.com';
  process.env.EMAIL_PASS = 'invalid_password';
  
  console.log('   Temporarily using invalid primary credentials to test fallback...');
  
  try {
    const result = await sendEmail({
      email: testEmail,
      subject: 'Test Email - Fallback Triggered',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #FF9800;">🔄 Fallback Email System Test</h2>
          <p>This email was sent using the FALLBACK credentials.</p>
          <p><strong>Test Type:</strong> Fallback Send</p>
          <p><strong>Expected:</strong> Should use FALLBACK credentials</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            If you received this email, the fallback system is working correctly!
          </p>
        </div>
      `
    });
    
    // Restore original credentials
    process.env.EMAIL_USER = originalUser;
    process.env.EMAIL_PASS = originalPass;
    
    console.log('\n✅ Test 2 PASSED!');
    console.log(`   Service Used: ${result.service}`);
    console.log(`   Used Fallback: ${result.usedFallback ? 'Yes ✅' : 'No ❌'}`);
    console.log(`   Duration: ${result.duration}ms`);
    console.log(`   Message ID: ${result.messageId}`);
    
    if (!result.usedFallback) {
      console.log('\n⚠️  WARNING: Fallback was not used as expected!');
      return false;
    }
    
    return true;
  } catch (error) {
    // Restore original credentials
    process.env.EMAIL_USER = originalUser;
    process.env.EMAIL_PASS = originalPass;
    
    console.log('\n❌ Test 2 FAILED!');
    console.log(`   Error: ${error.message}`);
    return false;
  }
};

// Main test execution
const runTests = async () => {
  try {
    // Check configuration
    if (!checkConfig()) {
      console.log('\n═'.repeat(70));
      process.exit(1);
    }
    
    // Get test email from user
    console.log('\n📧 Test emails will be sent to PRIMARY email address');
    
    // Always send to primary email for testing
    const testEmailAddress = process.env.EMAIL_USER;
    
    if (!testEmailAddress) {
      console.log('\n❌ No test email address provided!');
      console.log('💡 Set TEST_EMAIL environment variable or provide EMAIL_USER');
      process.exit(1);
    }
    
    console.log(`   Using: ${testEmailAddress}`);
    console.log('\n' + '═'.repeat(70));
    
    // Run tests
    const results = {
      test1: false,
      test2: null
    };
    
    // Test 1: Normal send
    results.test1 = await testEmail(testEmailAddress);
    
    // Wait a bit between tests
    console.log('\n⏳ Waiting 3 seconds before next test...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test 2: Fallback send
    results.test2 = await testFallback(testEmailAddress);
    
    // Summary
    console.log('\n' + '═'.repeat(70));
    console.log('📊 Test Summary');
    console.log('═'.repeat(70));
    console.log(`\nTest 1 (Normal Send):     ${results.test1 ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Test 2 (Fallback Send):   ${results.test2 === null ? '⚠️  SKIPPED' : results.test2 ? '✅ PASSED' : '❌ FAILED'}`);
    
    const totalTests = results.test2 === null ? 1 : 2;
    const passedTests = (results.test1 ? 1 : 0) + (results.test2 ? 1 : 0);
    
    console.log(`\nTotal: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('\n🎉 All tests PASSED! Email system is working correctly.');
    } else {
      console.log('\n⚠️  Some tests FAILED. Please check the errors above.');
    }
    
    console.log('\n💡 Next Steps:');
    console.log('   1. Check your email inbox for test messages');
    console.log('   2. Verify both primary and fallback emails were received');
    console.log('   3. If tests failed, check your email credentials');
    console.log('   4. Make sure 2FA is enabled and App Passwords are correct');
    
    console.log('\n═'.repeat(70));
    
    process.exit(passedTests === totalTests ? 0 : 1);
    
  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
    console.error('\n' + '═'.repeat(70));
    process.exit(1);
  }
};

// Run tests
runTests();
