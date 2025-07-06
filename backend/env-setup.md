# Gmail SMTP Configuration

## Environment Variables Required

Create a `.env` file in the `backend` directory with the following variables:

```env
# Gmail SMTP Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
PORT=3001
```

## How to Get Gmail App Password

1. **Enable 2-Factor Authentication** on your Gmail account (required for App Passwords)
   - Go to your Google Account settings
   - Security → 2-Step Verification → Turn on

2. **Generate App Password**
   - Go to your Google Account settings
   - Security → 2-Step Verification → App passwords
   - Select app: "Mail"
   - Select device: "Other (Custom name)" → type "Email Client App"
   - Copy the 16-character password generated

3. **Add to .env file**
   ```env
   GMAIL_USER=youremail@gmail.com
   GMAIL_APP_PASSWORD=abcddefghijklmnop
   ```

## Important Notes

- **DO NOT** use your regular Gmail password
- **DO NOT** commit the `.env` file to version control
- The `.env` file should be in your `.gitignore` (it already is)
- The app will work without these settings, but emails won't be sent (only saved to database)

## Testing Email Configuration

Once configured, you can test in multiple ways:

### Method 1: Automated Test Script (Recommended)
```bash
yarn test-email
```
This will:
- Check if your environment variables are set correctly
- Verify SMTP connection to Gmail
- Send a test email to your Gmail address
- Show detailed results with helpful error messages

### Method 2: Server Startup Check
```bash
yarn dev
```
The server automatically verifies SMTP connection on startup and shows status

### Method 3: API Endpoint
Make a POST request to: `http://localhost:3001/api/test-email`

### Method 4: Through the Web App
1. Start both frontend and backend
2. Go to http://localhost:3000
3. Click the compose button and send an email
4. Check if you receive it in your Gmail inbox 