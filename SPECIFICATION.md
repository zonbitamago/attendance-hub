# attendance-hub 仕様書

**バージョン:** 1.0.0
**最終更新:** 2025-11-08
**ステータス:** プロトタイプ（localStorage版）

---

## 目次

1. [プロジェクト概要](#1-プロジェクト概要)
2. [システムアーキテクチャ](#2-システムアーキテクチャ)
3. [データモデル](#3-データモデル)
4. [機能仕様](#4-機能仕様)
5. [API仕様（サービス層）](#5-api仕様サービス層)
6. [UI/UX仕様](#6-uiux仕様)
7. [バリデーション仕様](#7-バリデーション仕様)
8. [テスト仕様](#8-テスト仕様)
9. [開発ガイドライン](#9-開発ガイドライン)
10. [今後の拡張計画](#10-今後の拡張計画)

---

## 1. プロジェクト概要

### 1.1 プロジェクト名

**attendance-hub** - イベント出欠管理システム

### 1.2 目的

複数のグループに所属するメンバーの、イベント日付ごとの出欠状況を管理するWebアプリケーション。
吹奏楽団、スポーツチーム、企業の部署など、グループベースの組織における練習・イベント出欠管理を効率化します。

### 1.3 主な用途

- イベント日付の作成・管理
- グループ・メンバーの管理
- 出欠状況の登録（◯出席/△未定/✗欠席）
- グループ別・イベント全体の出欠集計
- 出欠状況の可視化

### 1.4 ターゲットユーザー

- グループ管理者（イベント・メンバー管理）
- 一般メンバー（出欠登録・確認）

### 1.5 現在のステータス

**プロトタイプ版（localStorage）**
- データ永続化: localStorage
- 認証: なし（将来的にSupabase Authへ移行予定）
- デプロイ: Vercel想定
- 今後: PostgreSQL + Supabaseへのマイグレーション計画

---

## 2. システムアーキテクチャ

### 2.1 技術スタック

#### フロントエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **Next.js** | 16.0.1 | フレームワーク（App Router） |
| **React** | 19.0.0 | UIライブラリ |
| **TypeScript** | 5.3.3 | 型安全な開発 |
| **Tailwind CSS** | 3.4.15 | スタイリング |

#### バリデーション・ユーティリティ

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **Zod** | 3.23.8 | スキーマバリデーション |
| **date-fns** | 4.1.0 | 日付処理 |

#### テスト

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **Jest** | 29.7.0 | テストフレームワーク |
| **React Testing Library** | 16.0.1 | コンポーネントテスト |

#### 開発ツール

- **ESLint** 9
- **Prettier** 3.3.3
- **postcss** 8 + autoprefixer

### 2.2 アーキテクチャ概要

```
┌─────────────────────────────────────────────┐
│          App Router (Next.js 16)            │
├─────────────────────────────────────────────┤
│  Pages (app/)                               │
│  ├─ page.tsx (イベント一覧)                   │
│  ├─ events/[id]/page.tsx (詳細)              │
│  ├─ events/[id]/register/page.tsx (出欠登録) │
│  ├─ admin/events/page.tsx (イベント管理)      │
│  └─ admin/groups/page.tsx (グループ管理)      │
├─────────────────────────────────────────────┤
│  Components (components/)                    │
│  ├─ loading-spinner.tsx                      │
│  └─ skeleton.tsx                             │
├─────────────────────────────────────────────┤
│  Service Layer (lib/)                        │
│  ├─ event-service.ts                         │
│  ├─ group-service.ts                         │
│  ├─ member-service.ts                        │
│  ├─ attendance-service.ts                    │
│  ├─ validation.ts (Zod)                      │
│  └─ storage.ts (localStorage I/O)            │
├─────────────────────────────────────────────┤
│  Data Layer (localStorage)                   │
│  ├─ attendance_event_dates                   │
│  ├─ attendance_groups                        │
│  ├─ attendance_members                       │
│  └─ attendance_attendances                   │
└─────────────────────────────────────────────┘
```

### 2.3 ディレクトリ構造

```
attendance-hub/
├── app/                    # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   ├── admin/
│   │   ├── page.tsx
│   │   ├── groups/page.tsx
│   │   └── events/page.tsx
│   ├── events/
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── register/page.tsx
│   └── globals.css
├── components/             # 再利用可能なコンポーネント
│   ├── loading-spinner.tsx
│   └── skeleton.tsx
├── lib/                    # ビジネスロジック
│   ├── storage.ts
│   ├── event-service.ts
│   ├── group-service.ts
│   ├── member-service.ts
│   ├── attendance-service.ts
│   ├── validation.ts
│   ├── date-utils.ts
│   └── error-utils.ts
├── types/                  # TypeScript型定義
│   └── index.ts
├── __tests__/             # テスト
│   ├── lib/
│   └── app/
├── specs/                 # 機能仕様・設計ドキュメント
│   ├── 001-attendance-prototype/
│   ├── 002-input-text-visibility/
│   └── 003-event-attendance-count/
├── CLAUDE.md              # 開発ガイドライン
├── SPECIFICATION.md       # 本ドキュメント
└── README.md              # ユーザー向けドキュメント
```

---

## 3. データモデル

### 3.1 エンティティ概要

attendance-hubは4つの主要エンティティで構成されています：

1. **EventDate（イベント日付）** - 練習日、本番日などのイベント
2. **Group（グループ）** - 打楽器、管楽器、営業部などの組織単位
3. **Member（メンバー）** - グループに所属する個人
4. **Attendance（出欠登録）** - イベント×メンバーの出欠状況

### 3.2 エンティティ詳細

#### 3.2.1 EventDate（イベント日付）

```typescript
interface EventDate {
  id: string;         // UUID v4形式
  date: string;       // YYYY-MM-DD形式（例: "2025-01-15"）
  title: string;      // イベント名（例: "練習", "本番"）
  location?: string;  // 開催場所（任意）
  createdAt: string;  // ISO 8601形式（例: "2025-01-01T00:00:00.000Z"）
}
```

**制約:**
- `title`: 1-100文字
- `date`: YYYY-MM-DD形式
- `location`: 最大200文字

#### 3.2.2 Group（グループ）

```typescript
interface Group {
  id: string;         // UUID v4形式
  name: string;       // グループ名（例: "打", "Cla", "営業部"）
  order: number;      // 表示順（0始まり）
  color?: string;     // カラーコード（例: "#FF0000"、任意）
  createdAt: string;  // ISO 8601形式
}
```

**制約:**
- `name`: 1-50文字
- `order`: 0以上の整数
- `color`: Hex形式（#RRGGBB）または未定義

#### 3.2.3 Member（メンバー）

```typescript
interface Member {
  id: string;        // UUID v4形式
  groupId: string;   // 所属グループID（外部キー）
  name: string;      // メンバー名
  createdAt: string; // ISO 8601形式
}
```

**制約:**
- `name`: 1-100文字
- `groupId`: 既存のGroupに対する外部キー

#### 3.2.4 Attendance（出欠登録）

```typescript
interface Attendance {
  id: string;              // UUID v4形式
  eventDateId: string;     // イベント日付ID（外部キー）
  memberId: string;        // メンバーID（外部キー）
  status: '◯' | '△' | '✗'; // 出欠ステータス
  createdAt: string;       // ISO 8601形式
}
```

**ステータス:**
- `◯`: 出席
- `△`: 未定
- `✗`: 欠席

**制約:**
- `eventDateId`: 既存のEventDateに対する外部キー
- `memberId`: 既存のMemberに対する外部キー
- 同一`(eventDateId, memberId)`の組み合わせは1件のみ（論理的制約）

### 3.3 エンティティ関係図（ER図）

```
┌─────────────┐       ┌─────────────┐
│  EventDate  │       │    Group    │
├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │
│ date        │       │ name        │
│ title       │       │ order       │
│ location    │       │ color       │
│ createdAt   │       │ createdAt   │
└─────────────┘       └─────────────┘
       │                      │
       │                      │ 1
       │                      │
       │                      ├─────┐
       │                      │     │
       │ 1                    │     │ N
       │                      ▼     │
       │              ┌─────────────┤
       │              │   Member    │
       │              ├─────────────┤
       │              │ id (PK)     │
       │              │ groupId (FK)│
       │              │ name        │
       │              │ createdAt   │
       │              └─────────────┘
       │                      │
       │ N                    │ 1
       │                      │
       ▼                      ▼
   ┌──────────────────────────┐
   │      Attendance          │
   ├──────────────────────────┤
   │ id (PK)                  │
   │ eventDateId (FK)         │
   │ memberId (FK)            │
   │ status                   │
   │ createdAt                │
   └──────────────────────────┘
```

**関係性:**
- EventDate 1 : N Attendance
- Member 1 : N Attendance
- Group 1 : N Member

### 3.4 集計用データモデル

#### 3.4.1 GroupSummary（グループ別集計）

```typescript
interface GroupSummary {
  groupId: string;        // グループID
  groupName: string;      // グループ名
  attending: number;      // ◯の人数
  maybe: number;          // △の人数
  notAttending: number;   // ✗の人数
  total: number;          // 合計人数
}
```

**算出ロジック:**
特定イベント日付について、グループ内のメンバーの出欠状況を集計。

#### 3.4.2 EventTotalSummary（イベント全体集計）

```typescript
interface EventTotalSummary {
  totalAttending: number;      // 全体参加者数
  totalMaybe: number;          // 全体未定者数
  totalNotAttending: number;   // 全体欠席者数
  totalResponded: number;      // 全体回答者数
}
```

**算出ロジック:**
特定イベント日付について、全グループのメンバーの出欠状況を統合集計。
重複カウントを防ぐため、メンバーIDでユニークに集計。

### 3.5 localStorage設計

**キー構造:**

| キー名 | データ型 | 内容 |
|--------|---------|------|
| `attendance_event_dates` | `EventDate[]` | イベント日付一覧 |
| `attendance_groups` | `Group[]` | グループ一覧 |
| `attendance_members` | `Member[]` | メンバー一覧 |
| `attendance_attendances` | `Attendance[]` | 出欠登録一覧 |

**データ永続化:**
- JSON形式でシリアライズ
- 各操作（作成・更新・削除）後に即座に保存
- エラー時はlocalStorageをクリアし、空配列にフォールバック

---

## 4. 機能仕様

### 4.1 実装済み機能一覧

#### 4.1.1 イベント管理機能

**機能ID:** 001-001
**概要:** イベント日付の作成・閲覧・更新・削除（CRUD）

**詳細:**
- イベント日付の新規作成（日付、タイトル、場所）
- イベント一覧表示（日付昇順）
- イベント詳細表示
- イベント情報の編集
- イベントの削除（関連する出欠登録も連動削除）

**制約:**
- 日付は過去・未来どちらも登録可能
- タイトルは必須、場所は任意

#### 4.1.2 グループ管理機能

**機能ID:** 001-002
**概要:** グループの作成・閲覧・更新・削除（CRUD）

**詳細:**
- グループの新規作成（名前、表示順、カラー）
- グループ一覧表示（表示順でソート）
- グループ情報の編集
- グループの削除（所属メンバーも連動削除）

**制約:**
- グループ名は1-50文字
- 表示順は重複可
- カラーは任意（Hex形式）

#### 4.1.3 メンバー管理機能

**機能ID:** 001-003
**概要:** グループ内のメンバー管理

**詳細:**
- メンバーの新規追加（名前、所属グループ）
- メンバー一覧表示（グループごと）
- メンバー情報の編集
- メンバーの削除（関連する出欠登録も連動削除）

**制約:**
- メンバー名は1-100文字
- 1つのグループに所属（現在は複数グループ非対応）

#### 4.1.4 出欠登録機能

**機能ID:** 001-004
**概要:** イベント日付ごとの出欠状況登録

**詳細:**
- イベント選択 → メンバー選択 → 出欠ステータス選択
- 出欠ステータス: ◯（出席）/△（未定）/✗（欠席）
- 既存の出欠登録を更新
- 出欠登録の削除

**制約:**
- 1イベント×1メンバーにつき1件の出欠登録
- ステータスは3種類のみ

#### 4.1.5 出欠集計機能

**機能ID:** 001-005
**概要:** グループ別・イベント全体の出欠集計

**詳細:**
- **グループ別集計:** 各グループの◯/△/✗人数を集計
- **イベント全体集計:** 全グループを統合した◯/△/✗人数を集計
- 集計結果の可視化（カード形式、グリッドレイアウト）

**算出ロジック:**
- グループ別: グループ内のメンバーの出欠状況をカウント
- 全体: 全メンバーをユニークにカウント（重複防止）

#### 4.1.6 テキスト視認性改善

**機能ID:** 002-001
**概要:** 入力欄のテキスト視認性向上

**詳細:**
- ライトモード・ダークモードでのテキストカラー最適化
- プレースホルダーの可読性向上
- フォーカス時のコントラスト向上

#### 4.1.7 イベント一覧での人数表示

**機能ID:** 003-001
**概要:** イベント一覧ページで各イベントの出欠人数を表示

**詳細:**
- 「◯ X人 △ Y人 ✗ Z人（計W人）」形式で表示
- イベントカードに出欠集計を統合
- 出欠登録がない場合は「0人」表示

#### 4.1.8 イベント詳細での全体集計表示

**機能ID:** 003-002
**概要:** イベント詳細ページで全体集計を表示

**詳細:**
- グループ別集計の上に全体集計セクションを配置
- 「参加: X人 / 未定: Y人 / 欠席: Z人（計W人）」形式
- グループ別集計との整合性を保証

### 4.2 未実装機能（将来計画）

- ユーザー認証（Supabase Auth）
- マルチテナント対応
- 権限管理（管理者/一般ユーザー）
- リアルタイム同期（Supabase Realtime）
- 招待機能
- 通知機能（メール/プッシュ）
- CSV/PDF エクスポート
- カレンダービュー

---

## 5. API仕様（サービス層）

### 5.1 event-service.ts

#### `createEventDate(input: CreateEventDateInput): EventDate`

**概要:** 新しいイベント日付を作成

**パラメータ:**
```typescript
interface CreateEventDateInput {
  date: string;       // YYYY-MM-DD形式
  title: string;      // 1-100文字
  location?: string;  // 最大200文字
}
```

**戻り値:** 作成されたEventDateオブジェクト

**例外:**
- バリデーションエラー（Zodスキーマ違反）
- ストレージ保存失敗

**使用例:**
```typescript
const event = createEventDate({
  date: '2025-01-15',
  title: '練習',
  location: '音楽室'
});
```

#### `getAllEventDates(): EventDate[]`

**概要:** すべてのイベント日付を日付昇順で取得

**戻り値:** EventDate配列（日付昇順）

**使用例:**
```typescript
const events = getAllEventDates();
// [{ date: '2025-01-10', ... }, { date: '2025-01-15', ... }]
```

#### `getEventDateById(id: string): EventDate | null`

**概要:** IDでイベント日付を検索

**パラメータ:**
- `id`: EventDate ID

**戻り値:**
- EventDate（見つかった場合）
- null（見つからない場合）

#### `updateEventDate(id: string, input: Partial<CreateEventDateInput>): EventDate`

**概要:** イベント日付を更新

**パラメータ:**
- `id`: 更新対象のEventDate ID
- `input`: 更新するフィールド（部分更新）

**戻り値:** 更新後のEventDateオブジェクト

**例外:**
- イベント日付が存在しない
- バリデーションエラー

#### `deleteEventDate(id: string): boolean`

**概要:** イベント日付を削除（関連する出欠登録も連動削除）

**パラメータ:**
- `id`: 削除対象のEventDate ID

**戻り値:**
- `true`: 削除成功
- `false`: イベント日付が存在しない

### 5.2 group-service.ts

#### `createGroup(input: CreateGroupInput): Group`

**概要:** 新しいグループを作成

**パラメータ:**
```typescript
interface CreateGroupInput {
  name: string;      // 1-50文字
  order: number;     // 0以上の整数
  color?: string;    // Hex形式（#RRGGBB）
}
```

**戻り値:** 作成されたGroupオブジェクト

#### `getAllGroups(): Group[]`

**概要:** すべてのグループを表示順（order）でソートして取得

**戻り値:** Group配列（orderでソート）

#### `getGroupById(id: string): Group | null`

**概要:** IDでグループを検索

#### `updateGroup(id: string, input: Partial<CreateGroupInput>): Group`

**概要:** グループ情報を更新

#### `deleteGroup(id: string): boolean`

**概要:** グループを削除（所属メンバーと関連する出欠登録も連動削除）

### 5.3 member-service.ts

#### `createMember(input: CreateMemberInput): Member`

**概要:** 新しいメンバーを作成

**パラメータ:**
```typescript
interface CreateMemberInput {
  groupId: string;  // 所属グループID
  name: string;     // 1-100文字
}
```

#### `getAllMembers(): Member[]`

**概要:** すべてのメンバーを取得

#### `getMembersByGroupId(groupId: string): Member[]`

**概要:** 特定グループに所属するメンバーを取得

#### `getMemberById(id: string): Member | null`

**概要:** IDでメンバーを検索

#### `updateMember(id: string, input: Partial<CreateMemberInput>): Member`

**概要:** メンバー情報を更新

#### `deleteMember(id: string): boolean`

**概要:** メンバーを削除（関連する出欠登録も連動削除）

### 5.4 attendance-service.ts

#### `createAttendance(input: CreateAttendanceInput): Attendance`

**概要:** 新しい出欠登録を作成

**パラメータ:**
```typescript
interface CreateAttendanceInput {
  eventDateId: string;     // イベント日付ID
  memberId: string;        // メンバーID
  status: '◯' | '△' | '✗'; // 出欠ステータス
}
```

#### `getAttendancesByEventDateId(eventDateId: string): Attendance[]`

**概要:** 特定イベント日付の出欠登録を取得

#### `getAttendancesByMemberId(memberId: string): Attendance[]`

**概要:** 特定メンバーの出欠登録を取得

#### `updateAttendance(id: string, input: Partial<CreateAttendanceInput>): Attendance`

**概要:** 出欠登録を更新

#### `deleteAttendance(id: string): boolean`

**概要:** 出欠登録を削除

#### `calculateEventSummary(eventDateId: string): GroupSummary[]`

**概要:** イベント日付ごとのグループ別集計を算出

**パラメータ:**
- `eventDateId`: 集計対象のイベント日付ID

**戻り値:** グループ別集計の配列（表示順でソート）

**ロジック:**
1. イベント日付の出欠登録をすべて取得
2. メンバーIDから所属グループを特定
3. グループごとに◯/△/✗をカウント
4. 出欠登録のないグループは除外

**使用例:**
```typescript
const summaries = calculateEventSummary('event1');
// [
//   { groupId: 'g1', groupName: '打', attending: 5, maybe: 2, notAttending: 1, total: 8 },
//   { groupId: 'g2', groupName: 'Cla', attending: 7, maybe: 1, notAttending: 2, total: 10 }
// ]
```

#### `calculateEventTotalSummary(eventDateId: string): EventTotalSummary`

**概要:** イベント日付全体の集計を算出

**パラメータ:**
- `eventDateId`: 集計対象のイベント日付ID

**戻り値:** イベント全体集計オブジェクト

**ロジック:**
1. イベント日付の出欠登録をすべて取得
2. メンバーIDでユニーク化（重複カウント防止）
3. ステータスごとにカウント

**使用例:**
```typescript
const summary = calculateEventTotalSummary('event1');
// { totalAttending: 12, totalMaybe: 3, totalNotAttending: 3, totalResponded: 18 }
```

### 5.5 storage.ts

#### `loadEventDates(): EventDate[]`

**概要:** localStorageからEventDate配列を読み込み

#### `saveEventDates(events: EventDate[]): boolean`

**概要:** localStorageにEventDate配列を保存

#### `loadGroups(): Group[]`, `saveGroups(groups: Group[]): boolean`

**概要:** Group配列の読み込み・保存

#### `loadMembers(): Member[]`, `saveMembers(members: Member[]): boolean`

**概要:** Member配列の読み込み・保存

#### `loadAttendances(): Attendance[]`, `saveAttendances(attendances: Attendance[]): boolean`

**概要:** Attendance配列の読み込み・保存

**エラーハンドリング:**
- JSON.parse失敗時は空配列を返す
- localStorageが無効な場合はエラーログを出力

---

## 6. UI/UX仕様

### 6.1 ページ一覧

| ページ | パス | 説明 |
|--------|------|------|
| **トップページ** | `/` | イベント一覧と出欠人数表示 |
| **イベント詳細** | `/events/[id]` | イベント詳細・全体集計・グループ別集計 |
| **出欠登録** | `/events/[id]/register` | 出欠登録フォーム |
| **管理画面トップ** | `/admin` | 管理機能へのリンク |
| **グループ管理** | `/admin/groups` | グループCRUD |
| **イベント管理** | `/admin/events` | イベントCRUD |

### 6.2 画面遷移図

```
┌─────────────┐
│ トップページ  │ ─────┐
│ (/) イベント  │      │
│ 一覧+人数     │      │
└─────────────┘      │
       │             │
       │ クリック     │ 管理画面へ
       ▼             │
┌─────────────┐      │
│イベント詳細   │      │
│(/events/[id])│      │
│全体集計+     │      │
│グループ集計   │      │
└─────────────┘      │
       │             │
       │ 出欠登録     │
       ▼             ▼
┌─────────────┐  ┌─────────────┐
│出欠登録       │  │管理画面トップ │
│(/events/[id]/ │  │(/admin)      │
│ register)    │  └─────────────┘
└─────────────┘         │
                        ├─→ グループ管理 (/admin/groups)
                        └─→ イベント管理 (/admin/events)
```

### 6.3 レスポンシブデザイン

**対応範囲:** 320px（モバイル）〜 1920px（デスクトップ）

**ブレークポイント（Tailwind CSS）:**
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

**レイアウト戦略:**
- モバイルファースト（320px基準）
- 1カラム（モバイル）→ 2〜3カラム（デスクトップ）
- グリッドレイアウト（`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`）

### 6.4 主要コンポーネント

#### 6.4.1 イベント一覧カード

**表示内容:**
- イベント日付（YYYY年M月D日）
- イベントタイトル
- 開催場所（任意）
- 出欠人数集計（◯ X人 △ Y人 ✗ Z人（計W人））

**レイアウト:**
```
┌────────────────────────┐
│ 2025年1月15日           │
│ 練習                    │
│ 音楽室                  │
│ ◯ 5人 △ 3人 ✗ 2人（計10人）│
│ [詳細を見る]            │
└────────────────────────┘
```

#### 6.4.2 全体集計セクション

**表示内容:**
- セクションタイトル「全体出欠状況」
- 参加者数・未定者数・欠席者数・合計

**レイアウト:**
```
┌────────────────────────┐
│ 全体出欠状況            │
│ 参加: 12人 / 未定: 3人  │
│ 欠席: 3人（計18人）     │
└────────────────────────┘
```

#### 6.4.3 グループ別集計カード

**表示内容:**
- グループ名（カラーバッジ）
- ◯/△/✗の人数
- 合計人数

**レイアウト:**
```
┌────────────────────────┐
│ [●] 打楽器              │
│ ◯ 5人 △ 2人 ✗ 1人      │
│ 合計: 8人               │
└────────────────────────┘
```

**グリッド配置:** 3列グリッド（lg:grid-cols-3）

### 6.5 アクセシビリティ

- **セマンティックHTML:** `<main>`, `<section>`, `<article>`を適切に使用
- **ARIAラベル:** ボタン・リンクに適切なaria-label
- **キーボード操作:** Tabキーでフォーカス、Enterで実行
- **コントラスト比:** WCAG 2.1 AA準拠（4.5:1以上）
- **フォーカス表示:** `focus:ring-2`で明確なフォーカスリング

---

## 7. バリデーション仕様

### 7.1 Zodスキーマ一覧

#### 7.1.1 AttendanceStatusSchema

```typescript
z.enum(['◯', '△', '✗'])
```

**説明:** 出欠ステータスの列挙型

#### 7.1.2 EventDateSchema

```typescript
z.object({
  id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().min(1).max(100),
  location: z.string().max(200).optional(),
  createdAt: z.string().datetime(),
})
```

**制約:**
- `id`: UUID v4形式
- `date`: YYYY-MM-DD形式
- `title`: 1-100文字
- `location`: 最大200文字（任意）
- `createdAt`: ISO 8601形式

#### 7.1.3 GroupSchema

```typescript
z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  order: z.number().int().nonnegative(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  createdAt: z.string().datetime(),
})
```

**制約:**
- `name`: 1-50文字
- `order`: 0以上の整数
- `color`: Hex形式（#RRGGBB）または未定義

#### 7.1.4 MemberSchema

```typescript
z.object({
  id: z.string().uuid(),
  groupId: z.string().uuid(),
  name: z.string().min(1).max(100),
  createdAt: z.string().datetime(),
})
```

**制約:**
- `name`: 1-100文字
- `groupId`: UUID形式

#### 7.1.5 AttendanceSchema

```typescript
z.object({
  id: z.string().uuid(),
  eventDateId: z.string().uuid(),
  memberId: z.string().uuid(),
  status: AttendanceStatusSchema,
  createdAt: z.string().datetime(),
})
```

### 7.2 入力スキーマ（Create用）

#### CreateEventDateInputSchema

```typescript
EventDateSchema.pick({
  date: true,
  title: true,
  location: true,
})
```

**説明:** イベント作成時に必要なフィールドのみ抽出

#### CreateGroupInputSchema, CreateMemberInputSchema, CreateAttendanceInputSchema

同様にpickメソッドで必要フィールドのみ抽出。

### 7.3 エラーメッセージ

**Zodバリデーションエラー:**
```typescript
try {
  EventDateSchema.parse(data);
} catch (e) {
  if (e instanceof z.ZodError) {
    console.error(e.errors);
    // [{ path: ['title'], message: 'String must contain at least 1 character(s)' }]
  }
}
```

**カスタムエラーメッセージ（将来実装）:**
- 「イベントタイトルを入力してください」
- 「日付はYYYY-MM-DD形式で入力してください」
- 「グループ名は50文字以内で入力してください」

---

## 8. テスト仕様

### 8.1 テスト戦略

**TDD（Test-Driven Development）原則:**
1. **Red:** まず失敗するテストを書く
2. **Green:** テストを通す最小限の実装
3. **Refactor:** 動作を保ちながらコードを改善

**テストファースト:** 実装前にテストを書く

### 8.2 テストカバレッジ

**現在のテスト状況:**
- **テストスイート数:** 6
- **テストケース数:** 56
- **合格率:** 100%

**テスト対象:**
- `lib/storage.test.ts` - localStorageのCRUD
- `lib/group-service.test.ts` - グループサービス
- `lib/attendance-service.test.ts` - 出欠サービス
- `app/page.test.tsx` - トップページ
- `app/events/[id]/page.test.tsx` - イベント詳細ページ
- `app/admin/events/page.test.tsx` - 管理画面イベントページ

### 8.3 テストケース分類

#### 8.3.1 ユニットテスト（lib/）

**Storage utilities:**
- イベント日付が存在しない場合は空配列を読み込む
- イベント日付を保存・読み込みできる
- 不正なJSONデータを処理できる
- グループを保存・読み込みできる
- 既存のグループを上書きできる
- すべてのデータタイプを分離して保持できる

**Group Service:**
- 有効な入力で新しいグループを作成できる
- 色なしでグループを作成できる
- 無効な入力でエラーをスローする
- 名前が長すぎる場合はエラーをスローする
- ストレージが失敗した場合はエラーをスローする
- すべてのグループを順序でソートして取得できる
- IDでグループを取得できる
- 既存のグループを更新できる
- グループが見つからない場合はnullを返す

**Attendance Service:**
- 有効な入力で新しい出欠情報を作成できる
- 無効なステータスでエラーをスローする
- 特定のイベント日付の出欠情報を取得できる
- グループごとの集計を正しく計算できる
- 出欠情報が存在しない場合は空配列を返す
- 基本シナリオでイベント全体の集計を正しく計算できる
- 出欠情報が存在しない場合はすべて0を返す
- 複数の出欠登録があっても各メンバーを1回のみカウントする

#### 8.3.2 コンポーネントテスト（app/）

**Home（イベント一覧ページ）:**
- 一覧で各イベントの出欠人数を表示できる
- 出欠登録がない場合は0人を表示する
- 複数のイベントで正しい人数を表示できる

**EventDetailPage:**
- グループ別集計の上にイベント全体集計を表示できる
- 出欠登録がない場合は0人を表示する
- 全体集計がグループ別集計の合計と一致することを確認できる

**AdminEventsPage:**
- 管理画面で各イベントの出欠人数を表示できる
- 出欠登録がない場合は0人を表示する
- イベント削除時に出欠人数が更新される

### 8.4 テスト実行コマンド

```bash
# すべてのテスト実行
npm test

# テスト（ウォッチモード）
npm test -- --watch

# カバレッジレポート生成
npm test -- --coverage
```

---

## 9. 開発ガイドライン

### 9.1 コーディング規約

#### TypeScript

- **Strict mode必須:** すべての型チェックオプションを有効化
- **`any`の禁止:** 正当な理由がない限り使用しない
- **型推論の活用:** Zodスキーマから型を推論（`z.infer<typeof Schema>`）
- **明示的な戻り値の型:** 関数の戻り値の型は明示的に指定

**良い例:**
```typescript
function createGroup(input: CreateGroupInput): Group {
  // ...
}
```

**悪い例:**
```typescript
function createGroup(input: any) {  // anyの使用
  // ...
}
```

#### React

- **関数コンポーネント:** クラスコンポーネントは使用しない
- **Hooks:** useState、useEffect、useContextなどを活用
- **クライアントコンポーネント:** `'use client'`ディレクティブを使用
- **Props型定義:** インターフェースで明示的に定義

**良い例:**
```typescript
'use client';
interface EventCardProps {
  event: EventDate;
}

export default function EventCard({ event }: EventCardProps) {
  // ...
}
```

#### Tailwind CSS

- **ユーティリティファースト:** カスタムCSSは最小限に
- **モバイルファースト:** 基本スタイルはモバイル、レスポンシブは`sm:`、`md:`、`lg:`で
- **アクセシビリティ:** 適切なコントラスト比、フォーカス表示

**良い例:**
```tsx
<div className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
  <h2 className="text-lg font-bold text-gray-900 md:text-xl">
    {event.title}
  </h2>
</div>
```

### 9.2 開発フロー

1. **仕様確認:** `specs/`で要件を理解
2. **テスト作成:** `__tests__/`にテストを先に書く（Red）
3. **実装:** テストを通す最小限のコードを書く（Green）
4. **リファクタリング:** コードを整理・改善（Refactor）
5. **動作確認:** ブラウザで実際の動作を確認
6. **コミット:** 日本語または英語で明確なメッセージを付けてコミット

### 9.3 主要コマンド

```bash
# 開発サーバー起動
npm run dev

# テスト実行
npm test

# テスト（ウォッチモード）
npm test -- --watch

# リンティング
npm run lint

# ビルド
npm run build

# 型チェック
npx tsc --noEmit
```

### 9.4 Git運用

**ブランチ戦略:**
- `main`: 本番ブランチ
- `feature/xxx`: 機能開発ブランチ

**コミットメッセージ:**
```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント更新
test: テスト追加・修正
refactor: リファクタリング
chore: ビルド・設定変更
```

**プルリクエスト:**
```markdown
## Summary
機能の概要

## Test plan
- [ ] テスト項目1
- [ ] テスト項目2
```

---

## 10. 今後の拡張計画

### 10.1 Phase 1: Supabaseマイグレーション

**目標:** localStorageからSupabase PostgreSQLへの移行

**タスク:**
1. Supabaseプロジェクト作成
2. PostgreSQLスキーマ設計（EventDate, Group, Member, Attendance）
3. `lib/storage.ts`をSupabase Clientに置き換え
4. マイグレーションスクリプト作成
5. テストの更新

**期待効果:**
- データの永続性向上
- 複数デバイス間でのデータ同期
- スケーラビリティの向上

### 10.2 Phase 2: 認証機能

**目標:** Supabase Authによるユーザー認証

**タスク:**
1. Supabase Auth設定
2. ログイン・ログアウト機能
3. ユーザープロフィール管理
4. Row Level Security（RLS）設定

**期待効果:**
- マルチテナント対応
- データのプライバシー保護
- ユーザーごとのデータ分離

### 10.3 Phase 3: 権限管理

**目標:** 管理者と一般ユーザーの権限分離

**タスク:**
1. ユーザーロール設計（admin, member）
2. 権限チェック機能
3. 管理画面へのアクセス制限
4. RLSポリシー更新

**期待効果:**
- セキュリティ向上
- 誤操作の防止
- 役割に応じた機能提供

### 10.4 Phase 4: リアルタイム同期

**目標:** Supabase Realtimeによるリアルタイム更新

**タスク:**
1. Realtime購読設定
2. 出欠状況のリアルタイム反映
3. 楽観的UI更新
4. コンフリクト解決

**期待効果:**
- 複数ユーザー同時編集対応
- 即座にデータ反映
- ユーザー体験の向上

### 10.5 Phase 5: 追加機能

**招待機能:**
- メールでメンバー招待
- 招待リンク生成

**通知機能:**
- イベントリマインダー
- 出欠登録催促

**エクスポート機能:**
- CSV/PDF出力
- 集計レポート生成

**カレンダービュー:**
- 月次カレンダー表示
- イベント登録をカレンダーから

### 10.6 Phase 6: モバイルアプリ

**目標:** React Native / Expo でモバイルアプリ化

**タスク:**
1. React Nativeプロジェクト作成
2. Webコードベースの共通化
3. ネイティブ機能統合（プッシュ通知など）
4. App Store / Google Play公開

**期待効果:**
- モバイルUXの最適化
- プッシュ通知対応
- オフライン対応

---

## 付録

### A. 用語集

| 用語 | 説明 |
|------|------|
| **EventDate** | イベント日付。練習日、本番日などのスケジュール |
| **Group** | グループ。打楽器、管楽器、営業部などの組織単位 |
| **Member** | メンバー。グループに所属する個人 |
| **Attendance** | 出欠登録。イベント×メンバーの出欠状況 |
| **GroupSummary** | グループ別集計。グループごとの出欠人数 |
| **EventTotalSummary** | イベント全体集計。全メンバーの出欠人数 |
| **localStorage** | ブラウザのローカルストレージ。プロトタイプで使用 |
| **Supabase** | オープンソースのBaaS。将来的な移行先 |
| **TDD** | Test-Driven Development。テスト駆動開発 |
| **App Router** | Next.js 13+の新しいルーティングシステム |

### B. 参考ドキュメント

- [プロジェクト憲法](.specify/memory/constitution.md) - 開発原則とガバナンス
- [開発ガイドライン](CLAUDE.md) - コーディング規約と開発フロー
- [README](README.md) - ユーザー向けドキュメント
- [001-attendance-prototype仕様書](specs/001-attendance-prototype/spec.md)
- [データモデル設計](specs/001-attendance-prototype/data-model.md)
- [クイックスタート](specs/001-attendance-prototype/quickstart.md)

### C. 技術スタック詳細

**フレームワーク・ライブラリ:**
- Next.js 16.0.1 - https://nextjs.org/
- React 19.0.0 - https://react.dev/
- TypeScript 5.3.3 - https://www.typescriptlang.org/
- Tailwind CSS 3.4.15 - https://tailwindcss.com/
- Zod 3.23.8 - https://zod.dev/
- date-fns 4.1.0 - https://date-fns.org/

**テスト:**
- Jest 29.7.0 - https://jestjs.io/
- React Testing Library 16.0.1 - https://testing-library.com/react

**将来の技術スタック:**
- Supabase - https://supabase.com/
- PostgreSQL - https://www.postgresql.org/

### D. 変更履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|---------|
| 2025-11-08 | 1.0.0 | 初版作成 |

---

**ドキュメント作成者:** Claude Code
**ライセンス:** MIT License（予定）
**連絡先:** プロジェクトリポジトリのIssuesへ
