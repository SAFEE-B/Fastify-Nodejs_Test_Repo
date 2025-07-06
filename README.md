# 📧 Email Client Application

A modern, full-stack email client application built with Next.js, Fastify, and SQLite. Features a beautiful Material-UI interface with Gmail SMTP integration for sending emails.

![Email Client](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/License-ISC-green.svg)
![Node](https://img.shields.io/badge/Node.js-18+-green.svg)

## ✨ Features

### 🎨 Frontend (Next.js + Material-UI)
- **Modern UI**: Beautiful, responsive design with Material-UI components
- **Email Management**: View, compose, and manage emails
- **Real-time Search**: Debounced search with backend filtering
- **Email Filtering**: Filter by All, Unread, Read, and Starred emails
- **Interactive Actions**: Mark as read/unread, star/unstar, delete emails
- **Auto-mark Read**: Emails automatically marked as read when selected
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Loading States**: Skeleton loading and progress indicators
- **Error Handling**: Comprehensive error handling with user feedback

### 🚀 Backend (Fastify + SQLite)
- **RESTful API**: Well-structured API endpoints with validation
- **Database**: SQLite database with Knex.js ORM
- **Email Sending**: Gmail SMTP integration for actual email delivery
- **Data Validation**: JSON schema validation for all endpoints
- **Error Logging**: Structured logging with request tracking
- **CORS Support**: Configured for cross-origin requests
- **Migration System**: Database schema versioning with Knex migrations

### 📧 Email Features
- **Compose Emails**: Send emails with To, CC, BCC, Subject, and Body
- **Gmail Integration**: Actually send emails via Gmail SMTP
- **Email Storage**: All emails stored in local database
- **Search Functionality**: Search across all email fields
- **Email Status**: Track read/unread and starred status
- **Timestamps**: Created and updated timestamps for all emails

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14.2.3
- **UI Library**: Material-UI (MUI) 5.15.16
- **Icons**: Material-UI Icons
- **Styling**: Emotion (CSS-in-JS)
- **State Management**: React Hooks with custom hooks
- **HTTP Client**: Fetch API with custom utilities

### Backend
- **Framework**: Fastify 4.27.0
- **Database**: SQLite 3 with Knex.js 3.1.0
- **Email Service**: Nodemailer 6.9.7
- **Environment**: dotenv for configuration
- **Development**: Nodemon for hot reloading
- **CORS**: @fastify/cors for cross-origin support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Gmail account for SMTP (optional, for email sending)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd email-client-app
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create environment file
cp .env.example .env

# Run database migrations
npm run migrate

# (Optional) Seed sample data
npm run seed

# Start backend server
npm run dev
```

The backend will start on `http://localhost:3001`

### 3. Frontend Setup
```bash
cd frontend
npm install

# Start frontend development server
npm run dev
```

The frontend will start on `http://localhost:3000`

### 4. Gmail SMTP Configuration (Optional)
To enable actual email sending, add to `backend/.env`:
```env
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-app-specific-password
```

**Note**: Use Gmail App Passwords, not your regular password. [Learn how to create one](https://support.google.com/accounts/answer/185833).

## 📁 Project Structure

```
email-client-app/
├── backend/                 # Fastify backend server
│   ├── src/
│   │   ├── controllers/     # API route controllers
│   │   ├── db/             # Database models and utilities
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic services
│   │   └── utils/          # Utility functions
│   ├── migrations/         # Database migration files
│   ├── index.js           # Server entry point
│   ├── package.json       # Backend dependencies
│   └── .env               # Environment variables
├── frontend/               # Next.js frontend application
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Next.js pages
│   │   ├── services/      # API service utilities
│   │   └── utils/         # Frontend utilities
│   ├── package.json       # Frontend dependencies
│   └── next.config.js     # Next.js configuration
└── README.md              # This file
```

## 🔧 API Endpoints

### Emails
- `GET /api/emails` - Get all emails with pagination and filtering
- `GET /api/emails/:id` - Get specific email by ID
- `POST /api/emails` - Create and send new email
- `PUT /api/emails/:id` - Update email (mark read/unread, star/unstar)
- `DELETE /api/emails/:id` - Delete email
- `GET /api/emails/search/:term` - Search emails

### Utility
- `GET /api/health` - Health check endpoint
- `GET /api/smtp-status` - Check SMTP configuration status

## 📊 Database Schema

### Emails Table
```sql
CREATE TABLE emails (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  to TEXT NOT NULL,
  cc TEXT,
  bcc TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  starred BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🎯 Usage Examples

### Composing an Email
1. Click the "+" button in the bottom right
2. Fill in recipient, subject, and message
3. Optionally add CC/BCC recipients
4. Click "Send Email"

### Managing Emails
- **Mark as Read/Unread**: Click the three-dot menu on any email
- **Star/Unstar**: Click the star icon on any email
- **Delete**: Use the three-dot menu to delete emails
- **Search**: Type in the search bar to find emails

### Filtering Emails
Use the filter chips to view:
- **All**: All emails
- **Unread**: Only unread emails
- **Starred**: Only starred emails

## 🔧 Development

### Available Scripts

#### Backend
```bash
npm run dev      # Start development server with nodemon
npm run start    # Start production server
npm run migrate  # Run database migrations
npm run seed     # Seed sample data
npm test-email   # Test Gmail SMTP configuration
```

#### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Environment Variables

#### Backend (.env)
```env
# Gmail SMTP Configuration (Optional)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

## 🚦 Features in Detail

### Email Composition
- Rich form validation
- Real-time error feedback
- Support for multiple recipients (CC, BCC)
- Character limits and format validation
- Gmail SMTP integration for actual sending

### Email Management
- **Auto-mark as Read**: Emails automatically marked as read when opened
- **Manual Controls**: Toggle read/unread status via menu
- **Starring**: Mark important emails with stars
- **Deletion**: Remove unwanted emails
- **Search**: Find emails by content, sender, or subject

### User Experience
- **Responsive Design**: Works on all screen sizes
- **Loading States**: Skeleton loading during data fetch
- **Error Handling**: User-friendly error messages
- **Real-time Updates**: Immediate UI updates for actions
- **Smooth Animations**: Material-UI transitions and effects

## 🧪 Testing

### Test Email Functionality
```bash
cd backend
npm run test-email
```

This will attempt to send a test email using your Gmail SMTP configuration.

## 🐛 Troubleshooting

### Common Issues

1. **Gmail SMTP not working**
   - Ensure you're using an App Password, not your regular password
   - Check that 2FA is enabled on your Gmail account
   - Verify the environment variables are correctly set

2. **Database errors**
   - Run `npm run migrate` to ensure database schema is up to date
   - Check that SQLite file permissions are correct

3. **CORS errors**
   - Verify that FRONTEND_URL in backend .env matches your frontend URL
   - Ensure both servers are running on correct ports

4. **Port conflicts**
   - Backend: Default port 3001
   - Frontend: Default port 3000
   - Check for other services using these ports

## 📈 Performance

### Optimizations Included
- **Database Indexing**: Indexes on frequently queried fields
- **API Pagination**: Paginated email lists to handle large datasets
- **Debounced Search**: Prevents excessive API calls during typing
- **Caching**: Email list caching with cache invalidation
- **Lazy Loading**: Components and data loaded as needed

## 🔒 Security

### Security Features
- **Input Validation**: All inputs validated on both client and server
- **SQL Injection Prevention**: Parameterized queries with Knex.js
- **XSS Protection**: Input sanitization and encoding
- **CORS Configuration**: Restricted cross-origin access
- **Environment Variables**: Sensitive data in environment files

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Material-UI** for the beautiful component library
- **Fastify** for the fast and efficient backend framework
- **Next.js** for the powerful React framework
- **Nodemailer** for reliable email sending capabilities

---


