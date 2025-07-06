import 'dotenv/config';
import MailService from './src/services/mailService.js';

async function testEmailConfiguration() {
  console.log('🧪 Testing Gmail SMTP Configuration...\n');

  // Check if environment variables are set
  console.log('📋 Configuration Check:');
  console.log(`   GMAIL_USER: ${process.env.GMAIL_USER ? '✅ Set' : '❌ Missing'}`);
  console.log(`   GMAIL_APP_PASSWORD: ${process.env.GMAIL_APP_PASSWORD ? '✅ Set' : '❌ Missing'}\n`);

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log('❌ Gmail SMTP credentials missing!');
    console.log('📖 Please see backend/env-setup.md for configuration instructions.');
    process.exit(1);
  }

  try {
    // Test SMTP connection
    console.log('🔌 Testing SMTP connection...');
    const isConnected = await MailService.verifyConnection();
    
    if (!isConnected) {
      console.log('❌ SMTP connection failed!');
      console.log('🔍 Please check your Gmail credentials and internet connection.');
      process.exit(1);
    }

    console.log('✅ SMTP connection successful!\n');

    // Send test email
    console.log('📧 Sending test email...');
    const result = await MailService.sendTestEmail();

    if (result.success && result.sent) {
      console.log('✅ Test email sent successfully!');
      console.log(`📨 Message ID: ${result.messageId}`);
      console.log(`📬 Check your inbox at: ${process.env.GMAIL_USER}`);
    } else {
      console.log('❌ Failed to send test email:');
      console.log(`   Error: ${result.error || 'Unknown error'}`);
    }

  } catch (error) {
    console.log('❌ Test failed with error:');
    console.log(`   ${error.message}`);
    process.exit(1);
  }

  console.log('\n🎉 Gmail SMTP test completed!');
  process.exit(0);
}

// Run the test
testEmailConfiguration(); 