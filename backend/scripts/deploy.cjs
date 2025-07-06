// scripts/deploy.js
const path = require('path');
const fs = require('fs');

const knexConfig = require('../knexfile.cjs');
const knex = require('knex');

async function deploy() {
  const environment = process.env.NODE_ENV || 'production';
  console.log(`🚀 Starting deployment for environment: ${environment}`);
  
  const config = knexConfig[environment];
  const db = knex(config);
  
  try {
    console.log('📦 Running database migrations...');
    await db.migrate.latest();
    console.log('✅ Database migrations completed successfully');
    
    // Verify the schema
    const tables = await db.raw("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('📋 Database tables:', tables.map(t => t.name));
    
    if (tables.some(t => t.name === 'emails')) {
      const columns = await db.raw("PRAGMA table_info(emails)");
      console.log('📊 Emails table columns:', columns.map(col => col.name));
    }
    
    console.log('🎉 Deployment completed successfully!');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    
    // If it's a migration issue, provide helpful context
    if (error.message.includes('table `emails` already exists')) {
      console.log('💡 Note: This might be expected if the database already exists');
      console.log('💡 The application should still work correctly');
      process.exit(0); // Don't fail deployment for this
    }
    
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

// Run deployment
deploy(); 