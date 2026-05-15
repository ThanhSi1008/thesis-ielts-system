import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';

loadEnv({ path: resolve(__dirname, '..', '.env.test'), override: true });

jest.setTimeout(30_000);
