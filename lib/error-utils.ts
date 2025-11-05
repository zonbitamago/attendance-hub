/**
 * エラーメッセージの型
 */
export interface ErrorMessage {
  title: string
  message: string
  details?: string
}

/**
 * エラーから日本語のエラーメッセージを生成する
 */
export function getErrorMessage(error: unknown): ErrorMessage {
  if (error instanceof Error) {
    // 既知のエラーメッセージをそのまま使用
    if (error.message.includes('データの保存に失敗しました')) {
      return {
        title: 'データの保存に失敗しました',
        message: error.message,
      }
    }

    if (error.message.includes('データの読み込みに失敗しました')) {
      return {
        title: 'データの読み込みに失敗しました',
        message: 'データが破損している可能性があります。ページをリロードしてください。',
      }
    }

    return {
      title: 'エラーが発生しました',
      message: error.message,
    }
  }

  return {
    title: '予期しないエラーが発生しました',
    message: 'もう一度お試しください。',
  }
}

/**
 * try-catchラッパー関数
 * エラーハンドリングを簡潔に記述するためのヘルパー
 */
export async function tryCatch<T>(
  fn: () => T | Promise<T>,
  errorHandler?: (error: unknown) => void
): Promise<{ success: true; data: T } | { success: false; error: ErrorMessage }> {
  try {
    const data = await fn()
    return { success: true, data }
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    if (errorHandler) {
      errorHandler(error)
    } else {
      console.error('エラーが発生しました:', error)
    }
    return { success: false, error: errorMessage }
  }
}

/**
 * エラーをコンソールに記録する
 */
export function logError(context: string, error: unknown): void {
  console.error(`[${context}]`, error)
  if (error instanceof Error) {
    console.error('Stack trace:', error.stack)
  }
}

/**
 * カスタムエラークラス: データが見つからない場合
 */
export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource}が見つかりません: ${id}`)
    this.name = 'NotFoundError'
  }
}

/**
 * カスタムエラークラス: バリデーションエラー
 */
export class ValidationError extends Error {
  public fields: Record<string, string[]>

  constructor(fields: Record<string, string[]>) {
    super('入力値が正しくありません')
    this.name = 'ValidationError'
    this.fields = fields
  }
}

/**
 * カスタムエラークラス: ストレージエラー
 */
export class StorageError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StorageError'
  }
}
