import { useState, useEffect, useCallback, useRef } from 'react';
import { emailApi, apiUtils } from '../services/api.js';

/**
 * Custom hook for managing email state and operations
 */
export function useEmails() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Cache for storing email data
  const emailCache = useRef(new Map());
  const lastFetchTime = useRef(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Check if cache is still valid
   */
  const isCacheValid = useCallback(() => {
    return Date.now() - lastFetchTime.current < CACHE_DURATION;
  }, []);

  /**
   * Get emails from API or cache
   */
  const fetchEmails = useCallback(async (params = {}) => {
    const { page = 1, limit = 20, filter = 'all', forceRefresh = false } = params;
    
    // Check cache first
    const cacheKey = `${page}-${limit}-${filter}`;
    if (!forceRefresh && emailCache.current.has(cacheKey) && isCacheValid()) {
      const cachedData = emailCache.current.get(cacheKey);
      setEmails(cachedData.emails);
      setPagination(cachedData.pagination);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await emailApi.getEmails({ page, limit, filter });
      
      if (response.success) {
        setEmails(response.data);
        setPagination(response.pagination);
        
        // Cache the result
        emailCache.current.set(cacheKey, {
          emails: response.data,
          pagination: response.pagination
        });
        lastFetchTime.current = Date.now();
      } else {
        throw new Error(response.message || 'Failed to fetch emails');
      }
    } catch (err) {
      const errorInfo = apiUtils.handleError(err, 'Failed to fetch emails');
      setError(errorInfo);
      console.error('Error fetching emails:', errorInfo);
    } finally {
      setLoading(false);
    }
  }, [isCacheValid]);

  /**
   * Search emails
   */
  const searchEmails = useCallback(async (term, params = {}) => {
    if (!term || term.trim().length < 2) {
      // If search term is too short, fetch all emails
      return fetchEmails({ ...params, filter });
    }

    setLoading(true);
    setError(null);

    try {
      const response = await emailApi.searchEmails(term, params);
      
      if (response.success) {
        setEmails(response.data);
        setPagination(response.pagination);
      } else {
        throw new Error(response.message || 'Failed to search emails');
      }
    } catch (err) {
      const errorInfo = apiUtils.handleError(err, 'Failed to search emails');
      setError(errorInfo);
      console.error('Error searching emails:', errorInfo);
    } finally {
      setLoading(false);
    }
  }, [fetchEmails, filter]);

  /**
   * Create new email
   */
  const createEmail = useCallback(async (emailData) => {
    setLoading(true);
    setError(null);

    try {
      const sanitizedData = apiUtils.sanitizeEmailData(emailData);
      const response = await emailApi.createEmail(sanitizedData);
      
      if (response.success) {
        // Add new email to the beginning of the list
        setEmails(prev => [response.data, ...prev]);
        
        // Clear cache to force refresh on next fetch
        emailCache.current.clear();
        
        return response;
      } else {
        throw new Error(response.message || 'Failed to create email');
      }
    } catch (err) {
      const errorInfo = apiUtils.handleError(err, 'Failed to create email');
      setError(errorInfo);
      console.error('Error creating email:', errorInfo);
      throw errorInfo;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update email
   */
  const updateEmail = useCallback(async (id, updateData) => {
    try {
      const response = await emailApi.updateEmail(id, updateData);
      
      if (response.success) {
        // Update email in the list
        setEmails(prev => prev.map(email => 
          email.id === id ? response.data : email
        ));
        
        // Clear cache
        emailCache.current.clear();
        
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update email');
      }
    } catch (err) {
      const errorInfo = apiUtils.handleError(err, 'Failed to update email');
      setError(errorInfo);
      console.error('Error updating email:', errorInfo);
      throw errorInfo;
    }
  }, []);

  /**
   * Delete email
   */
  const deleteEmail = useCallback(async (id) => {
    try {
      const response = await emailApi.deleteEmail(id);
      
      if (response.success) {
        // Remove email from the list
        setEmails(prev => prev.filter(email => email.id !== id));
        
        // Clear cache
        emailCache.current.clear();
        
        return response;
      } else {
        throw new Error(response.message || 'Failed to delete email');
      }
    } catch (err) {
      const errorInfo = apiUtils.handleError(err, 'Failed to delete email');
      setError(errorInfo);
      console.error('Error deleting email:', errorInfo);
      throw errorInfo;
    }
  }, []);

  /**
   * Mark email as read/unread
   */
  const markAsRead = useCallback(async (id, read) => {
    return updateEmail(id, { read });
  }, [updateEmail]);

  /**
   * Star/unstar email
   */
  const toggleStar = useCallback(async (id, starred) => {
    return updateEmail(id, { starred });
  }, [updateEmail]);

  /**
   * Bulk update emails
   */
  const bulkUpdate = useCallback(async (ids, updateData) => {
    try {
      const response = await emailApi.bulkUpdate(ids, updateData);
      
      if (response.success) {
        // Update emails in the list
        setEmails(prev => prev.map(email => 
          ids.includes(email.id) ? { ...email, ...updateData } : email
        ));
        
        // Clear cache
        emailCache.current.clear();
        
        return response;
      } else {
        throw new Error(response.message || 'Failed to bulk update emails');
      }
    } catch (err) {
      const errorInfo = apiUtils.handleError(err, 'Failed to bulk update emails');
      setError(errorInfo);
      console.error('Error bulk updating emails:', errorInfo);
      throw errorInfo;
    }
  }, []);

  /**
   * Bulk delete emails
   */
  const bulkDelete = useCallback(async (ids) => {
    try {
      const response = await emailApi.bulkDelete(ids);
      
      if (response.success) {
        // Remove emails from the list
        setEmails(prev => prev.filter(email => !ids.includes(email.id)));
        
        // Clear cache
        emailCache.current.clear();
        
        return response;
      } else {
        throw new Error(response.message || 'Failed to bulk delete emails');
      }
    } catch (err) {
      const errorInfo = apiUtils.handleError(err, 'Failed to bulk delete emails');
      setError(errorInfo);
      console.error('Error bulk deleting emails:', errorInfo);
      throw errorInfo;
    }
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Refresh emails
   */
  const refreshEmails = useCallback(() => {
    return fetchEmails({ 
      page: pagination.page, 
      limit: pagination.limit, 
      filter, 
      forceRefresh: true 
    });
  }, [fetchEmails, pagination.page, pagination.limit, filter]);

  /**
   * Change page
   */
  const changePage = useCallback((newPage) => {
    fetchEmails({ 
      page: newPage, 
      limit: pagination.limit, 
      filter 
    });
  }, [fetchEmails, pagination.limit, filter]);

  /**
   * Change filter
   */
  const changeFilter = useCallback((newFilter) => {
    setFilter(newFilter);
    fetchEmails({ 
      page: 1, 
      limit: pagination.limit, 
      filter: newFilter 
    });
  }, [fetchEmails, pagination.limit]);

  /**
   * Initial load
   */
  useEffect(() => {
    fetchEmails({ page: 1, limit: 20, filter: 'all' });
  }, [fetchEmails]);

  return {
    // State
    emails,
    loading,
    error,
    pagination,
    filter,
    searchTerm,
    
    // Actions
    fetchEmails,
    searchEmails,
    createEmail,
    updateEmail,
    deleteEmail,
    markAsRead,
    toggleStar,
    bulkUpdate,
    bulkDelete,
    clearError,
    refreshEmails,
    changePage,
    changeFilter,
    setSearchTerm,
    setFilter
  };
} 