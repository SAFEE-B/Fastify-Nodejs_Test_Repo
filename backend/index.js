// ESM
import 'dotenv/config';
import Fastify from 'fastify';
import routes from './src/routes/index.js';
import MailService from './src/services/mailService.js';

/**
 * @type {import('fastify').FastifyInstance} Instance of Fastify
 */
const fastify = Fastify({
  logger: true
});

fastify.register(routes);

fastify.listen({ port: process.env.PORT || 3001 }, async function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  
  console.log(`🚀 Server is now listening on ${address}`);
  
  // Verify Gmail SMTP configuration on startup
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    console.log('🔐 Gmail SMTP credentials found, verifying connection...');
    await MailService.verifyConnection();
  } else {
    console.log('⚠️  Gmail SMTP not configured. Emails will be saved locally only.');
    console.log('📧 To enable email sending, see: backend/env-setup.md');
  }
})
