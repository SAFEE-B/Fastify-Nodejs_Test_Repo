/**
 * API Service for email operations
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Make HTTP request with error handling
 */
async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    // Handle non-2xx responses
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorData = null;
      
      try {
        const errorResponse = await response.json();
        errorMessage = errorResponse.message || errorMessage;
        errorData = errorResponse;
      } catch (e) {
        // If error response is not JSON, use default message
      }
      
      throw new ApiError(errorMessage, response.status, errorData);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return null;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiError(
      error.message || 'Network error occurred',
      0,
      { originalError: error }
    );
  }
}

/**
 * Email API service
 */
export const emailApi = {
  /**
   * Get all emails with pagination and filtering
   */
  async getEmails(params = {}) {
    const { page = 1, limit = 20, filter = 'all' } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      filter
    });
    
    return makeRequest(`/emails?${queryParams}`);
  },

  /**
   * Get email by ID
   */
  async getEmailById(id) {
    if (!id || isNaN(parseInt(id))) {
      throw new ApiError('Invalid email ID', 400);
    }
    
    return makeRequest(`/emails/${id}`);
  },

  /**
   * Search emails
   */
  async searchEmails(term, params = {}) {
    if (!term || typeof term !== 'string' || term.trim().length < 2) {
      throw new ApiError('Search term must be at least 2 characters long', 400);
    }
    
    const { page = 1, limit = 20 } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    return makeRequest(`/emails/search/${encodeURIComponent(term)}?${queryParams}`);
  },

  /**
   * Create new email
   */
  async createEmail(emailData) {
    if (!emailData || typeof emailData !== 'object') {
      throw new ApiError('Email data is required', 400);
    }

    const { to, subject, body, cc, bcc } = emailData;
    
    // Basic validation
    if (!to || !subject || !body) {
      throw new ApiError('To, subject, and body are required', 400);
    }

    return makeRequest('/emails', {
      method: 'POST',
      body: JSON.stringify({
        to: to.trim(),
        subject: subject.trim(),
        body: body.trim(),
        cc: cc?.trim() || null,
        bcc: bcc?.trim() || null
      })
    });
  },

  /**
   * Update email
   */
  async updateEmail(id, updateData) {
    if (!id || isNaN(parseInt(id))) {
      throw new ApiError('Invalid email ID', 400);
    }

    if (!updateData || typeof updateData !== 'object') {
      throw new ApiError('Update data is required', 400);
    }

    return makeRequest(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  },

  /**
   * Delete email
   */
  async deleteEmail(id) {
    if (!id || isNaN(parseInt(id))) {
      throw new ApiError('Invalid email ID', 400);
    }

    return makeRequest(`/emails/${id}`, {
      method: 'DELETE'
    });
  },

  /**
   * Mark email as read/unread
   */
  async markAsRead(id, read) {
    return this.updateEmail(id, { read });
  },

  /**
   * Star/unstar email
   */
  async toggleStar(id, starred) {
    return this.updateEmail(id, { starred });
  },

  /**
   * Bulk update emails
   */
  async bulkUpdate(ids, updateData) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ApiError('Email IDs array is required', 400);
    }

    return makeRequest('/emails/bulk-update', {
      method: 'PUT',
      body: JSON.stringify({ ids, updateData })
    });
  },

  /**
   * Bulk delete emails
   */
  async bulkDelete(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ApiError('Email IDs array is required', 400);
    }

    return makeRequest('/emails/bulk-delete', {
      method: 'DELETE',
      body: JSON.stringify({ ids })
    });
  }
};

/**
 * SMTP API service
 */
export const smtpApi = {
  /**
   * Test email functionality
   */
  async testEmail() {
    return makeRequest('/test-email', {
      method: 'POST'
    });
  },

  /**
   * Get SMTP status
   */
  async getSmtpStatus() {
    return makeRequest('/smtp-status');
  }
};

/**
 * Health check API
 */
export const healthApi = {
  /**
   * Check API health
   */
  async checkHealth() {
    return makeRequest('/health', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

/**
 * Utility functions
 */
export const apiUtils = {
  /**
   * Handle API errors gracefully
   */
  handleError(error, defaultMessage = 'An error occurred') {
    if (error instanceof ApiError) {
      return {
        message: error.message,
        status: error.status,
        data: error.data
      };
    }
    
    return {
      message: defaultMessage,
      status: 0,
      data: { originalError: error }
    };
  },

  /**
   * Validate email format
   */
  isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  },

  /**
   * Sanitize email data
   */
  sanitizeEmailData(data) {
    return {
      to: data.to?.trim().toLowerCase() || '',
      cc: data.cc?.trim().toLowerCase() || null,
      bcc: data.bcc?.trim().toLowerCase() || null,
      subject: data.subject?.trim() || '',
      body: data.body?.trim() || ''
    };
  }
};

export { ApiError }; 