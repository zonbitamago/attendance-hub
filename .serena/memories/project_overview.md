# attendance-hub プロジェクト概要

## 目的
出欠管理アプリケーション。団体のイベントに対するメンバーの出欠を管理するWebアプリ。

## 技術スタック

### フロントエンド
- **TypeScript 5.9** (strict mode必須)
- **Next.js 16.0.1** (App Router)
- **React 19.2.0**
- **Tailwind CSS 3.4.15**

### データストレージ
- **Supabase PostgreSQL** (v2.3で移行完了)

### ユーティリティ
- **Zod** - バリデーション
- **date-fns** - 日付操作
- **nanoid** - ランダムID生成

### テスト
- **Jest 29.7.0**
- **@testing-library/react 16.0.1**
- **@testing-library/jest-dom 6.6.3**
- **@testing-library/user-event 14.6.1**

### リンター・フォーマッター
- **ESLint 9**
- **Prettier 3.3.3**

## 主要機能
- 団体（Organization）管理
- グループ管理
- メンバー管理
- イベント管理
- 出欠登録（個別・一括）
- イベント別出欠状況表示

## 現在のバージョン
v2.3 (Supabase PostgreSQL対応完了)

## テスト状況
- 467テスト全てpass
- カバレッジ 90.17%
