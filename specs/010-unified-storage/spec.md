# Feature Specification: 統合ストレージ層

**Feature Branch**: `010-unified-storage`
**Created**: 2025-11-19
**Status**: Draft
**Input**: 環境に応じたストレージ切り替え機能を実装する。本番環境はSupabaseに保存、ローカル環境はオプションフラグ付きでSupabase、それ以外はlocalStorageに保存する。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - ローカル開発でのlocalStorage使用 (Priority: P1)

開発者がローカル環境で開発する際、デフォルトでlocalStorageを使用してデータを保存できる。Supabaseの設定や接続がなくても開発を進められる。

**Why this priority**: 開発効率を最優先。Supabase設定なしでローカル開発を即座に開始でき、開発者の生産性を維持する。

**Independent Test**: ローカル環境で`npm run dev`を実行し、団体・グループ・イベント・出欠を登録してブラウザのlocalStorageにデータが保存されることを確認できる。

**Acceptance Scenarios**:

1. **Given** ローカル環境で環境変数が未設定, **When** `npm run dev`でアプリを起動, **Then** デフォルトでlocalStorageが使用される
2. **Given** localStorageモードで起動中, **When** 団体を作成, **Then** データがブラウザのlocalStorageに保存される
3. **Given** localStorageにデータが保存済み, **When** ページをリロード, **Then** データが正しく読み込まれる

---

### User Story 2 - ローカル環境でのSupabaseテスト (Priority: P2)

開発者がローカル環境でSupabase接続をテストする際、専用コマンドでSupabaseモードを有効化してデータを保存できる。

**Why this priority**: 本番デプロイ前にSupabase接続をローカルで検証でき、本番環境でのトラブルを防止する。

**Independent Test**: `npm run dev:supabase`を実行し、団体を作成してSupabaseダッシュボードでデータが登録されていることを確認できる。

**Acceptance Scenarios**:

1. **Given** ローカル環境でSupabase環境変数が設定済み, **When** `npm run dev:supabase`でアプリを起動, **Then** Supabaseストレージが使用される
2. **Given** Supabaseモードで起動中, **When** 団体を作成, **Then** データがSupabase PostgreSQLに保存される
3. **Given** Supabaseモードで起動中, **When** グループ・イベント・出欠を登録, **Then** すべてのデータがSupabaseに保存される

---

### User Story 3 - 本番環境でのSupabase自動使用 (Priority: P1)

本番環境ではSupabaseが自動的に使用され、すべてのデータが永続的に保存される。

**Why this priority**: 本番環境でのデータ永続化は必須要件。ユーザーデータが確実にサーバーサイドで保存される必要がある。

**Independent Test**: Vercelにデプロイ後、団体を作成してSupabaseダッシュボードでデータが登録されていることを確認できる。

**Acceptance Scenarios**:

1. **Given** 本番環境（Vercel）にデプロイ, **When** アプリが起動, **Then** 自動的にSupabaseストレージが使用される
2. **Given** 本番環境で起動中, **When** 団体・グループ・イベント・出欠を登録, **Then** すべてのデータがSupabase PostgreSQLに保存される
3. **Given** 本番環境でデータが保存済み, **When** 別のデバイスからアクセス, **Then** 同じデータが参照できる

---

### Edge Cases

- 環境変数`NEXT_PUBLIC_USE_SUPABASE`が`true`だがSupabase認証情報が欠落している場合は、エラーメッセージを表示
- localStorageが満杯の場合は、適切なエラーメッセージを表示
- Supabase接続エラー時は、ユーザーにわかりやすいエラーを表示（ローカルモードへのフォールバックは行わない）
- 非同期操作中のローディング状態を適切に表示

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: システムは環境変数`NEXT_PUBLIC_USE_SUPABASE`の値に基づいてストレージを切り替えなければならない
- **FR-002**: 環境変数が`true`の場合、システムはSupabase PostgreSQLにデータを保存しなければならない
- **FR-003**: 環境変数が`false`または未設定の場合、システムはlocalStorageにデータを保存しなければならない
- **FR-004**: 統合ストレージ層は、organization、group、event、attendanceの全サービスで使用しなければならない
- **FR-005**: 両方のストレージモードで同一のインターフェース（関数シグネチャ）を提供しなければならない
- **FR-006**: Supabaseモード用の開発コマンド`npm run dev:supabase`を提供しなければならない
- **FR-007**: ストレージ切り替えは既存のテストに影響を与えてはならない（モック設定で対応）
- **FR-008**: 本番環境（`NODE_ENV=production`）では、Supabaseストレージを強制使用しなければならない

### Key Entities

- **StorageMode**: ストレージの種類を示す設定値（`localStorage` | `supabase`）
- **UnifiedStorage**: 両方のストレージバックエンドへの統一インターフェース

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: ローカル環境で`npm run dev`実行時、localStorageにデータが正しく保存・読み込みできる
- **SC-002**: ローカル環境で`npm run dev:supabase`実行時、Supabaseにデータが正しく保存・読み込みできる
- **SC-003**: 本番環境で、すべてのCRUD操作がSupabaseで正常に動作する
- **SC-004**: 既存の全テスト（467件）がpassし、ビルドが成功する
- **SC-005**: ストレージ切り替えによるパフォーマンス劣化がない（既存の200ms以内の応答時間を維持）

## Assumptions

- Supabase環境変数（`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`）は既に設定済み
- 既存の`lib/supabase-storage.ts`のSupabase操作関数は正しく動作する
- `lib/storage.ts`のlocalStorage操作関数は正しく動作する
- テスト環境ではlocalStorageモードまたはモックを使用する
