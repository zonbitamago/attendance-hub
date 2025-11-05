// 出欠状況の型
export type AttendanceStatus = '◯' | '△' | '✗';

// イベント日付
export interface EventDate {
  id: string;
  date: string; // YYYY-MM-DD形式
  title: string; // "練習", "本番"等
  location?: string; // 場所（任意）
  createdAt: string;
}

// グループ（汎用: 楽器パート、部署、クラス等）
export interface Group {
  id: string;
  name: string; // "打", "Cla", "営業部"等
  order: number; // 表示順
  color?: string; // UI表示用の色（任意）
  createdAt: string;
}

// メンバー（グループ所属者）
export interface Member {
  id: string;
  groupId: string;
  name: string;
  createdAt: string;
}

// 出欠登録
export interface Attendance {
  id: string;
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
