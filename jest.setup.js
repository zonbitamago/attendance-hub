import '@testing-library/jest-dom';
import { webcrypto } from 'crypto';
import { config } from 'dotenv';
import path from 'path';

// .env.local を読み込む（Supabase接続用）
config({ path: path.resolve(process.cwd(), '.env.local') });

// crypto.randomUUID のポリフィル
Object.defineProperty(global, 'crypto', {
  value: webcrypto,
});
