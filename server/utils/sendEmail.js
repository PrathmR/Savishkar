import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  try {
    // Check if email configuration exists
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email configuration missing in .env file');
      console.log('Required variables: EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS');
      throw new Error('Email configuration is incomplete');
    }

    console.log('📧 Attempting to send email to:', options.email);
    console.log('📧 Using email host:', process.env.EMAIL_HOST);
    console.log('📧 Using email user:', process.env.EMAIL_USER);

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false // For development only
      }
    });

    // Verify connection
    await transporter.verify();
    console.log('✅ Email server connection verified');

    // Email options
    const mailOptions = {
      from: `Savishkar 2025 <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    console.log('✅ Email sent to:', options.email);
    
    return info;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    console.error('❌ Full error:', error);
    throw new Error(`Email could not be sent: ${error.message}`);
  }
};

export default sendEmail;
