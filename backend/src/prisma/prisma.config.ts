import dotenv from 'dotenv'
// @ts-ignore
import { defineConfig, env } from 'prisma/config';
import path from "node:path";
// Загружаем .env из корня проекта (два уровня выше)
dotenv.config({ path: path.join(__dirname, '../../../.env') })


export default defineConfig({
  schema: 'schema.prisma', // путь внутри backend
  migrations: {
    path: 'src/prisma/migrations',
    seed: 'tsx src/prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL, // вместо adapter
  },
});
