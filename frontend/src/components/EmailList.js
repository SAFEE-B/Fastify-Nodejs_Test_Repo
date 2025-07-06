import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Skeleton,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  CircularProgress
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  MoreVert as MoreVertIcon,
  MarkEmailRead as MarkEmailReadIcon,
  MarkEmailUnread as MarkEmailUnreadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

/**
 * Email List Item Component
 */
function EmailListItem({ 
  email, 
  selected, 
  onClick, 
  onStar, 
  onMarkRead,
  onDelete
}) {
  const [markingRead, setMarkingRead] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const isStarred = email.starred || false;
  const isRead = email.read !== false;

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleStarClick = (e) => {
    e.stopPropagation();
    onStar(email.id, !isStarred);
  };

  const handleMarkRead = async () => {
    setMarkingRead(true);
    try {
      await onMarkRead(email.id, !isRead);
    } catch (error) {
      console.error('Failed to mark email as read/unread:', error);
    } finally {
      setMarkingRead(false);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete(email.id);
    handleMenuClose();
  };

  // TODO: Implement these features in future updates
  // const handleReply = () => {
  //   onReply(email);
  //   handleMenuClose();
  // };

  // const handleForward = () => {
  //   onForward(email);
  //   handleMenuClose();
  // };

  // const handleArchive = () => {
  //   onArchive(email.id);
  //   handleMenuClose();
  // };

  return (
    <ListItem
      button
      selected={selected}
      onClick={onClick}
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          backgroundColor: alpha('#1976d2', 0.04),
          transform: 'translateX(4px)',
        },
        '&.Mui-selected': {
          backgroundColor: alpha('#1976d2', 0.08),
          borderLeft: 4,
          borderColor: 'primary.main',
          '&:hover': {
            backgroundColor: alpha('#1976d2', 0.12),
          },
        },
        py: 2,
      }}
    >
      <ListItemAvatar>
        <Avatar sx={{ 
          bgcolor: isRead ? 'grey.300' : 'primary.main',
          color: isRead ? 'grey.600' : 'white',
          fontWeight: 'bold'
        }}>
          {email.to ? email.to.charAt(0).toUpperCase() : '?'}
        </Avatar>
      </ListItemAvatar>
      
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography 
              variant="subtitle2" 
              noWrap 
              sx={{ 
                fontWeight: isRead ? 400 : 600,
                color: isRead ? 'text.primary' : 'text.primary'
              }}
            >
              {email.subject || 'No Subject'}
            </Typography>
            {!isRead && (
              <Badge 
                badgeContent="" 
                color="primary" 
                sx={{ 
                  '& .MuiBadge-badge': { 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%' 
                  } 
                }} 
              />
            )}
          </Box>
        }
        secondary={
          <Box>
            <Typography variant="body2" color="textSecondary" noWrap>
              To: {email.to || 'Unknown'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <ScheduleIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
              <Typography variant="caption" color="textSecondary">
                {email.created_at ? formatDate(email.created_at) : 'Unknown date'}
              </Typography>
            </Box>
          </Box>
        }
      />
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconButton
          size="small"
          onClick={handleStarClick}
          sx={{ color: isStarred ? 'warning.main' : 'grey.400' }}
        >
          {isStarred ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
        </IconButton>
        
        <IconButton
          size="small"
          onClick={handleMenuOpen}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMarkRead} disabled={markingRead}>
          {markingRead ? (
            <CircularProgress size={16} sx={{ mr: 1 }} />
          ) : isRead ? (
            <MarkEmailUnreadIcon fontSize="small" />
          ) : (
            <MarkEmailReadIcon fontSize="small" />
          )}
          {markingRead ? 'Updating...' : (isRead ? 'Mark as unread' : 'Mark as read')}
        </MenuItem>
        {/* TODO: Implement these features in future updates
        <MenuItem onClick={handleReply}>
          <ReplyIcon fontSize="small" />
          Reply
        </MenuItem>
        <MenuItem onClick={handleForward}>
          <ForwardIcon fontSize="small" />
          Forward
        </MenuItem>
        <MenuItem onClick={handleArchive}>
          <ArchiveIcon fontSize="small" />
          Archive
        </MenuItem>
        */}
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" />
          Delete
        </MenuItem>
      </Menu>
    </ListItem>
  );
}

/**
 * Loading skeleton for email list
 */
function EmailListSkeleton({ count = 5 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <ListItem key={index} sx={{ py: 2 }}>
          <ListItemAvatar>
            <Skeleton variant="circular" width={40} height={40} />
          </ListItemAvatar>
          <ListItemText
            primary={<Skeleton variant="text" width="80%" />}
            secondary={<Skeleton variant="text" width="60%" />}
          />
        </ListItem>
      ))}
    </>
  );
}

/**
 * Empty state component
 */
function EmailListEmpty({ searchTerm, onCompose }) {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      py: 8,
      px: 2
    }}>
      <Typography variant="h6" color="textSecondary" gutterBottom>
        {searchTerm ? 'No emails found' : 'No emails yet'}
      </Typography>
      <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 2 }}>
        {searchTerm 
          ? 'Try adjusting your search terms' 
          : 'Start by composing your first email'
        }
      </Typography>
      {!searchTerm && (
        <Typography 
          variant="body2" 
          color="primary" 
          sx={{ cursor: 'pointer', textDecoration: 'underline' }}
          onClick={onCompose}
        >
          Compose new email
        </Typography>
      )}
    </Box>
  );
}

/**
 * Main Email List Component
 */
function EmailList({
  emails = [],
  selectedEmail,
  loading = false,
  searchTerm = '',
  onEmailSelect,
  onStar,
  onMarkRead,
  onDelete,
  onCompose
}) {
  if (loading) {
    return (
      <List sx={{ p: 0 }}>
        <EmailListSkeleton />
      </List>
    );
  }

  if (emails.length === 0) {
    return <EmailListEmpty searchTerm={searchTerm} onCompose={onCompose} />;
  }

  return (
    <List sx={{ p: 0 }}>
      {emails.map((email) => (
        <EmailListItem
          key={email.id}
          email={email}
          selected={selectedEmail?.id === email.id}
          onClick={() => onEmailSelect(email)}
          onStar={onStar}
          onMarkRead={onMarkRead}
          onDelete={onDelete}
        />
      ))}
    </List>
  );
}

export default EmailList; 