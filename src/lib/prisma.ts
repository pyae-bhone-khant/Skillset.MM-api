import 'dotenv/config'
import { PrismaClient } from '../../generated/prisma/client.js'
import { PrismaNeon } from '@prisma/adapter-neon'
import { config } from 'dotenv'

config()

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
})

export const prisma = new PrismaClient({ adapter })