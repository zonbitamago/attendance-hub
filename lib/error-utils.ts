import { ZodError } from 'zod';

// エラー型定義
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Zodバリデーションエラーをユーザーフレンドリーなメッセージに変換
export function formatZodError(error: ZodError): string[] {
  return error.errors.map((err) => {
    const field = err.path.join('.');
    // フィールド名がある場合はフィールド名を含める
    if (field) {
      return `${err.message}`;
    }
    return err.message;
  });
}

// エラーメッセージを取得
export function getErrorMessage(error: unknown): string {
  if (error instanceof ZodError) {
    const messages = formatZodError(error);
    return messages.join(', ');
  }

  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return '予期しないエラーが発生しました';
}

// エラーメッセージを配列で取得（複数エラー表示用）
export function getErrorMessages(error: unknown): string[] {
  if (error instanceof ZodError) {
    return formatZodError(error);
  }

  if (error instanceof AppError) {
    return [error.message];
  }

  if (error instanceof Error) {
    return [error.message];
  }

  return ['予期しないエラーが発生しました'];
}

// try-catchラッパー（非同期関数用）
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorMessage: string = 'エラーが発生しました'
): Promise<[T | null, string | null]> {
  try {
    const result = await fn();
    return [result, null];
  } catch (error) {
    console.error(errorMessage, error);
    return [null, getErrorMessage(error)];
  }
}

// try-catchラッパー（同期関数用）
export function tryCatchSync<T>(
  fn: () => T,
  errorMessage: string = 'エラーが発生しました'
): [T | null, string | null] {
  try {
    const result = fn();
    return [result, null];
  } catch (error) {
    console.error(errorMessage, error);
    return [null, getErrorMessage(error)];
  }
}

// 成功メッセージ生成
export function successMessage(action: string, target: string): string {
  return `${target}を${action}しました`;
}

// エラーメッセージテンプレート
export const ErrorMessages = {
  NOT_FOUND: (target: string) => `${target}が見つかりません`,
  INVALID_INPUT: (field: string) => `${field}の入力が正しくありません`,
  STORAGE_FULL: 'データの保存に失敗しました。ストレージの容量が不足しています',
  NETWORK_ERROR: 'ネットワークエラーが発生しました',
  UNKNOWN_ERROR: '予期しないエラーが発生しました',
} as const;
