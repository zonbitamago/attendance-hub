// Mock implementation of Supabase client for testing

export const createClient = jest.fn(() => ({
  from: jest.fn((table: string) => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    then: jest.fn((resolve) => resolve({ data: [], error: null })),
  })),
  rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
}));
