# Tasks: 出欠確認プロトタイプ（データモデル刷新版）

**Status**: ✅ Phase 1-5 完了（2025-11-06）

**Last Updated**: 2025-11-06

## 完了した作業

### Phase 1: データモデル・型定義の刷新 ✅

**完了日**: 2025-11-06

- [x] EventDate 型の定義（id, date, title, location, createdAt）
- [x] Group 型の更新（name, order, color フィールドに簡略化）
- [x] Member 型の定義（id, groupId, name, createdAt）
- [x] Attendance 型の更新（eventDateId, memberId に変更）
- [x] GroupSummary 型の定義（グループ別集計用）
- [x] Zod バリデーションスキーマの全面更新
  - EventDateSchema, EventDateInputSchema
  - GroupSchema, GroupInputSchema（order, color 対応）
  - MemberSchema, MemberInputSchema
  - AttendanceSchema, AttendanceInputSchema（新しい関係性）

**成果物**:
- `types/index.ts` - 新しいデータモデル定義
- `lib/validation.ts` - 更新されたバリデーションスキーマ
- `lib/storage.ts` - 4エンティティ対応のストレージ関数

### Phase 2: サービス層の再実装 ✅

**完了日**: 2025-11-06

- [x] `lib/event-service.ts` - イベント日付の CRUD 操作
  - createEventDate, getAllEventDates, getEventDateById
  - updateEventDate, deleteEventDate
  - 日付昇順ソート
- [x] `lib/group-service.ts` - グループ管理の刷新
  - order フィールドによる表示順制御
  - color フィールド（オプション）対応
  - order 昇順ソート
- [x] `lib/member-service.ts` - メンバー管理（新規作成）
  - createMember, getAllMembers, getMembersByGroupId
  - getMemberById, updateMember, deleteMember
- [x] `lib/attendance-service.ts` - 出欠管理の刷新
  - EventDate × Member の関係性に対応
  - getAttendancesByEventDateId, getAttendancesByMemberId
  - calculateEventSummary（グループ別集計）

**成果物**: 新しいデータモデルに対応した完全なサービス層

### Phase 3: 管理画面の実装 ✅

**完了日**: 2025-11-06

- [x] `/admin` - 管理画面ランディングページ
  - グループ管理・イベント日付管理へのナビゲーション
- [x] `/admin/groups` - グループ管理画面
  - グループの作成・編集・削除
  - order フィールドによる並び替え
  - color フィールド（カラーコード）設定
- [x] `/admin/events` - イベント日付管理画面
  - イベント日付の作成・編集・削除
  - 日付、タイトル、場所の管理

**成果物**: 完全な管理UI（グループとイベント日付を管理）

### Phase 4: メイン画面の再実装 ✅

**完了日**: 2025-11-06

- [x] `/` - トップページ（イベント一覧）
  - イベント日付を日付昇順で表示
  - 管理画面へのリンク
- [x] `/events/[id]` - イベント詳細ページ
  - イベント情報表示
  - グループ別出欠状況の集計表示
  - 出欠登録ページへのリンク
- [x] `/events/[id]/register` - 出欠登録ページ
  - グループ選択
  - メンバー選択または新規登録
  - 出欠ステータス選択（◯/△/✗）
  - 登録後にイベント詳細へリダイレクト

**成果物**: イベント中心のUI（densuke.biz スタイル）

### Phase 5: テストの更新 ✅

**完了日**: 2025-11-06

- [x] `__tests__/lib/storage.test.ts` - 4エンティティ対応
  - EventDate, Group, Member, Attendance のテスト
  - データ分離のテスト
- [x] `__tests__/lib/group-service.test.ts` - order/color 対応
  - order によるソートのテスト
  - color バリデーションのテスト
- [x] `__tests__/lib/attendance-service.test.ts` - 新しいデータモデル対応
  - EventDate × Member 関係のテスト
  - calculateEventSummary のテスト

**テスト結果**: 44 tests passed ✅

**ビルド結果**: 成功 ✅

---

## データモデル概要

### 新しいエンティティ構造

```typescript
EventDate (イベント日付)
  ├── id: string (UUID)
  ├── date: string (YYYY-MM-DD)
  ├── title: string
  ├── location?: string
  └── createdAt: string (ISO 8601)

Group (グループ)
  ├── id: string (UUID)
  ├── name: string (例: "打", "Cla", "Sax")
  ├── order: number (表示順序)
  ├── color?: string (#RRGGBB)
  └── createdAt: string (ISO 8601)

Member (メンバー)
  ├── id: string (UUID)
  ├── groupId: string (Group への外部キー)
  ├── name: string
  └── createdAt: string (ISO 8601)

Attendance (出欠登録)
  ├── id: string (UUID)
  ├── eventDateId: string (EventDate への外部キー)
  ├── memberId: string (Member への外部キー)
  ├── status: "◯" | "△" | "✗"
  └── createdAt: string (ISO 8601)
```

### データの流れ

1. 管理者がグループを作成（楽器パート等）
2. 管理者がイベント日付を登録
3. ユーザーがグループを選択
4. ユーザーがメンバーを選択または新規登録
5. ユーザーが出欠ステータスを登録
6. イベント詳細ページでグループ別の集計を表示

---

## 実装済み機能

### ✅ 管理機能
- グループの作成・編集・削除・並び替え
- イベント日付の作成・編集・削除
- localStorage による永続化

### ✅ ユーザー機能
- イベント一覧の閲覧（日付昇順）
- イベント詳細の閲覧（グループ別集計）
- 出欠登録（グループ→メンバー→ステータス）
- 新規メンバーの登録

### ✅ 集計機能
- グループ別の参加人数集計
- ◯/△/✗ それぞれの人数表示
- リアルタイム更新

---

## 今後の拡張案（未実装）

### 優先度: 高

- [ ] 出欠登録の編集・削除機能
  - ユーザーが自分の登録を変更・削除
  - `updateAttendance`, `deleteAttendance` は実装済み
  - UI の実装が必要

- [ ] 詳細な出欠一覧表示
  - イベントごとに誰が参加/不参加かを名前で表示
  - グループ内での名前一覧

### 優先度: 中

- [ ] データのエクスポート機能
  - CSV エクスポート
  - イベント×メンバーのマトリックス表示

- [ ] フィルタリング・検索機能
  - イベントを日付範囲で絞り込み
  - グループでフィルタリング
  - メンバー名で検索

### 優先度: 低

- [ ] 通知機能
  - イベント前日にリマインダー
  - 出欠登録の締切設定

- [ ] 認証機能
  - ユーザーログイン
  - 管理者権限の制御
  - メンバーごとの登録制限

---

## ファイル構成

```
attendance-hub/
├── app/
│   ├── page.tsx                    # トップページ（イベント一覧）
│   ├── admin/
│   │   ├── page.tsx               # 管理画面トップ
│   │   ├── groups/page.tsx        # グループ管理
│   │   └── events/page.tsx        # イベント日付管理
│   └── events/[id]/
│       ├── page.tsx               # イベント詳細
│       └── register/page.tsx      # 出欠登録
├── components/
│   ├── loading-spinner.tsx        # ローディング表示
│   └── skeleton.tsx               # スケルトンUI
├── lib/
│   ├── event-service.ts           # イベント日付サービス
│   ├── group-service.ts           # グループサービス
│   ├── member-service.ts          # メンバーサービス
│   ├── attendance-service.ts      # 出欠サービス
│   ├── storage.ts                 # localStorage 操作
│   ├── validation.ts              # Zod スキーマ
│   ├── date-utils.ts              # 日付フォーマット
│   └── error-utils.ts             # エラーハンドリング
├── types/
│   └── index.ts                   # TypeScript 型定義
└── __tests__/
    └── lib/
        ├── storage.test.ts        # ストレージテスト
        ├── group-service.test.ts  # グループサービステスト
        └── attendance-service.test.ts # 出欠サービステスト
```

---

## 技術スタック

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.3
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **Date**: date-fns (日本語ロケール)
- **Storage**: localStorage
- **Testing**: Jest + @testing-library/react

---

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# テスト実行
npm test

# ビルド
npm run build

# 本番サーバー起動
npm start
```

---

## Notes

- 本プロトタイプは densuke.biz のような出欠確認アプリの改善版
- グループ別の参加人数が一目でわかる設計
- 汎用的な「グループ」概念（楽器パート、部署、クラス等に対応）
- 認証なし、全員が管理者として利用可能
- ローカルストレージで完結（サーバー不要）
