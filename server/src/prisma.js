require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient: OriginalPrismaClient } = require('../generated/prisma');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);

class PrismaClient extends OriginalPrismaClient {
  constructor(options = {}) {
    super({
      ...options,
      adapter
    });
  }
}

module.exports = { PrismaClient };
