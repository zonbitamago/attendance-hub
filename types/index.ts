/**
 * 出欠状況の種類
 * - 'attending': ◯（出席）
 * - 'tentative': △（未定）
 * - 'absent': ✗（欠席）
 */
export type AttendanceStatus = 'attending' | 'tentative' | 'absent'

/**
 * グループエンティティ
 * イベントやミーティングを表す
 */
export interface Group {
  /** UUID v4 */
  id: string
  /** グループ名（必須） */
  name: string
  /** グループの説明（任意） */
  description?: string
  /** 作成日時（ISO 8601形式） */
  createdAt: string
}

/**
 * 出欠登録エンティティ
 * ユーザーの出欠状況を表す
 */
export interface Attendance {
  /** UUID v4 */
  id: string
  /** 所属グループのID */
  groupId: string
  /** 登録者名 */
  userName: string
  /** 出欠状況 */
  status: AttendanceStatus
  /** 登録日時（ISO 8601形式） */
  createdAt: string
}

/**
 * グループの集計結果
 * グループごとの出欠状況を集計したデータ
 */
export interface Summary {
  /** グループID */
  groupId: string
  /** ◯（出席）の人数 */
  attendingCount: number
  /** △（未定）の人数 */
  tentativeCount: number
  /** ✗（欠席）の人数 */
  absentCount: number
  /** 合計人数 */
  totalCount: number
}

/**
 * グループ作成時の入力データ
 */
export interface CreateGroupInput {
  /** グループ名（必須、1〜100文字） */
  name: string
  /** グループの説明（任意、0〜500文字） */
  description?: string
}

/**
 * 出欠登録作成時の入力データ
 */
export interface CreateAttendanceInput {
  /** 所属グループのID */
  groupId: string
  /** 登録者名（必須、1〜50文字） */
  userName: string
  /** 出欠状況 */
  status: AttendanceStatus
}

/**
 * 出欠登録更新時の入力データ
 */
export interface UpdateAttendanceInput {
  /** 出欠登録ID */
  id: string
  /** 新しい出欠状況 */
  status: AttendanceStatus
}

/**
 * 出欠状況の表示ラベル
 */
export const AttendanceStatusLabel: Record<AttendanceStatus, string> = {
  attending: '◯ 出席',
  tentative: '△ 未定',
  absent: '✗ 欠席',
}

/**
 * 出欠状況のシンボルのみ
 */
export const AttendanceStatusSymbol: Record<AttendanceStatus, string> = {
  attending: '◯',
  tentative: '△',
  absent: '✗',
}
