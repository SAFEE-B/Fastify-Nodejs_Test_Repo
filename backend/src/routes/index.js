import EmailController from '../controllers/emailController.js';

// Request/Response schemas for validation
const emailSchemas = {
  createEmail: {
    body: {
      type: 'object',
      required: ['to', 'subject', 'body'],
      properties: {
        to: { 
          type: 'string',
          minLength: 1,
          maxLength: 255,
          pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
        },
        cc: { 
          type: 'string',
          maxLength: 255,
          pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
        },
        bcc: { 
          type: 'string',
          maxLength: 255,
          pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
        },
        subject: { 
          type: 'string',
          minLength: 1,
          maxLength: 255
        },
        body: { 
          type: 'string',
          minLength: 1,
          maxLength: 10000
        }
      }
    },
    response: {
      201: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'object' },
          emailSent: { type: 'boolean' },
          message: { type: 'string' },
          sendError: { type: 'string' }
        }
      },
      400: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          error: { type: 'string' },
          message: { type: 'string' }
        }
      }
    }
  },
  
  updateEmail: {
    body: {
      type: 'object',
      properties: {
        read: { type: 'boolean' },
        starred: { type: 'boolean' },
        subject: { type: 'string', maxLength: 255 },
        body: { type: 'string', maxLength: 10000 },
        to: { type: 'string', maxLength: 255 },
        cc: { type: 'string', maxLength: 255 },
        bcc: { type: 'string', maxLength: 255 }
      }
    }
  },
  
  queryParams: {
    type: 'object',
    properties: {
      page: { type: 'string', pattern: '^[1-9]\\d*$' },
      limit: { type: 'string', pattern: '^[1-9]\\d*$' },
      filter: { type: 'string', enum: ['all', 'unread', 'read', 'starred'] }
    }
  }
};

export default async function routes(fastify, options) {
  // Register CORS with better configuration
  await fastify.register(import('@fastify/cors'), {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  });

  // Health check endpoint
  fastify.get('/health', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            uptime: { type: 'number' }
          }
        }
      }
    }
  }, async (request, reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  });

  // API Routes
  fastify.register(async function (fastify) {
    // Get all emails with pagination and filtering
    fastify.get('/emails', {
      schema: {
        querystring: emailSchemas.queryParams,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'array' },
              pagination: {
                type: 'object',
                properties: {
                  page: { type: 'number' },
                  limit: { type: 'number' },
                  total: { type: 'number' },
                  pages: { type: 'number' }
                }
              }
            }
          }
        }
      }
    }, EmailController.getAllEmails);

    // Get email by ID
    fastify.get('/emails/:id', {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', pattern: '^\\d+$' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' }
            }
          },
          404: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
              message: { type: 'string' }
            }
          }
        }
      }
    }, EmailController.getEmailById);

    // Search emails
    fastify.get('/emails/search/:term', {
      schema: {
        params: {
          type: 'object',
          required: ['term'],
          properties: {
            term: { type: 'string', minLength: 2, maxLength: 100 }
          }
        },
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'string', pattern: '^[1-9]\\d*$' },
            limit: { type: 'string', pattern: '^[1-9]\\d*$' }
          }
        }
      }
    }, EmailController.searchEmails);

    // Create new email
    fastify.post('/emails', {
      schema: emailSchemas.createEmail
    }, EmailController.createEmail);

    // Update email
    fastify.put('/emails/:id', {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', pattern: '^\\d+$' }
          }
        },
        body: emailSchemas.updateEmail.body
      }
    }, EmailController.updateEmail);

    // Delete email
    fastify.delete('/emails/:id', {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', pattern: '^\\d+$' }
          }
        }
      }
    }, EmailController.deleteEmail);

    // Test email functionality
    fastify.post('/test-email', {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              sent: { type: 'boolean' },
              message: { type: 'string' },
              messageId: { type: 'string' }
            }
          }
        }
      }
    }, EmailController.testEmail);

    // Get SMTP status
    fastify.get('/smtp-status', {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              smtpConfigured: { type: 'boolean' },
              smtpConnected: { type: 'boolean' }
            }
          }
        }
      }
    }, EmailController.getSmtpStatus);
  }, { prefix: '/api' });

  // Error handling
  fastify.setErrorHandler(function (error, request, reply) {
    request.log.error(error);
    
    // Handle validation errors
    if (error.validation) {
      return reply.code(400).send({
        success: false,
        error: 'Validation error',
        message: error.message,
        details: error.validation
      });
    }

    // Handle not found errors
    if (error.statusCode === 404) {
      return reply.code(404).send({
        success: false,
        error: 'Not found',
        message: 'The requested resource was not found'
      });
    }

    // Handle other errors
    const statusCode = error.statusCode || 500;
    const message = statusCode === 500 ? 'Internal server error' : error.message;
    
    return reply.code(statusCode).send({
      success: false,
      error: 'Server error',
      message: message
    });
  });

  // 404 handler for unmatched routes
  fastify.setNotFoundHandler(function (request, reply) {
    reply.code(404).send({
      success: false,
      error: 'Not found',
      message: `Route ${request.method}:${request.url} not found`
    });
  });
}
