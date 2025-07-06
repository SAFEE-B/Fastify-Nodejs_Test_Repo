import EmailModel from '../db/index.js';
import MailService from '../services/mailService.js';
import { validateEmailData, validateSearchTerm } from '../utils/validation.js';

class EmailController {
  /**
   * Get all emails with pagination and filtering
   */
  static async getAllEmails(request, reply) {
    try {
      const { page = 1, limit = 20, filter = 'all' } = request.query;
      const offset = (page - 1) * limit;
      
      const emails = await EmailModel.getAllEmails({ limit, offset, filter });
      const total = await EmailModel.getEmailCount({ filter });
      
      return {
        success: true,
        data: emails,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      request.log.error('Error fetching emails:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch emails'
      });
    }
  }

  /**
   * Get email by ID
   */
  static async getEmailById(request, reply) {
    try {
      const { id } = request.params;
      
      if (!id || isNaN(parseInt(id))) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid email ID',
          message: 'Email ID must be a valid number'
        });
      }

      const email = await EmailModel.getEmailById(parseInt(id));
      
      if (!email) {
        return reply.code(404).send({
          success: false,
          error: 'Email not found',
          message: 'The requested email does not exist'
        });
      }
      
      return { success: true, data: email };
    } catch (error) {
      request.log.error('Error fetching email by ID:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch email'
      });
    }
  }

  /**
   * Search emails with validation
   */
  static async searchEmails(request, reply) {
    try {
      const { term } = request.params;
      const { page = 1, limit = 20 } = request.query;
      const offset = (page - 1) * limit;

      // Validate search term
      const validationError = validateSearchTerm(term);
      if (validationError) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid search term',
          message: validationError
        });
      }

      const emails = await EmailModel.searchEmails(term, { limit, offset });
      const total = await EmailModel.getSearchCount(term);
      
      return {
        success: true,
        data: emails,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      request.log.error('Error searching emails:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to search emails'
      });
    }
  }

  /**
   * Create new email with validation
   */
  static async createEmail(request, reply) {
    try {
      const emailData = request.body;
      
      // Validate email data
      const validationError = validateEmailData(emailData);
      if (validationError) {
        return reply.code(400).send({
          success: false,
          error: 'Validation error',
          message: validationError
        });
      }

      // Sanitize email data
      const sanitizedData = {
        to: emailData.to.trim().toLowerCase(),
        cc: emailData.cc?.trim().toLowerCase() || null,
        bcc: emailData.bcc?.trim().toLowerCase() || null,
        subject: emailData.subject.trim(),
        body: emailData.body.trim()
      };
      
      // Save email to database first
      const newEmail = await EmailModel.createEmail(sanitizedData);
      
      // Attempt to send email via Gmail SMTP
      const sendResult = await MailService.sendEmail(sanitizedData);
      
      // Prepare response based on sending result
      const responseData = {
        success: true,
        data: newEmail,
        emailSent: sendResult.sent,
        message: sendResult.message
      };

      // If there was an error sending the email, include it in response
      if (!sendResult.success && sendResult.error) {
        responseData.sendError = sendResult.error;
      }

      return reply.code(201).send(responseData);
    } catch (error) {
      request.log.error('Error creating email:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to create email'
      });
    }
  }

  /**
   * Update email (mark as read/unread, star/unstar)
   */
  static async updateEmail(request, reply) {
    try {
      const { id } = request.params;
      const updateData = request.body;
      
      if (!id || isNaN(parseInt(id))) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid email ID',
          message: 'Email ID must be a valid number'
        });
      }

      const email = await EmailModel.getEmailById(parseInt(id));
      if (!email) {
        return reply.code(404).send({
          success: false,
          error: 'Email not found',
          message: 'The requested email does not exist'
        });
      }

      const updatedEmail = await EmailModel.updateEmail(parseInt(id), updateData);
      return { success: true, data: updatedEmail };
    } catch (error) {
      request.log.error('Error updating email:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to update email'
      });
    }
  }

  /**
   * Delete email
   */
  static async deleteEmail(request, reply) {
    try {
      const { id } = request.params;
      
      if (!id || isNaN(parseInt(id))) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid email ID',
          message: 'Email ID must be a valid number'
        });
      }

      const email = await EmailModel.getEmailById(parseInt(id));
      if (!email) {
        return reply.code(404).send({
          success: false,
          error: 'Email not found',
          message: 'The requested email does not exist'
        });
      }

      await EmailModel.deleteEmail(parseInt(id));
      return { success: true, message: 'Email deleted successfully' };
    } catch (error) {
      request.log.error('Error deleting email:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to delete email'
      });
    }
  }

  /**
   * Test email functionality
   */
  static async testEmail(request, reply) {
    try {
      const result = await MailService.sendTestEmail();
      return { success: true, ...result };
    } catch (error) {
      request.log.error('Error sending test email:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to send test email'
      });
    }
  }

  /**
   * Get SMTP status
   */
  static async getSmtpStatus(request, reply) {
    try {
      const isConnected = await MailService.verifyConnection();
      return { 
        success: true, 
        smtpConfigured: !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD),
        smtpConnected: isConnected 
      };
    } catch (error) {
      request.log.error('Error checking SMTP status:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to check SMTP status'
      });
    }
  }
}

export default EmailController; 