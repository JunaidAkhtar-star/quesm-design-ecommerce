require('dotenv').config();
const nodemailer = require('nodemailer');

async function testSmtp() {
  console.log('\n--- QueS.M design SMTP Connection Test ---');
  console.log('Host:    ', process.env.SMTP_HOST || '(not set)');
  console.log('Port:    ', process.env.SMTP_PORT || '(default 587)');
  console.log('User:    ', process.env.SMTP_USER || '(not set)');
  console.log('Password:', process.env.SMTP_PASS ? '********' : '(not set)');
  console.log('From:    ', process.env.FROM_EMAIL || '(default)');

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('\n❌ ERROR: SMTP_USER and SMTP_PASS are empty in server/.env!');
    console.log('Please fill in your SMTP credentials in server/.env and run this command again.\n');
    process.exit(1);
  }

  const port = Number(process.env.SMTP_PORT) || 587;
  const isSecure = port === 465;
  const cleanUser = process.env.SMTP_USER.trim();
  const cleanPass = process.env.SMTP_PASS.trim().replace(/^["']|["']$/g, '').replace(/\s+/g, '');

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: port,
    secure: isSecure,
    auth: {
      user: cleanUser,
      pass: cleanPass
    }
  });

  try {
    console.log('\nConnecting and verifying credentials with mail server...');
    await transporter.verify();
    console.log('✅ Connection verified successfully! Your SMTP server is ready.');

    const recipient = process.env.OWNER_EMAIL || process.env.SMTP_USER;
    console.log(`Sending a test email to ${recipient}...`);

    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || `"QueS.M design" <${process.env.SMTP_USER}>`,
      to: recipient,
      subject: '✨ Test Email - QueS.M design SMTP Connected Successfully!',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; border: 1px solid #d4af37; border-radius: 12px; max-width: 500px; margin: auto;">
          <h2 style="color: #b89742; margin-top: 0;">QueS.M design</h2>
          <p>Hello Store Owner,</p>
          <p>Your SMTP mail configuration is <strong>active and working</strong>!</p>
          <p style="color: #666; font-size: 13px;">Customer order confirmations, dispatch notifications, and owner login alerts will now be delivered reliably.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <small style="color: #999;">Sent from QueS.M design E-Commerce Engine</small>
        </div>
      `
    });

    console.log(`🎉 Test email sent successfully! Message ID: ${info.messageId}\n`);
    process.exit(0);
  } catch (err) {
    console.error('\n❌ SMTP Connection Failed:', err.message);
    console.log('\nTroubleshooting Tips:');
    console.log('1. For Gmail: Use an "App Password" (not your normal Gmail login password).');
    console.log('2. For Hostinger/Zoho: Use port 465 (secure: true) or 587.');
    console.log('3. Ensure your email provider allows SMTP relay.\n');
    process.exit(1);
  }
}

testSmtp();

