# Implementation Plan: Multi-Tenant Organization Support

**Branch**: `005-multi-tenant` | **Date**: 2025-11-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-multi-tenant/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

複数の異なる団体が独立してattendance-hubを使えるようにするマルチテナント機能。各団体はランダムに自動発行されたID（8-12文字）でURLパス識別され、localStorage + URLパスベースでデータを完全に分離する。トップページには説明と団体作成機能のみを表示し、既存団体の一覧は表示しない（プライバシー保護）。既存ユーザーのデータは自動マイグレーションで「デフォルト団体」として継続利用可能。

## Technical Context

**Language/Version**: TypeScript 5.9 (strict mode必須)
**Primary Dependencies**: Next.js 16 (App Router), React 19.2, Tailwind CSS 3.4, nanoid（ランダムID生成）
**Storage**: localStorage（プロトタイプ用、将来的にSupabase PostgreSQLへ移行予定）
**Testing**: Jest 29+, React Testing Library 14+
**Target Platform**: Web（モダンブラウザ、Chrome/Firefox/Safari最新版）
**Project Type**: Web（Next.js App Router + localStorage）
**Performance Goals**: 初期ページロード 3秒以内（3G接続）、TTI 5秒以内、Lighthouse Performance 90以上
**Constraints**: localStorage容量制限 5-10MB、無料枠内運用（Vercel）、認証なし（プロトタイプ）
**Scale/Scope**: 10-20団体/ブラウザ、小規模チーム向け、84テスト（既存）+ 追加テスト

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### I. セキュリティ第一開発

- ⚠️ **VIOLATION**: 認証機能なし（URLを知っている人は誰でもアクセス可能）
- ⚠️ **VIOLATION**: RLSポリシーなし（localStorage使用のため）
- **正当化**: プロトタイプフェーズの意図的な設計。将来のSupabase移行時に認証+RLSを実装予定。現状はURLの秘匿性によるセキュリティ（Security by Obscurity）を採用。
- ✅ 入力検証とサニタイゼーション（Zod使用）
- ✅ XSS/インジェクション対策（React/Next.jsのデフォルト保護）

### II. 無料枠最適化

- ✅ **PASS**: localStorageのみ使用、外部サービス不要
- ✅ **PASS**: 追加コストなし、無料枠内で完結

### III. 型安全性

- ✅ **PASS**: TypeScript strict mode必須
- ✅ **PASS**: 全エンティティに`organizationId`型追加
- ✅ **PASS**: Zodスキーマでランタイム検証

### IV. レスポンシブ・モバイルファースト設計

- ✅ **PASS**: Tailwind CSS使用
- ✅ **PASS**: 既存のモバイルファースト実装を継承

### V. サーバーレスアーキテクチャ

- ⚠️ **CONCERN**: localStorage使用（サーバーサイドなし）
- **正当化**: プロトタイプフェーズ。Supabase移行時にサーバーレスアーキテクチャへ移行予定。

### VI. アクセシビリティ基準

- ✅ **PASS**: セマンティックHTML、キーボードナビゲーション
- ✅ **PASS**: WCAG 2.1 AA準拠継続

### VII. 日本語対応とローカライゼーション

- ✅ **PASS**: 全UIテキストを日本語で実装

### VIII. テスト駆動開発（TDD）

- ✅ **PASS**: Red-Green-Refactorサイクル遵守
- ✅ **PASS**: テストファーストで実装
- ✅ **PASS**: 既存84テスト維持 + 新規テスト追加

### IX. パフォーマンス基準

- ✅ **PASS**: パフォーマンス目標達成（ページロード3秒以内、TTI 5秒以内）
- ✅ **PASS**: Lighthouse Performance 90以上維持

### Constitution Compliance Summary

**Status**: ⚠️ **CONDITIONAL PASS** with justified violations

**Violations Requiring Justification**:

1. セキュリティ第一開発（認証なし、RLSなし）→ プロトタイプフェーズの意図的設計、Complexity Trackingで文書化
2. サーバーレスアーキテクチャ（localStorage使用）→ 将来のSupabase移行前提

**Action Required**: Complexity Trackingセクションで正当化を文書化（下記参照）

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
attendance-hub/
├── app/                          # Next.js App Router（変更大）
│   ├── [org]/                    # 新規: 団体別動的ルート
│   │   ├── layout.tsx           # 新規: OrganizationProvider
│   │   ├── page.tsx             # 移動: イベント一覧（旧 app/page.tsx）
│   │   ├── admin/               # 移動: 管理画面
│   │   │   ├── page.tsx
│   │   │   ├── organizations/   # 新規: 団体設定
│   │   │   │   └── page.tsx
│   │   │   ├── groups/
│   │   │   │   └── page.tsx
│   │   │   └── events/
│   │   │       └── page.tsx
│   │   ├── events/              # 移動: イベント関連
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── register/
│   │   │           └── page.tsx
│   │   └── my-register/         # 移動: 一括出欠登録
│   │       └── page.tsx
│   ├── page.tsx                 # 変更: トップページ（説明+団体作成）
│   ├── layout.tsx               # 既存: グローバルレイアウト
│   └── globals.css              # 既存
│
├── components/                   # 再利用可能コンポーネント（変更小）
│   ├── bulk-register/           # 既存（organizationId prop追加）
│   │   ├── member-selector.tsx
│   │   └── event-list.tsx
│   ├── loading-spinner.tsx      # 既存（変更なし）
│   └── skeleton.tsx             # 既存（変更なし）
│
├── contexts/                     # 新規ディレクトリ
│   └── organization-context.tsx # 新規: 団体コンテキスト
│
├── lib/                          # ビジネスロジック（変更大）
│   ├── storage.ts               # 変更: 団体ID対応キー生成
│   ├── organization-service.ts  # 新規: 団体管理
│   ├── group-service.ts         # 変更: organizationId追加
│   ├── event-service.ts         # 変更: organizationId追加
│   ├── member-service.ts        # 変更: organizationId追加
│   ├── attendance-service.ts    # 変更: organizationId追加
│   ├── migration.ts             # 新規: データマイグレーション
│   ├── validation.ts            # 変更: Organizationスキーマ追加
│   └── date-utils.ts            # 既存（変更なし）
│
├── types/                        # 型定義（変更大）
│   └── index.ts                 # 変更: Organization型追加、全エンティティにorganizationId追加
│
└── __tests__/                    # テスト（変更・追加大）
    ├── app/
    │   ├── page.test.tsx        # 変更: 団体選択ページテスト
    │   ├── admin/
    │   │   ├── events/page.test.tsx
    │   │   └── organizations/page.test.tsx  # 新規
    │   ├── events/[id]/page.test.tsx
    │   └── my-register/page.test.tsx
    ├── components/
    │   └── bulk-register/
    │       ├── member-selector.test.tsx  # 変更
    │       └── event-list.test.tsx       # 変更
    ├── contexts/
    │   └── organization-context.test.tsx # 新規
    └── lib/
        ├── storage.test.ts               # 変更
        ├── organization-service.test.ts  # 新規
        ├── group-service.test.ts         # 変更
        ├── member-service.test.ts        # 変更
        ├── attendance-service.test.ts    # 変更
        └── migration.test.ts             # 新規
```

**Structure Decision**: Next.js App Routerのweb application構造を採用。動的ルーティング `[org]` を使用してマルチテナント対応を実現。既存の単一プロジェクト構造を維持しつつ、ルート構造を大幅に変更（`app/` → `app/[org]/`）。

## Complexity Tracking

| Violation                                                  | Why Needed                                                                                                       | Simpler Alternative Rejected Because                                                                                                                                                                                               |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **認証機能なし（Supabase Auth不使用）**                    | プロトタイプフェーズで迅速な検証が必要。localStorageベースのシンプルな実装で、複数団体の独立動作を先行検証。     | Supabase Auth導入は時期尚早。まず基本的なマルチテナント分離ロジックを確立し、その後の移行フェーズでSupabase + 認証を一括導入する方が効率的。現時点での認証実装は複雑性を増すだけでプロトタイプの目的（機能検証）に寄与しない。     |
| **RLSポリシーなし（localStorageのため）**                  | localStorageはクライアントサイドのみで動作するため、RLS（Row Level Security）の概念が適用できない。              | データベース（Supabase PostgreSQL）を使用すればRLSを適用できるが、プロトタイプフェーズでは過剰。localStorage + URLの秘匿性（Security by Obscurity）で十分なセキュリティレベルを提供。本番運用時にSupabase移行でRLSを実装予定。     |
| **localStorage使用（サーバーレスアーキテクチャ違反）**     | プロトタイプフェーズで外部サービス依存なしに迅速に検証。無料枠最適化の観点から追加コストなし。                   | Supabase（PostgreSQL）を今すぐ使用すると、データモデル設計、マイグレーション、認証、RLSの全てを同時に実装する必要があり、複雑性が爆発的に増加。段階的アプローチ（まずlocalStorageで検証 → 後でSupabase移行）の方が安全かつ効率的。 |
| **URLの秘匿性によるセキュリティ（Security by Obscurity）** | プロトタイプ段階で認証なしに複数団体の分離を実現するため。ランダムID（8-12文字、nanoid）により推測困難性を確保。 | 真の認証機能（Supabase Auth + RLS）が理想だが、プロトタイプフェーズでは過剰。URLの秘匿性は一時的な対策であり、本番運用前にSupabase移行で完全な認証・認可を実装予定。仕様書に制約として明記済み。                                   |

**Migration Path（憲法遵守への道筋）**:

1. **フェーズ1（現在）**: localStorage + URLパスベースでマルチテナント機能を検証（005-multi-tenant）
2. **フェーズ2（将来）**: Supabase PostgreSQL + Supabase Auth + RLS移行（別フィーチャー）
   - データモデルはSupabase移行を前提に設計（organizationId を全エンティティに追加）
   - RLSポリシー実装（`users.organization_id = auth.uid().organization_id`）
   - 認証フロー実装（メール/パスワード、OAuth）
3. **フェーズ3（本番）**: 完全な憲法遵守状態で運用

**Justification Summary**: プロトタイプフェーズの段階的アプローチとして、意図的に憲法の一部を逸脱。将来のSupabase移行で完全遵守を達成する明確な計画あり。現時点での違反は、リスク管理された技術的判断である。
