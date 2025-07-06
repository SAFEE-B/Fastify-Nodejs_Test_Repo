import knex from 'knex';
import { createRequire } from 'module';
import { escapeLikeQuery } from '../utils/validation.js';

const require = createRequire(import.meta.url);
const knexConfig = require('../../knexfile.cjs');

const environment = process.env.NODE_ENV || 'development';
const db = knex(knexConfig[environment]);

class EmailModel {
  /**
   * Get all emails with pagination and filtering
   * @param {Object} options - Query options
   * @param {number} options.limit - Number of emails to return
   * @param {number} options.offset - Number of emails to skip
   * @param {string} options.filter - Filter type (all, unread, starred, read)
   * @returns {Promise<Array>} - Array of emails
   */
  static async getAllEmails(options = {}) {
    const { limit = 20, offset = 0, filter = 'all' } = options;
    
    let query = db('emails').select('*');
    
    // Apply filters
    switch (filter) {
      case 'unread':
        query = query.where('read', false);
        break;
      case 'read':
        query = query.where('read', true);
        break;
      case 'starred':
        query = query.where('starred', true);
        break;
      case 'all':
      default:
        // No filter applied
        break;
    }
    
    return await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  /**
   * Get total count of emails with optional filtering
   * @param {Object} options - Query options
   * @param {string} options.filter - Filter type
   * @returns {Promise<number>} - Total count
   */
  static async getEmailCount(options = {}) {
    const { filter = 'all' } = options;
    
    let query = db('emails').count('* as total');
    
    // Apply filters
    switch (filter) {
      case 'unread':
        query = query.where('read', false);
        break;
      case 'read':
        query = query.where('read', true);
        break;
      case 'starred':
        query = query.where('starred', true);
        break;
      case 'all':
      default:
        // No filter applied
        break;
    }
    
    const result = await query.first();
    return parseInt(result.total);
  }

  /**
   * Get email by ID
   * @param {number} id - Email ID
   * @returns {Promise<Object|null>} - Email object or null
   */
  static async getEmailById(id) {
    if (!id || isNaN(parseInt(id))) {
      throw new Error('Invalid email ID');
    }
    
    return await db('emails').where('id', parseInt(id)).first();
  }

  /**
   * Create new email
   * @param {Object} emailData - Email data
   * @returns {Promise<Object>} - Created email
   */
  static async createEmail(emailData) {
    const { to, cc, bcc, subject, body } = emailData;
    
    const [id] = await db('emails').insert({
      to: to.trim().toLowerCase(),
      cc: cc?.trim().toLowerCase() || null,
      bcc: bcc?.trim().toLowerCase() || null,
      subject: subject.trim(),
      body: body.trim(),
      read: false,
      starred: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    return await this.getEmailById(id);
  }

  /**
   * Update email
   * @param {number} id - Email ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} - Updated email
   */
  static async updateEmail(id, updateData) {
    if (!id || isNaN(parseInt(id))) {
      throw new Error('Invalid email ID');
    }
    
    const allowedFields = ['read', 'starred', 'subject', 'body', 'to', 'cc', 'bcc'];
    const sanitizedData = {};
    
    // Only allow specific fields to be updated
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        sanitizedData[key] = updateData[key];
      }
    });
    
    // Add updated timestamp
    sanitizedData.updated_at = new Date().toISOString();
    
    await db('emails')
      .where('id', parseInt(id))
      .update(sanitizedData);
    
    return await this.getEmailById(id);
  }

  /**
   * Search emails with pagination
   * @param {string} searchTerm - Search term
   * @param {Object} options - Query options
   * @param {number} options.limit - Number of emails to return
   * @param {number} options.offset - Number of emails to skip
   * @returns {Promise<Array>} - Array of matching emails
   */
  static async searchEmails(searchTerm, options = {}) {
    const { limit = 20, offset = 0 } = options;
    const escapedTerm = escapeLikeQuery(searchTerm);
    
    return await db('emails')
      .where(function() {
        this.where('to', 'like', `%${escapedTerm}%`)
          .orWhere('cc', 'like', `%${escapedTerm}%`)
          .orWhere('bcc', 'like', `%${escapedTerm}%`)
          .orWhere('subject', 'like', `%${escapedTerm}%`)
          .orWhere('body', 'like', `%${escapedTerm}%`);
      })
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  /**
   * Get count of search results
   * @param {string} searchTerm - Search term
   * @returns {Promise<number>} - Total count of search results
   */
  static async getSearchCount(searchTerm) {
    const escapedTerm = escapeLikeQuery(searchTerm);
    
    const result = await db('emails')
      .count('* as total')
      .where(function() {
        this.where('to', 'like', `%${escapedTerm}%`)
          .orWhere('cc', 'like', `%${escapedTerm}%`)
          .orWhere('bcc', 'like', `%${escapedTerm}%`)
          .orWhere('subject', 'like', `%${escapedTerm}%`)
          .orWhere('body', 'like', `%${escapedTerm}%`);
      })
      .first();
    
    return parseInt(result.total);
  }

  /**
   * Delete email
   * @param {number} id - Email ID
   * @returns {Promise<boolean>} - Success status
   */
  static async deleteEmail(id) {
    if (!id || isNaN(parseInt(id))) {
      throw new Error('Invalid email ID');
    }
    
    const deletedCount = await db('emails')
      .where('id', parseInt(id))
      .del();
    
    return deletedCount > 0;
  }

  /**
   * Mark email as read/unread
   * @param {number} id - Email ID
   * @param {boolean} read - Read status
   * @returns {Promise<Object>} - Updated email
   */
  static async markAsRead(id, read) {
    return await this.updateEmail(id, { read });
  }

  /**
   * Star/unstar email
   * @param {number} id - Email ID
   * @param {boolean} starred - Starred status
   * @returns {Promise<Object>} - Updated email
   */
  static async toggleStar(id, starred) {
    return await this.updateEmail(id, { starred });
  }

  /**
   * Get email statistics
   * @returns {Promise<Object>} - Email statistics
   */
  static async getEmailStats() {
    const [total, unread, starred] = await Promise.all([
      db('emails').count('* as total').first(),
      db('emails').where('read', false).count('* as unread').first(),
      db('emails').where('starred', true).count('* as starred').first()
    ]);
    
    return {
      total: parseInt(total.total),
      unread: parseInt(unread.unread),
      starred: parseInt(starred.starred)
    };
  }

  /**
   * Bulk update emails
   * @param {Array<number>} ids - Array of email IDs
   * @param {Object} updateData - Data to update
   * @returns {Promise<number>} - Number of updated emails
   */
  static async bulkUpdate(ids, updateData) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error('Invalid email IDs array');
    }
    
    const allowedFields = ['read', 'starred'];
    const sanitizedData = {};
    
    // Only allow specific fields for bulk updates
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        sanitizedData[key] = updateData[key];
      }
    });
    
    sanitizedData.updated_at = new Date().toISOString();
    
    return await db('emails')
      .whereIn('id', ids)
      .update(sanitizedData);
  }

  /**
   * Bulk delete emails
   * @param {Array<number>} ids - Array of email IDs
   * @returns {Promise<number>} - Number of deleted emails
   */
  static async bulkDelete(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error('Invalid email IDs array');
    }
    
    return await db('emails')
      .whereIn('id', ids)
      .del();
  }
}

export default EmailModel;
