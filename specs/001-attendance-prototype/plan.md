# Implementation Plan: 出欠確認プロトタイプ

**Branch**: `001-attendance-prototype` | **Date**: 2025-11-05 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-attendance-prototype/spec.md`

## Summary

プロトタイプの出欠確認アプリケーションの実装計画。認証なしでローカルストレージにデータを保存し、グループの作成・出欠登録・集計表示・履歴表示・編集削除機能を提供する。Next.js 15 App Routerを使用し、完全にクライアントサイドで動作するSPA（Single Page Application）として実装する。

## Technical Context

**Language/Version**: TypeScript 5.3以上（strict mode）
**Primary Dependencies**: Next.js 15、React 19、Tailwind CSS 3.4
**Storage**: ブラウザのlocalStorage（プロトタイプ用、将来的にSupabase PostgreSQLへ移行）
**Testing**: Jest 29、React Testing Library 14（プロトタイプでは簡易テストのみ）
**Target Platform**: モダンブラウザ（Chrome/Firefox/Safari/Edge最新版）
**Project Type**: Web（Single Page Application）
**Performance Goals**:
- ページロード3秒以内（3G接続）
- TTI（Time to Interactive）5秒以内
- 100件のグループ + 各50件の出欠登録でも3秒以内に表示
**Constraints**:
- localStorageの容量制限（5-10MB）
- 認証なし（プロトタイプ）
- オフライン動作可能
**Scale/Scope**: 小規模プロトタイプ（数十グループ、数百出欠登録を想定）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### セキュリティ第一開発（原則I）

**プロトタイプ例外**:
- ❌ 認証なし → プロトタイプのため例外。将来的にSupabase Authで実装
- ✅ XSS対策 → Reactの自動エスケープを活用
- ✅ 入力検証 → クライアントサイドでZodを使用した検証

**正当化**: プロトタイプフェーズのため、認証機能は将来実装。現時点ではデータがローカルストレージに保存されるため、セキュリティリスクは限定的。

### 無料枠最適化（原則II）

✅ **完全準拠**: localStorageのみ使用、外部サービス不要

### 型安全性（原則III）

✅ **完全準拠**: TypeScript strict mode、すべてのデータ型を定義

### レスポンシブ・モバイルファースト設計（原則IV）

✅ **完全準拠**: Tailwind CSSでモバイルファースト、320px〜1920pxまでサポート

### サーバーレスアーキテクチャ（原則V）

✅ **完全準拠**: 完全なクライアントサイドSPA、サーバーサイド処理なし

### アクセシビリティ基準（原則VI）

✅ **準拠**: セマンティックHTML、キーボードナビゲーション、適切なコントラスト比

### 日本語対応（原則VII）

✅ **完全準拠**: すべてのUIが日本語、日本の日付フォーマット

### TDD（原則VIII）

**プロトタイプ簡略化**:
- △ 基本的なユニットテストのみ実装（ビジネスロジック中心）
- 完全なTDDサイクルは本実装で適用

**正当化**: プロトタイプのため、コア機能の動作確認を優先。本実装時にフルTDDを適用。

### パフォーマンス基準（原則IX）

✅ **準拠**: localStorageアクセスの最適化、レンダリングの最適化

## Project Structure

### Documentation (this feature)

```text
specs/001-attendance-prototype/
├── spec.md              # 機能仕様書
├── plan.md              # この実装計画書
├── data-model.md        # データモデル設計
├── quickstart.md        # 開発クイックスタート
└── checklists/
    └── requirements.md  # 仕様品質チェックリスト
```

### Source Code (repository root)

プロトタイプは完全にクライアントサイドのSPAとして実装するため、シンプルな構造を採用：

```text
attendance-hub/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # トップページ（グループ一覧）
│   ├── groups/
│   │   ├── [id]/
│   │   │   ├── page.tsx          # グループ詳細
│   │   │   ├── register/page.tsx # 出欠登録
│   │   │   └── history/page.tsx  # 履歴表示
│   │   └── new/page.tsx  # グループ作成
│   └── globals.css        # Tailwind CSS
├── components/            # 再利用可能なコンポーネント
│   ├── group-list.tsx
│   ├── group-form.tsx
│   ├── attendance-form.tsx
│   ├── attendance-list.tsx
│   ├── summary-card.tsx
│   └── history-list.tsx
├── lib/                   # ビジネスロジック・ユーティリティ
│   ├── storage.ts        # localStorage操作
│   ├── group-service.ts  # グループ関連ロジック
│   ├── attendance-service.ts  # 出欠登録関連ロジック
│   ├── validation.ts     # Zodスキーマ
│   └── date-utils.ts     # 日付フォーマット
├── types/                 # TypeScript型定義
│   └── index.ts
├── __tests__/            # テスト（プロトタイプでは簡易）
│   ├── lib/
│   │   ├── storage.test.ts
│   │   ├── group-service.test.ts
│   │   └── attendance-service.test.ts
│   └── components/
│       └── summary-card.test.tsx
├── public/               # 静的アセット
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

**Structure Decision**:
- プロトタイプのため、シンプルな単一プロジェクト構造を採用
- App Routerの機能を活用してルーティングを簡潔に
- ビジネスロジックを`lib/`に集約し、テスタビリティを確保
- コンポーネントは再利用可能な粒度で分割

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| 認証なし（原則I） | プロトタイプの迅速な検証 | ユーザー識別が不要なため、認証は過剰。将来実装時にSupabase Authで対応 |
| TDD簡略化（原則VIII） | プロトタイプの速度優先 | 基本的なテストは実装するが、完全なTDDサイクルはプロトタイプの目的に対してオーバーヘッド |

## Phase 0: Research

プロトタイプのため、リサーチフェーズはスキップ。技術スタックは憲法で定義済み（Next.js 15、React 19、TypeScript、Tailwind CSS）。

**Key Decisions Made**:
- **データ永続化**: localStorage（`JSON.stringify`/`parse`でシリアライズ）
- **状態管理**: React標準のuseState/useContext（Zustandなど不要）
- **バリデーション**: Zod（軽量で型安全）
- **日付処理**: date-fns（日本語ロケール対応）
- **ID生成**: UUID v4（`crypto.randomUUID()`）

## Phase 1: Design & Data Model

データモデルは [data-model.md](data-model.md) を参照。

### 主要エンティティ

1. **Group（グループ）**
   - id, name, description, createdAt

2. **Attendance（出欠登録）**
   - id, groupId, userName, status, createdAt

3. **Summary（集計結果）**
   - グループIDから動的に算出（エンティティとしては保存しない）

### データフロー

```
User Input → Validation (Zod) → Service Layer → localStorage → React State → UI
```

## Phase 1: Implementation Order

### セットアップ（優先度: 必須）

1. Next.js 15プロジェクト初期化
2. TypeScript設定（strict mode）
3. Tailwind CSS設定
4. ESLint + Prettier設定
5. 基本的なプロジェクト構造作成

### Phase 1-A: コア機能（P1 - MVP）

**User Story 1: グループを作成して出欠を登録する**

1. データ型定義（`types/index.ts`）
2. localStorage操作（`lib/storage.ts`）
3. グループサービス（`lib/group-service.ts`）
4. 出欠登録サービス（`lib/attendance-service.ts`）
5. バリデーションスキーマ（`lib/validation.ts`）
6. グループ一覧ページ（`app/page.tsx`）
7. グループ作成フォーム（`app/groups/new/page.tsx`）
8. グループ詳細ページ（`app/groups/[id]/page.tsx`）
9. 出欠登録フォーム（`app/groups/[id]/register/page.tsx`）

### Phase 1-B: 集計機能（P2）

**User Story 2: グループの集計結果を確認する**

10. 集計ロジック（`lib/attendance-service.ts`に追加）
11. 集計カードコンポーネント（`components/summary-card.tsx`）
12. グループ詳細ページに集計表示を追加

### Phase 1-C: 編集・削除機能（P3）

**User Story 3: 登録内容を確認・編集する**

13. 出欠一覧コンポーネント（`components/attendance-list.tsx`）
14. 編集・削除機能（`lib/attendance-service.ts`に追加）
15. 出欠一覧ページ with 編集・削除

### Phase 1-D: 履歴機能（P3）

**User Story 4: グループの出欠履歴を表示する**

16. 履歴表示コンポーネント（`components/history-list.tsx`）
17. 履歴ページ（`app/groups/[id]/history/page.tsx`）

### Phase 1-E: テストとポリッシュ

18. ユニットテスト（ビジネスロジック）
19. エラーハンドリング改善
20. モバイルレスポンシブ調整
21. アクセシビリティ確認

## Next Steps

実装計画完了後、以下のコマンドでタスクリストを生成：

```
/speckit.tasks
```

これにより、具体的な実装タスクが`tasks.md`に生成されます。

## Notes

- プロトタイプのため、認証とクラウド同期は将来実装
- localStorage の容量制限（5-10MB）を考慮した設計
- 本実装時にSupabase + RLSへ移行予定
- TDDは簡略化するが、コアロジックは必ずテストを書く
