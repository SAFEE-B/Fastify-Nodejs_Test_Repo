import nodemailer from 'nodemailer';

class MailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Gmail SMTP Configuration
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.GMAIL_USER, // Your Gmail address
        pass: process.env.GMAIL_APP_PASSWORD, // Your Gmail App Password (not regular password)
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Gmail SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('❌ Gmail SMTP connection failed:', error.message);
      return false;
    }
  }

  async sendEmail(emailData) {
    const { to, cc, bcc, subject, body } = emailData;

    // Check if SMTP is configured
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.warn('⚠️ Gmail SMTP not configured. Email saved to database only.');
      return { success: true, sent: false, message: 'Email saved locally (SMTP not configured)' };
    }

    try {
      const mailOptions = {
        from: {
          name: 'Email Client App',
          address: process.env.GMAIL_USER
        },
        to: to,
        cc: cc || undefined,
        bcc: bcc || undefined,
        subject: subject,
        text: body,
        html: body.replace(/\n/g, '<br>'), // Convert line breaks to HTML
      };

      // Remove empty cc/bcc fields
      if (!cc) delete mailOptions.cc;
      if (!bcc) delete mailOptions.bcc;

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ Email sent successfully:', info.messageId);
      return { 
        success: true, 
        sent: true, 
        messageId: info.messageId,
        message: 'Email sent successfully via Gmail SMTP'
      };
    } catch (error) {
      console.error('❌ Failed to send email:', error.message);
      
      // If it's an authentication error, provide helpful message
      if (error.message.includes('Invalid login')) {
        return { 
          success: false, 
          sent: false, 
          error: 'Gmail authentication failed. Please check your App Password.',
          message: 'Email saved to database, but sending failed'
        };
      }

      return { 
        success: false, 
        sent: false, 
        error: error.message,
        message: 'Email saved to database, but sending failed'
      };
    }
  }

  // Test email functionality
  async sendTestEmail() {
    const testEmail = {
      to: process.env.GMAIL_USER, // Send test email to yourself
      subject: 'Test Email from Email Client App',
      body: 'This is a test email to verify Gmail SMTP configuration.\n\nIf you receive this, your email setup is working correctly!'
    };

    return await this.sendEmail(testEmail);
  }
}

export default new MailService(); 