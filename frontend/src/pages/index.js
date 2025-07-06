import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Fab,
  AppBar,
  Toolbar,
  InputAdornment,
  Divider,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Snackbar,
  Alert,
  Chip,
  Tooltip,
  useMediaQuery,
  useTheme,
  Fade,
  Slide,
  Zoom
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Import components and hooks
import EmailList from '../components/EmailList';
import { useEmails } from '../hooks/useEmails';
import { useSearchDebounce } from '../hooks/useDebounce';
import { emailApi, apiUtils } from '../services/api';

// Enhanced theme with better colors and typography
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
    subtitle2: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0 6px 20px rgba(25, 118, 210, 0.3)',
        },
      },
    },
  },
});

// Enhanced Compose Email Dialog Component
function ComposeEmailDialog({ open, onClose, onEmailSent }) {
  const [formData, setFormData] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: ''
  });
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.to.trim()) newErrors.to = 'Recipient is required';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.body.trim()) newErrors.body = 'Message body is required';
    
    // Email validation
    if (formData.to && !apiUtils.isValidEmail(formData.to)) {
      newErrors.to = 'Please enter a valid email address';
    }
    
    if (formData.cc && !apiUtils.isValidEmail(formData.cc)) {
      newErrors.cc = 'Please enter a valid email address';
    }
    
    if (formData.bcc && !apiUtils.isValidEmail(formData.bcc)) {
      newErrors.bcc = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSend = async () => {
    if (!validateForm()) return;

    setSending(true);
    try {
      const result = await onEmailSent(formData);
      if (result) {
        onClose();
        setFormData({ to: '', cc: '', bcc: '', subject: '', body: '' });
        setErrors({});
      }
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (!sending) {
      onClose();
      setFormData({ to: '', cc: '', bcc: '', subject: '', body: '' });
      setErrors({});
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { 
          minHeight: '70vh',
          borderRadius: 3,
        }
      }}
      TransitionComponent={Slide}
      transitionDuration={300}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
        color: 'white',
        borderRadius: '12px 12px 0 0'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditIcon />
          <Typography variant="h6">Compose New Email</Typography>
        </Box>
        <IconButton onClick={handleClose} disabled={sending} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 3, background: '#fafafa' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="To *"
            fullWidth
            variant="outlined"
            value={formData.to}
            onChange={handleInputChange('to')}
            placeholder="recipient@example.com"
            disabled={sending}
            error={!!errors.to}
            helperText={errors.to}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          
          <TextField
            label="CC"
            fullWidth
            variant="outlined"
            value={formData.cc}
            onChange={handleInputChange('cc')}
            placeholder="cc@example.com"
            disabled={sending}
            error={!!errors.cc}
            helperText={errors.cc}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          
          <TextField
            label="BCC"
            fullWidth
            variant="outlined"
            value={formData.bcc}
            onChange={handleInputChange('bcc')}
            placeholder="bcc@example.com"
            disabled={sending}
            error={!!errors.bcc}
            helperText={errors.bcc}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          
          <TextField
            label="Subject *"
            fullWidth
            variant="outlined"
            value={formData.subject}
            onChange={handleInputChange('subject')}
            placeholder="Enter subject"
            disabled={sending}
            error={!!errors.subject}
            helperText={errors.subject}
          />
          
          <TextField
            label="Message *"
            fullWidth
            multiline
            rows={12}
            variant="outlined"
            value={formData.body}
            onChange={handleInputChange('body')}
            placeholder="Enter your message here..."
            disabled={sending}
            error={!!errors.body}
            helperText={errors.body}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
              }
            }}
          />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, justifyContent: 'space-between', background: '#f5f5f5' }}>
        {/* TODO: Implement file attachment in future updates
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Attach files">
            <IconButton disabled={sending}>
              <AttachFileIcon />
            </IconButton>
          </Tooltip>
        </Box>
        */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Typography variant="caption" color="textSecondary">
            * Required fields
          </Typography>
          <Button 
            onClick={handleClose} 
            disabled={sending}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={!formData.to || !formData.subject || !formData.body || sending}
            startIcon={sending ? null : <SendIcon />}
            sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
              }
            }}
          >
            {sending ? 'Sending...' : 'Send Email'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default function Home() {
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Use custom hooks
  const {
    emails,
    loading,
    error,
    pagination,
    filter,
    searchTerm,
    fetchEmails,
    searchEmails,
    createEmail,
    updateEmail,
    deleteEmail,
    markAsRead,
    toggleStar,
    clearError,
    refreshEmails,
    changeFilter,
    setSearchTerm
  } = useEmails();

  // Debounce search term
  const debouncedSearchTerm = useSearchDebounce(searchTerm, 500);

  // Handle email sent
  const handleEmailSent = async (emailData) => {
    try {
      const result = await createEmail(emailData);
      
      let message = 'Email saved successfully!';
      let severity = 'success';
      
      if (result.emailSent) {
        message = 'Email sent successfully via Gmail!';
      } else if (result.sendError) {
        message = `Email saved locally. Send failed: ${result.sendError}`;
        severity = 'warning';
      } else if (result.message) {
        message = result.message;
        severity = result.emailSent ? 'success' : 'info';
      }
      
      setSnackbar({
        open: true,
        message: message,
        severity: severity
      });

      return result;
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to send email',
        severity: 'error'
      });
      throw error;
    }
  };

  // Handle email actions
  const handleStarEmail = async (emailId, starred) => {
    try {
      await toggleStar(emailId, starred);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to update email',
        severity: 'error'
      });
    }
  };

  const handleMarkRead = async (emailId, read) => {
    try {
      await markAsRead(emailId, read);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to update email',
        severity: 'error'
      });
    }
  };

  const handleDeleteEmail = async (emailId) => {
    try {
      await deleteEmail(emailId);
      if (selectedEmail?.id === emailId) {
        setSelectedEmail(null);
      }
      setSnackbar({
        open: true,
        message: 'Email deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to delete email',
        severity: 'error'
      });
    }
  };

  // TODO: Implement these features in future updates
  // const handleReply = (email) => {
  //   // TODO: Implement reply functionality
  //   setSnackbar({
  //     open: true,
  //     message: 'Reply functionality coming soon',
  //     severity: 'info'
  //   });
  // };

  // const handleForward = (email) => {
  //   // TODO: Implement forward functionality
  //   setSnackbar({
  //     open: true,
  //     message: 'Forward functionality coming soon',
  //     severity: 'info'
  //   });
  // };

  // const handleArchive = async (emailId) => {
  //   // TODO: Implement archive functionality
  //   setSnackbar({
  //     open: true,
  //     message: 'Archive functionality coming soon',
  //     severity: 'info'
  //   });
  // };

  // Search when debounced term changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      searchEmails(debouncedSearchTerm);
    } else {
      fetchEmails({ filter });
    }
  }, [debouncedSearchTerm, searchEmails, fetchEmails, filter]);

  // Handle errors
  useEffect(() => {
    if (error) {
      setSnackbar({
        open: true,
        message: error.message || 'An error occurred',
        severity: 'error'
      });
      clearError();
    }
  }, [error, clearError]);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1, height: '100vh', backgroundColor: 'background.default' }}>
        {/* Enhanced Header */}
        <AppBar 
          position="static" 
          sx={{ 
            zIndex: 1300,
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)'
          }}
        >
          <Toolbar>
            <EmailIcon sx={{ mr: 2, fontSize: 28 }} />
            <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
              Email Client
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Refresh emails">
                <IconButton 
                  color="inherit" 
                  onClick={refreshEmails}
                  disabled={loading}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
          {/* Enhanced Sidebar */}
          <Paper 
            sx={{ 
              width: isMobile ? '100%' : 380, 
              borderRadius: 0, 
              borderRight: 1, 
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
            }}
          >
            {/* Enhanced Search Bar */}
            <Box sx={{ p: 2, background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: 'white',
                    '&:hover': {
                      backgroundColor: 'white',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'white',
                    },
                  }
                }}
              />
            </Box>

            {/* Filter Chips */}
            <Box sx={{ px: 2, py: 1 }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label="All"
                  size="small"
                  variant={filter === 'all' ? 'filled' : 'outlined'}
                  onClick={() => changeFilter('all')}
                  color={filter === 'all' ? 'primary' : 'default'}
                />
                <Chip
                  label="Unread"
                  size="small"
                  variant={filter === 'unread' ? 'filled' : 'outlined'}
                  onClick={() => changeFilter('unread')}
                  color={filter === 'unread' ? 'primary' : 'default'}
                />
                <Chip
                  label="Starred"
                  size="small"
                  variant={filter === 'starred' ? 'filled' : 'outlined'}
                  onClick={() => changeFilter('starred')}
                  color={filter === 'starred' ? 'primary' : 'default'}
                />
              </Box>
            </Box>

            <Divider />

            {/* Email List */}
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              <EmailList
                emails={emails}
                selectedEmail={selectedEmail}
                loading={loading}
                searchTerm={searchTerm}
                onEmailSelect={setSelectedEmail}
                onStar={handleStarEmail}
                onMarkRead={handleMarkRead}
                                 onDelete={handleDeleteEmail}
                 onCompose={() => setComposeOpen(true)}
              />
            </Box>
          </Paper>

          {/* Enhanced Email Display Area */}
          <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto', background: '#fafafa' }}>
            {selectedEmail ? (
              <Fade in={true} timeout={300}>
                <Card sx={{ 
                  maxWidth: '100%', 
                  mx: 'auto',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }}>
                  <CardHeader
                    title={
                      <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {selectedEmail.subject || 'No Subject'}
                      </Typography>
                    }
                    subheader={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                          <strong>To:</strong> {selectedEmail.to}
                        </Typography>
                        {selectedEmail.cc && (
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                            <strong>CC:</strong> {selectedEmail.cc}
                          </Typography>
                        )}
                        {selectedEmail.bcc && (
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                            <strong>BCC:</strong> {selectedEmail.bcc}
                          </Typography>
                        )}
                        <Typography variant="body2" color="textSecondary">
                          <strong>Date:</strong> {new Date(selectedEmail.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                    }
                    sx={{
                      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                      borderBottom: 1,
                      borderColor: 'divider'
                    }}
                  />

                  <CardContent sx={{ p: 4 }}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        whiteSpace: 'pre-wrap', 
                        lineHeight: 1.8,
                        fontSize: '1.1rem',
                        color: 'text.primary'
                      }}
                    >
                      {selectedEmail.body}
                    </Typography>
                  </CardContent>
                </Card>
              </Fade>
            ) : (
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  textAlign: 'center'
                }}
              >
                <EmailIcon sx={{ fontSize: 120, color: 'grey.300', mb: 3 }} />
                <Typography variant="h5" color="textSecondary" gutterBottom>
                  Select an email to view
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Choose an email from the sidebar to read its content
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Enhanced Compose Email FAB */}
        <Zoom in={true} timeout={500}>
          <Fab
            color="primary"
            aria-label="compose"
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1000,
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.3s ease-in-out',
            }}
            onClick={() => setComposeOpen(true)}
          >
            <EditIcon />
          </Fab>
        </Zoom>

        {/* Compose Email Dialog */}
        <ComposeEmailDialog
          open={composeOpen}
          onClose={() => setComposeOpen(false)}
          onEmailSent={handleEmailSent}
        />

        {/* Enhanced Success/Error Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          TransitionComponent={Slide}
        >
          <Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ 
              width: '100%',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
