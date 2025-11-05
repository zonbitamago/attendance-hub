import '@testing-library/jest-dom';
import { webcrypto } from 'crypto';

// crypto.randomUUID のポリフィル
Object.defineProperty(global, 'crypto', {
  value: webcrypto,
});
