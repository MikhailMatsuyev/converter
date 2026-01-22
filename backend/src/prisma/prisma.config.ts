// import 'dotenv/config'
// // @ts-ignore
// import { defineConfig, env } from "prisma/config";
//
// export default defineConfig({
//   schema: 'prisma/schema.prisma',
//   migrations: {
//     path: 'prisma/migrations',
//     seed: 'tsx prisma/seed.ts',
//   },
//   datasource: {
//     url: env("DATABASE_URL")
//   }
// })
import { config } from 'dotenv';
import dotenv from 'dotenv'
// import { PrismaPgAdapter } from '@prisma/adapter-pg';
// config({ path: '../../.env' }); // путь к корневому .env

// @ts-ignore
import { defineConfig, env } from 'prisma/config';
import path from "node:path";
import { resolve } from "node:dns";
// Загружаем .env из корня проекта (два уровня выше)
dotenv.config({ path: path.join(__dirname, '../../../.env') })


export default defineConfig({
  schema: 'schema.prisma', // путь внутри backend
  migrations: {
    path: 'src/prisma/migrations',
    seed: 'tsx src/prisma/seed.ts',
  },
  datasource: {
    // url: env('DATABASE_URL'), // берём DATABASE_URL из .env
    url: process.env.DATABASE_URL, // вместо adapter
  },
});
