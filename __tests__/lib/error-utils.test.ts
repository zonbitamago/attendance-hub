/**
 * error-utils.ts のテスト
 *
 * テスト対象:
 * - AppError: カスタムエラークラス
 * - formatZodError: ZodErrorをユーザーフレンドリーなメッセージに変換
 * - getErrorMessage: エラーメッセージを取得（文字列）
 * - getErrorMessages: エラーメッセージを配列で取得
 * - tryCatch: 非同期関数用のtry-catchラッパー
 * - tryCatchSync: 同期関数用のtry-catchラッパー
 * - successMessage: 成功メッセージ生成
 * - ErrorMessages: エラーメッセージテンプレート
 */

import { ZodError, z } from 'zod';
import {
  AppError,
  formatZodError,
  getErrorMessage,
  getErrorMessages,
  tryCatch,
  tryCatchSync,
  successMessage,
  ErrorMessages,
} from '@/lib/error-utils';

describe('error-utils', () => {
  describe('AppError', () => {
    test('カスタムエラーを作成できる', () => {
      const error = new AppError('Test error', 'TEST_ERROR', 400);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('AppError');
    });

    test('statusCodeのデフォルト値は500', () => {
      const error = new AppError('Test error', 'TEST_ERROR');
      expect(error.statusCode).toBe(500);
    });

    test('Errorクラスを継承している', () => {
      const error = new AppError('Test error', 'TEST_ERROR');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });

    test('スタックトレースが含まれる', () => {
      const error = new AppError('Test error', 'TEST_ERROR');
      expect(error.stack).toBeDefined();
    });
  });

  describe('formatZodError', () => {
    test('Zodバリデーションエラーをメッセージ配列に変換できる', () => {
      const schema = z.object({
        name: z.string().min(1, 'Name is required'),
        age: z.number().min(0, 'Age must be positive'),
      });

      try {
        schema.parse({ name: '', age: -1 });
      } catch (error) {
        const messages = formatZodError(error as ZodError);
        expect(messages).toHaveLength(2);
        expect(messages).toContain('Name is required');
        expect(messages).toContain('Age must be positive');
      }
    });

    test('単一のバリデーションエラーを処理できる', () => {
      const schema = z.string().min(5, 'Must be at least 5 characters');

      try {
        schema.parse('abc');
      } catch (error) {
        const messages = formatZodError(error as ZodError);
        expect(messages).toHaveLength(1);
        expect(messages[0]).toBe('Must be at least 5 characters');
      }
    });

    test('ネストされたオブジェクトのエラーを処理できる', () => {
      const schema = z.object({
        user: z.object({
          email: z.string().email('Invalid email'),
        }),
      });

      try {
        schema.parse({ user: { email: 'invalid' } });
      } catch (error) {
        const messages = formatZodError(error as ZodError);
        expect(messages).toHaveLength(1);
        expect(messages[0]).toBe('Invalid email');
      }
    });

    test('空のパスを持つエラーを処理できる', () => {
      const schema = z.string().min(1);

      try {
        schema.parse('');
      } catch (error) {
        const messages = formatZodError(error as ZodError);
        expect(messages).toHaveLength(1);
        expect(messages[0]).toBeDefined();
      }
    });
  });

  describe('getErrorMessage', () => {
    test('AppErrorのメッセージを返す', () => {
      const error = new AppError('Custom app error', 'TEST_ERROR');
      const message = getErrorMessage(error);
      expect(message).toBe('Custom app error');
    });

    test('ZodErrorを整形したメッセージに変換する', () => {
      const schema = z.object({
        name: z.string().min(1, 'Name is required'),
      });

      try {
        schema.parse({ name: '' });
      } catch (error) {
        const message = getErrorMessage(error);
        expect(message).toContain('Name is required');
      }
    });

    test('複数のZodErrorをカンマ区切りで返す', () => {
      const schema = z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email'),
      });

      try {
        schema.parse({ name: '', email: 'invalid' });
      } catch (error) {
        const message = getErrorMessage(error);
        expect(message).toContain('Name is required');
        expect(message).toContain('Invalid email');
        expect(message).toContain(', '); // カンマ区切り
      }
    });

    test('通常のErrorのメッセージを返す', () => {
      const error = new Error('Standard error message');
      const message = getErrorMessage(error);
      expect(message).toBe('Standard error message');
    });

    test('未知のエラー型の場合はデフォルトメッセージを返す', () => {
      const message = getErrorMessage('string error');
      expect(message).toBe('予期しないエラーが発生しました');
    });

    test('nullの場合はデフォルトメッセージを返す', () => {
      const message = getErrorMessage(null);
      expect(message).toBe('予期しないエラーが発生しました');
    });

    test('undefinedの場合はデフォルトメッセージを返す', () => {
      const message = getErrorMessage(undefined);
      expect(message).toBe('予期しないエラーが発生しました');
    });
  });

  describe('getErrorMessages', () => {
    test('AppErrorのメッセージを配列で返す', () => {
      const error = new AppError('Custom app error', 'TEST_ERROR');
      const messages = getErrorMessages(error);
      expect(messages).toEqual(['Custom app error']);
    });

    test('ZodErrorを整形したメッセージ配列に変換する', () => {
      const schema = z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email'),
      });

      try {
        schema.parse({ name: '', email: 'invalid' });
      } catch (error) {
        const messages = getErrorMessages(error);
        expect(messages).toHaveLength(2);
        expect(messages).toContain('Name is required');
        expect(messages).toContain('Invalid email');
      }
    });

    test('通常のErrorのメッセージを配列で返す', () => {
      const error = new Error('Standard error message');
      const messages = getErrorMessages(error);
      expect(messages).toEqual(['Standard error message']);
    });

    test('未知のエラー型の場合はデフォルトメッセージを配列で返す', () => {
      const messages = getErrorMessages('string error');
      expect(messages).toEqual(['予期しないエラーが発生しました']);
    });

    test('nullの場合はデフォルトメッセージを配列で返す', () => {
      const messages = getErrorMessages(null);
      expect(messages).toEqual(['予期しないエラーが発生しました']);
    });
  });

  describe('tryCatch', () => {
    test('成功した場合は結果とnullのエラーを返す', async () => {
      const fn = async () => 'success result';
      const [result, error] = await tryCatch(fn);
      expect(result).toBe('success result');
      expect(error).toBeNull();
    });

    test('失敗した場合はnullとエラーメッセージを返す', async () => {
      const fn = async () => {
        throw new Error('Test error');
      };
      const [result, error] = await tryCatch(fn);
      expect(result).toBeNull();
      expect(error).toBe('Test error');
    });

    test('AppErrorの場合はエラーメッセージを返す', async () => {
      const fn = async () => {
        throw new AppError('Custom error', 'TEST_ERROR');
      };
      const [result, error] = await tryCatch(fn);
      expect(result).toBeNull();
      expect(error).toBe('Custom error');
    });

    test('ZodErrorの場合は整形されたエラーメッセージを返す', async () => {
      const fn = async () => {
        const schema = z.string().min(5, 'Must be at least 5 characters');
        schema.parse('abc');
      };
      const [result, error] = await tryCatch(fn);
      expect(result).toBeNull();
      expect(error).toContain('Must be at least 5 characters');
    });

    test('カスタムエラーメッセージを指定できる', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const fn = async () => {
        throw new Error('Test error');
      };
      await tryCatch(fn, 'カスタムエラーメッセージ');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'カスタムエラーメッセージ',
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
    });

    test('非同期処理で複雑なオブジェクトを返せる', async () => {
      const fn = async () => ({ data: 'value', count: 42 });
      const [result, error] = await tryCatch(fn);
      expect(result).toEqual({ data: 'value', count: 42 });
      expect(error).toBeNull();
    });
  });

  describe('tryCatchSync', () => {
    test('成功した場合は結果とnullのエラーを返す', () => {
      const fn = () => 'success result';
      const [result, error] = tryCatchSync(fn);
      expect(result).toBe('success result');
      expect(error).toBeNull();
    });

    test('失敗した場合はnullとエラーメッセージを返す', () => {
      const fn = () => {
        throw new Error('Test error');
      };
      const [result, error] = tryCatchSync(fn);
      expect(result).toBeNull();
      expect(error).toBe('Test error');
    });

    test('AppErrorの場合はエラーメッセージを返す', () => {
      const fn = () => {
        throw new AppError('Custom error', 'TEST_ERROR');
      };
      const [result, error] = tryCatchSync(fn);
      expect(result).toBeNull();
      expect(error).toBe('Custom error');
    });

    test('ZodErrorの場合は整形されたエラーメッセージを返す', () => {
      const fn = () => {
        const schema = z.string().min(5, 'Must be at least 5 characters');
        schema.parse('abc');
      };
      const [result, error] = tryCatchSync(fn);
      expect(result).toBeNull();
      expect(error).toContain('Must be at least 5 characters');
    });

    test('カスタムエラーメッセージを指定できる', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const fn = () => {
        throw new Error('Test error');
      };
      tryCatchSync(fn, 'カスタムエラーメッセージ');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'カスタムエラーメッセージ',
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
    });

    test('複雑なオブジェクトを返せる', () => {
      const fn = () => ({ data: 'value', count: 42 });
      const [result, error] = tryCatchSync(fn);
      expect(result).toEqual({ data: 'value', count: 42 });
      expect(error).toBeNull();
    });
  });

  describe('successMessage', () => {
    test('成功メッセージを生成できる', () => {
      const message = successMessage('作成', 'グループ');
      expect(message).toBe('グループを作成しました');
    });

    test('更新メッセージを生成できる', () => {
      const message = successMessage('更新', 'イベント');
      expect(message).toBe('イベントを更新しました');
    });

    test('削除メッセージを生成できる', () => {
      const message = successMessage('削除', 'メンバー');
      expect(message).toBe('メンバーを削除しました');
    });

    test('任意のアクションとターゲットで生成できる', () => {
      const message = successMessage('登録', '出欠情報');
      expect(message).toBe('出欠情報を登録しました');
    });
  });

  describe('ErrorMessages', () => {
    test('NOT_FOUND: ターゲットを含むメッセージを返す', () => {
      const message = ErrorMessages.NOT_FOUND('グループ');
      expect(message).toBe('グループが見つかりません');
    });

    test('INVALID_INPUT: フィールド名を含むメッセージを返す', () => {
      const message = ErrorMessages.INVALID_INPUT('メールアドレス');
      expect(message).toBe('メールアドレスの入力が正しくありません');
    });

    test('STORAGE_FULL: 定数メッセージを返す', () => {
      const message = ErrorMessages.STORAGE_FULL;
      expect(message).toBe('データの保存に失敗しました。ストレージの容量が不足しています');
    });

    test('NETWORK_ERROR: 定数メッセージを返す', () => {
      const message = ErrorMessages.NETWORK_ERROR;
      expect(message).toBe('ネットワークエラーが発生しました');
    });

    test('UNKNOWN_ERROR: 定数メッセージを返す', () => {
      const message = ErrorMessages.UNKNOWN_ERROR;
      expect(message).toBe('予期しないエラーが発生しました');
    });
  });
});
