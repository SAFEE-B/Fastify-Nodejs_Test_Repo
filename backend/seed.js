import EmailModel from './src/db/index.js';

const sampleEmails = [
  {
    to: 'john.doe@example.com',
    cc: 'manager@example.com',
    bcc: '',
    subject: 'Welcome to the Team!',
    body: 'Hi John,\n\nWelcome to our team! We are excited to have you join us. Please let me know if you have any questions.\n\nBest regards,\nSarah'
  },
  {
    to: 'sarah.wilson@example.com',
    cc: '',
    bcc: '',
    subject: 'Project Update - Q4 Planning',
    body: 'Dear Sarah,\n\nI wanted to give you a quick update on the Q4 planning project. We have completed the initial research phase and are ready to move into the implementation stage.\n\nThe next meeting is scheduled for Thursday at 2 PM.\n\nThanks,\nMike'
  },
  {
    to: 'team@example.com',
    cc: 'hr@example.com',
    bcc: 'ceo@example.com',
    subject: 'Company All-Hands Meeting',
    body: 'Dear Team,\n\nWe will be having our quarterly all-hands meeting next Friday at 10 AM in the main conference room.\n\nAgenda:\n- Q3 Results\n- Q4 Objectives\n- New team introductions\n- Q&A session\n\nPlease mark your calendars.\n\nBest,\nHR Team'
  },
  {
    to: 'alex.johnson@example.com',
    cc: '',
    bcc: '',
    subject: 'Code Review Request',
    body: 'Hi Alex,\n\nCould you please review the pull request I submitted yesterday? It includes the new user authentication feature we discussed.\n\nThe PR number is #142.\n\nThanks!\nEmily'
  },
  {
    to: 'support@example.com',
    cc: '',
    bcc: '',
    subject: 'Login Issue',
    body: 'Hello,\n\nI am experiencing issues logging into my account. I keep getting an "invalid credentials" error even though I am sure my password is correct.\n\nCould you please help me reset my password?\n\nAccount email: customer@email.com\n\nThank you,\nCustomer Support Request'
  }
];

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    for (const email of sampleEmails) {
      await EmailModel.createEmail(email);
      console.log(`Created email: ${email.subject}`);
    }
    
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 