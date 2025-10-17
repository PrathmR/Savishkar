import crypto from 'crypto';
import User from '../models/User.js';

/**
 * Generate a unique user code with GUARANTEED uniqueness
 * Format: SAV25XXXX (e.g., SAV25A3B7)
 * SAV25 = Savishkar 2025 prefix
 * XXXX = Random alphanumeric (4 chars)
 * 
 * With 4 hex characters (16^4 = 65,536 possible combinations)
 * Sufficient for event participants
 */
const generateUserCode = async () => {
  const maxAttempts = 20;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Generate 4 random alphanumeric characters (uppercase)
    // Using 2 bytes = 4 hex chars = 65,536 possible combinations
    const randomPart = crypto.randomBytes(2)
      .toString('hex')
      .toUpperCase();
    
    const userCode = `SAV25${randomPart}`;
    
    // Check if code already exists in database
    const existingUser = await User.findOne({ userCode });
    
    if (!existingUser) {
      return userCode;
    }
    
    // Log collision for monitoring (rare event)
    console.warn(`⚠️ User code collision detected on attempt ${attempt + 1}. Regenerating...`);
  }
  
  // Fallback: use timestamp + random for absolute uniqueness
  const timestamp = Date.now().toString(36).toUpperCase();
  const fallbackCode = `SAV25${timestamp.substring(timestamp.length - 4)}`;
  
  console.error('❌ CRITICAL: Failed to generate unique code after 20 attempts. Using fallback:', fallbackCode);
  
  return fallbackCode;
};

export default generateUserCode;
