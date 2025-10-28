/**
 * Email Templates - Color Hunt Palette
 * https://colorhunt.co/palette/fef3e2fab12ffa812fdd0303
 * 
 * ONLY 4 COLORS USED:
 * #FEF3E2 - Cream (background, light text)
 * #FAB12F - Yellow (accents, gradients)
 * #FA812F - Orange (primary, gradients)
 * #DD0303 - Red (warnings, alerts)
 */

/**
 * Base email template wrapper
 * @param {string} content - HTML content to wrap
 * @param {string} title - Email title
 * @returns {string} - Complete HTML email
 */
export const emailWrapper = (content, title = 'Savishkar 2025') => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', Arial, Helvetica, sans-serif;
      background-color: #FEF3E2;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border: 3px solid #FA812F;
      border-radius: 12px;
    }
    .header {
      background: linear-gradient(135deg, #FA812F 0%, #FAB12F 100%);
      padding: 30px 20px;
      text-align: center;
      color: #FFFFFF;
      border-radius: 9px 9px 0 0;
      border-bottom: 3px solid #FA812F;
    }
    .content {
      padding: 30px 25px;
      color: #333333;
      line-height: 1.6;
      background-color: #FEF3E2;
    }
    .footer {
      background-color: #FEF3E2;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666666;
      border-top: 2px solid #FA812F;
      border-radius: 0 0 9px 9px;
    }
    .button {
      display: inline-block;
      padding: 14px 35px;
      margin: 20px 0;
      background: linear-gradient(135deg, #FA812F 0%, #FAB12F 100%);
      color: #FFFFFF !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      font-size: 16px;
      box-shadow: 0 4px 15px rgba(250, 129, 47, 0.3);
    }
    .otp-code {
      font-size: 42px;
      font-weight: bold;
      color: #FA812F;
      letter-spacing: 8px;
      padding: 25px;
      background-color: #FFFFFF;
      border-radius: 12px;
      text-align: center;
      margin: 25px 0;
      border: 3px solid #FAB12F;
      box-shadow: 0 4px 12px rgba(250, 177, 47, 0.3);
    }
    .info-box {
      background-color: rgba(250, 177, 47, 0.15);
      border-left: 4px solid #FA812F;
      padding: 18px;
      margin: 20px 0;
      border-radius: 8px;
    }
    .warning-box {
      background-color: rgba(221, 3, 3, 0.1);
      border-left: 4px solid #DD0303;
      padding: 18px;
      margin: 20px 0;
      border-radius: 8px;
    }
    .code-box {
      background: linear-gradient(135deg, #FA812F 0%, #FAB12F 100%);
      padding: 30px;
      border-radius: 12px;
      text-align: center;
      margin: 25px 0;
      box-shadow: 0 4px 15px rgba(250, 129, 47, 0.3);
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1 style="margin: 0; font-size: 32px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">Savishkar 2025</h1>
      <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.95; letter-spacing: 1px;">JCER Technical Fest</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p style="margin: 0 0 10px 0; font-weight: 600; color: #FA812F;"><strong>Savishkar 2025</strong></p>
      <p style="margin: 0 0 10px 0; color: #666666;">Jhulelal College of Engineering & Research</p>
      <p style="margin: 0 0 10px 0; color: #666666;">savishkarjcer@gmail.com</p>
      <p style="margin: 10px 0 0 0; font-size: 11px; color: #999999;">
        This is an automated email. Please do not reply to this message.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
};

/**
 * OTP Verification Email Template
 */
export const otpEmailTemplate = (otp, userName = 'User') => {
  const content = `
    <h2 style="color: #FA812F; margin-top: 0; font-size: 26px;">Email Verification Required</h2>
    <p style="font-size: 16px; color: #333333;">Hello <strong style="color: #FA812F;">${userName}</strong>,</p>
    <p style="color: #333333;">Thank you for registering for Savishkar 2025! Please verify your email address to complete your registration.</p>
    
    <div class="otp-code">${otp}</div>
    
    <div class="info-box">
      <p style="margin: 0; color: #FA812F; font-weight: 600;"><strong>Important:</strong></p>
      <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #333333;">
        <li>This OTP is valid for <strong>10 minutes</strong></li>
        <li>Do not share this code with anyone</li>
        <li>If you didn't request this, please ignore this email</li>
      </ul>
    </div>
    
    <p style="color: #333333;">Enter this OTP on the verification page to activate your account.</p>
    
    <p style="margin-top: 30px; color: #333333;">
      Best regards,<br>
      <strong style="color: #FA812F;">Team Savishkar</strong>
    </p>
  `;
  
  return emailWrapper(content, 'Verify Your Email - Savishkar 2025');
};

/**
 * Welcome Email Template
 */
export const welcomeEmailTemplate = (userName, userCode) => {
  const content = `
    <h2 style="color: #FA812F; margin-top: 0; font-size: 26px;">Welcome to Savishkar 2025!</h2>
    <p style="font-size: 16px; color: #333333;">Hello <strong style="color: #FA812F;">${userName}</strong>,</p>
    <p style="color: #333333;">Congratulations! Your email has been verified successfully. Welcome to Savishkar 2025 - JCER's premier technical fest!</p>
    
    <div class="code-box">
      <p style="color: #FFFFFF; font-size: 14px; margin: 0 0 10px 0; font-weight: 600; letter-spacing: 2px;">YOUR UNIQUE CODE</p>
      <div style="font-size: 36px; font-weight: bold; color: #FFFFFF; text-align: center; letter-spacing: 4px; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">
        ${userCode}
      </div>
      <p style="margin: 10px 0 0 0; font-size: 13px; color: #FFFFFF; opacity: 0.95;">
        Use this code for all event registrations and communications
      </p>
    </div>
    
    <h3 style="color: #FA812F; font-size: 20px;">Next Steps:</h3>
    <ol style="line-height: 1.8; color: #333333;">
      <li><strong style="color: #FA812F;">Browse Events:</strong> Explore exciting technical competitions</li>
      <li><strong style="color: #FA812F;">Register:</strong> Sign up for your favorite events</li>
      <li><strong style="color: #FA812F;">Participate:</strong> Showcase your skills and win prizes!</li>
    </ol>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/events" class="button">
        Browse Events
      </a>
    </div>
    
    <p style="color: #333333;">We're excited to have you join us. Get ready for an amazing experience!</p>
    
    <p style="margin-top: 30px; color: #333333;">
      Best regards,<br>
      <strong style="color: #FA812F;">Team Savishkar</strong>
    </p>
  `;
  
  return emailWrapper(content, 'Welcome to Savishkar 2025');
};

/**
 * Password Reset Email Template
 */
export const passwordResetTemplate = (resetUrl, userName = 'User') => {
  const content = `
    <h2 style="color: #FA812F; margin-top: 0; font-size: 26px;">Password Reset Request</h2>
    <p style="font-size: 16px; color: #333333;">Hello <strong style="color: #FA812F;">${userName}</strong>,</p>
    <p style="color: #333333;">We received a request to reset your password for your Savishkar 2025 account.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" class="button">
        Reset Password
      </a>
    </div>
    
    <div class="warning-box">
      <p style="margin: 0; color: #DD0303; font-weight: 600;"><strong>Security Notice:</strong></p>
      <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #333333;">
        <li>This link is valid for <strong>1 hour</strong></li>
        <li>If you didn't request this, please ignore this email</li>
        <li>Your password will remain unchanged</li>
      </ul>
    </div>
    
    <p style="font-size: 13px; color: #666666;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${resetUrl}" style="color: #FA812F; word-break: break-all; text-decoration: underline;">${resetUrl}</a>
    </p>
    
    <p style="margin-top: 30px; color: #333333;">
      Best regards,<br>
      <strong style="color: #FA812F;">Team Savishkar</strong>
    </p>
  `;
  
  return emailWrapper(content, 'Password Reset - Savishkar 2025');
};

/**
 * User Code Email Template
 */
export const userCodeTemplate = (userName, userCode) => {
  const content = `
    <h2 style="color: #FA812F; margin-top: 0; font-size: 26px;">Your Savishkar 2025 Unique Code</h2>
    <p style="font-size: 16px; color: #333333;">Hello <strong style="color: #FA812F;">${userName}</strong>,</p>
    <p style="color: #333333;">Here is your unique code for Savishkar 2025:</p>
    
    <div class="code-box">
      <p style="color: #FFFFFF; font-size: 14px; margin: 0 0 10px 0; font-weight: 600; letter-spacing: 2px;">YOUR UNIQUE CODE</p>
      <div style="font-size: 36px; font-weight: bold; color: #FFFFFF; text-align: center; letter-spacing: 4px; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">
        ${userCode}
      </div>
    </div>
    
    <p style="color: #FA812F; font-weight: 600;"><strong>📌 Important:</strong></p>
    <ul style="line-height: 1.8; color: #333333;">
      <li>Use this code for event registrations</li>
      <li>Keep this code safe for future reference</li>
      <li>You can find this code in your profile anytime</li>
    </ul>
    
    <p style="margin-top: 30px; color: #333333;">
      Best regards,<br>
      <strong style="color: #FA812F;">Team Savishkar</strong>
    </p>
  `;
  
  return emailWrapper(content, 'Your Unique Code - Savishkar 2025');
};

/**
 * New OTP Request Email Template
 */
export const newOtpTemplate = (otp, userName = 'User') => {
  const content = `
    <h2 style="color: #FA812F; margin-top: 0; font-size: 26px;">New OTP Request</h2>
    <p style="font-size: 16px; color: #333333;">Hello <strong style="color: #FA812F;">${userName}</strong>,</p>
    <p style="color: #333333;">You requested a new OTP for email verification. Here is your new code:</p>
    
    <div class="otp-code">${otp}</div>
    
    <div class="info-box">
      <p style="margin: 0; color: #FA812F; font-weight: 600;"><strong>Important:</strong></p>
      <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #333333;">
        <li>This OTP is valid for <strong>10 minutes</strong></li>
        <li>Previous OTP codes are now invalid</li>
        <li>Do not share this code with anyone</li>
      </ul>
    </div>
    
    <p style="color: #333333;">Enter this OTP on the verification page to complete your registration.</p>
    
    <p style="margin-top: 30px; color: #333333;">
      Best regards,<br>
      <strong style="color: #FA812F;">Team Savishkar</strong>
    </p>
  `;
  
  return emailWrapper(content, 'New OTP Request - Savishkar 2025');
};

export default {
  emailWrapper,
  otpEmailTemplate,
  welcomeEmailTemplate,
  passwordResetTemplate,
  userCodeTemplate,
  newOtpTemplate
};
