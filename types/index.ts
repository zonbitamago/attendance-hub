// 出欠状況の型
export type AttendanceStatus = '◯' | '△' | '✗';

// 団体（Organization）
export interface Organization {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

// 団体作成の入力型
export interface CreateOrganizationInput {
  name: string;
  description?: string;
}

// 団体更新の入力型
export interface UpdateOrganizationInput {
  name?: string;
  description?: string;
}

// イベント日付
export interface EventDate {
  id: string;
  organizationId: string;
  date: string; // YYYY-MM-DD形式
  title: string; // "練習", "本番"等
  location?: string; // 場所（任意）
  createdAt: string;
}

// イベント日付作成の入力型
export interface EventDateInput {
  date: string;
  title: string;
  location?: string;
}

// グループ（汎用: 楽器パート、部署、クラス等）
export interface Group {
  id: string;
  organizationId: string;
  name: string; // "打", "Cla", "営業部"等
  order: number; // 表示順
  color?: string; // UI表示用の色（任意）
  createdAt: string;
}

// メンバー（グループ所属者）
export interface Member {
  id: string;
  organizationId: string;
  groupId: string;
  name: string;
  createdAt: string;
}

// メンバー作成の入力型
export interface MemberInput {
  groupId: string;
  name: string;
}

// 出欠登録
export interface Attendance {
  id: string;
  organizationId: string;
  eventDateId: string;
  memberId: string;
  status: AttendanceStatus;
  createdAt: string;
}

// グループ別集計結果
export interface GroupSummary {
  groupId: string;
  groupName: string;
  attending: number; // ◯の人数
  maybe: number; // △の人数
  notAttending: number; // ✗の人数
  total: number; // 合計人数
}

// イベント日付の集計結果
export interface EventSummary {
  eventDateId: string;
  totalAttending: number;
  totalMaybe: number;
  totalNotAttending: number;
  totalResponded: number;
  groupSummaries: GroupSummary[];
}

// イベント全体の人数集計結果（グループ情報なし）
export type EventTotalSummary = Omit<EventSummary, 'eventDateId' | 'groupSummaries'>;

// 一括登録の入力データ
export interface BulkAttendanceInput {
  eventDateId: string;
  memberId: string;
  status: AttendanceStatus;
}

// 一括登録の結果
export interface BulkAttendanceResult {
  success: Attendance[];      // 新規作成に成功した出欠レコード
  updated: Attendance[];      // 既存レコードの更新に成功した出欠レコード
  failed: Array<{             // 失敗した項目とエラー情報
    input: BulkAttendanceInput;
    error: string;
  }>;
}

// メンバー出欠詳細（Feature 007: イベント画面 個人別出欠状況表示機能）
export interface MemberAttendanceDetail {
  memberId: string;
  memberName: string;
  groupId: string;
  groupName: string;
  status: AttendanceStatus | null; // null = 未登録
  hasRegistered: boolean;
  memberCreatedAt: string;
}

// フィルタステータス（Feature 007: イベント画面 個人別出欠状況表示機能）
export type AttendanceFilterStatus =
  | 'all'
  | 'attending'
  | 'maybe'
  | 'notAttending'
  | 'unregistered';

// ソート種類（Feature 007: イベント画面 個人別出欠状況表示機能）
export type AttendanceSortBy = 'name' | 'status';

// グループメンバーの出欠情報（Feature 007: イベント画面 個人別出欠状況表示機能）
export interface GroupMemberAttendance {
  groupId: string;
  groupName: string;
  members: MemberAttendanceDetail[];
}
