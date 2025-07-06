/**
 * Validation utilities for email data and search terms
 */

/**
 * Validate email address format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate email data for creation
 * @param {Object} emailData - Email data to validate
 * @returns {string|null} - Error message or null if valid
 */
export function validateEmailData(emailData) {
  if (!emailData || typeof emailData !== 'object') {
    return 'Email data is required';
  }

  const { to, subject, body, cc, bcc } = emailData;

  // Validate required fields
  if (!to || typeof to !== 'string' || !to.trim()) {
    return 'Recipient email is required';
  }

  if (!subject || typeof subject !== 'string' || !subject.trim()) {
    return 'Subject is required';
  }

  if (!body || typeof body !== 'string' || !body.trim()) {
    return 'Message body is required';
  }

  // Validate email formats
  if (!isValidEmail(to)) {
    return 'Invalid recipient email format';
  }

  if (cc && !isValidEmail(cc)) {
    return 'Invalid CC email format';
  }

  if (bcc && !isValidEmail(bcc)) {
    return 'Invalid BCC email format';
  }

  // Validate field lengths
  if (subject.trim().length > 255) {
    return 'Subject must be less than 255 characters';
  }

  if (body.trim().length > 10000) {
    return 'Message body must be less than 10,000 characters';
  }

  if (to.trim().length > 255) {
    return 'Recipient email must be less than 255 characters';
  }

  if (cc && cc.trim().length > 255) {
    return 'CC email must be less than 255 characters';
  }

  if (bcc && bcc.trim().length > 255) {
    return 'BCC email must be less than 255 characters';
  }

  return null;
}

/**
 * Validate search term
 * @param {string} term - Search term to validate
 * @returns {string|null} - Error message or null if valid
 */
export function validateSearchTerm(term) {
  if (!term || typeof term !== 'string') {
    return 'Search term is required';
  }

  const trimmedTerm = term.trim();
  
  if (trimmedTerm.length === 0) {
    return 'Search term cannot be empty';
  }

  if (trimmedTerm.length < 2) {
    return 'Search term must be at least 2 characters long';
  }

  if (trimmedTerm.length > 100) {
    return 'Search term must be less than 100 characters';
  }

  // Check for potentially dangerous characters (basic SQL injection prevention)
  const dangerousChars = /[<>'"&]/;
  if (dangerousChars.test(trimmedTerm)) {
    return 'Search term contains invalid characters';
  }

  return null;
}

/**
 * Sanitize email data
 * @param {Object} emailData - Email data to sanitize
 * @returns {Object} - Sanitized email data
 */
export function sanitizeEmailData(emailData) {
  return {
    to: emailData.to?.trim().toLowerCase() || '',
    cc: emailData.cc?.trim().toLowerCase() || null,
    bcc: emailData.bcc?.trim().toLowerCase() || null,
    subject: emailData.subject?.trim() || '',
    body: emailData.body?.trim() || ''
  };
}

/**
 * Validate pagination parameters
 * @param {Object} params - Pagination parameters
 * @returns {Object} - Validated pagination parameters
 */
export function validatePagination(params) {
  const { page = 1, limit = 20 } = params;
  
  const validatedPage = Math.max(1, parseInt(page) || 1);
  const validatedLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));
  
  return {
    page: validatedPage,
    limit: validatedLimit,
    offset: (validatedPage - 1) * validatedLimit
  };
}

/**
 * Validate filter parameter
 * @param {string} filter - Filter to validate
 * @returns {string} - Validated filter
 */
export function validateFilter(filter) {
  const validFilters = ['all', 'unread', 'starred', 'read'];
  return validFilters.includes(filter) ? filter : 'all';
}

/**
 * Escape special characters for SQL LIKE queries
 * @param {string} str - String to escape
 * @returns {string} - Escaped string
 */
export function escapeLikeQuery(str) {
  if (!str || typeof str !== 'string') return '';
  
  return str
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_');
} 