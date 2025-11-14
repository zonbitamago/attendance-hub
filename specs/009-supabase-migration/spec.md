# Feature Specification: Supabase Migration with Multi-Tenant RLS

**Feature Branch**: `009-supabase-migration`
**Created**: 2025-11-15
**Status**: Draft
**Input**: User description: "localStorage から Supabase PostgreSQL + Row Level Security (RLS) への完全移行。マルチテナント機能（005-multi-tenant）を Supabase RLS で統合し、各団体のデータをデータベースレベルで完全に分離する。認証機能は後回しとし、データストレージ層のみを実装する。既存データの移行ツールは提供せず、クリーンスタートとする。全エンティティ（Organization, EventDate, Group, Member, Attendance）をPostgreSQLテーブルに移行し、外部キー制約とインデックスを設定する。サービス層を同期処理から非同期処理（async/await）に変更し、集計処理をSQLクエリで実装する。"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - データストレージの完全移行 (Priority: P1)

開発者は、ブラウザのlocalStorageからSupabase PostgreSQLデータベースへ完全に移行し、データの永続性、可用性、スケーラビリティを向上させる。全エンティティ（Organization, EventDate, Group, Member, Attendance）がデータベーステーブルとして作成され、適切な制約とインデックスが設定される。

**Why this priority**: データストレージの移行はこのフィーチャーの基盤であり、他のすべての機能がこれに依存する。これがなければマイグレーション全体が機能しない。

**Independent Test**: Supabaseプロジェクトに接続し、各テーブルにデータを作成・読み込み・更新・削除できることを確認する。外部キー制約とカスケード削除が正常に動作することを検証する。

**Acceptance Scenarios**:

1. **Given** Supabaseプロジェクトが作成され、接続情報が設定されている、**When** データベースマイグレーションを実行する、**Then** 5つのテーブル（organizations, event_dates, groups, members, attendances）が作成され、各テーブルに適切なカラム、制約、インデックスが設定されている
2. **Given** organizationsテーブルにデータが存在する、**When** 団体を削除する、**Then** 外部キー制約により関連する全データ（event_dates, groups, members, attendances）も自動的に削除される（カスケード削除）
3. **Given** attendancesテーブルにデータを挿入しようとする、**When** 同じ(event_date_id, member_id)の組み合わせで2回挿入を試みる、**Then** 一意制約により2回目の挿入が失敗する
4. **Given** データベースに大量のデータ（1000+レコード）が存在する、**When** インデックスを使用したクエリを実行する、**Then** 応答時間が許容範囲内（200ms以内）である

---

### User Story 2 - マルチテナントのデータベースレベル分離 (Priority: P1)

開発者は、Row Level Security (RLS) ポリシーを使用して、各団体のデータをデータベースレベルで完全に分離する。URLパスの団体IDに基づいてアクセス制御が行われ、他の団体のデータには一切アクセスできない。

**Why this priority**: データ分離はマルチテナント機能の核心であり、セキュリティとプライバシーの基盤となる。P1と同等に重要。

**Independent Test**: 2つの異なる団体を作成し、それぞれのデータを挿入した後、各団体のコンテキストで他の団体のデータが見えないことを確認する。

**Acceptance Scenarios**:

1. **Given** RLSポリシーが全テーブルに設定されている、**When** 団体A（organization_id='abc123'）のコンテキストでクエリを実行する、**Then** 団体Aのデータのみが返され、団体Bのデータは一切返されない
2. **Given** 同じ状態で、**When** 団体Aのコンテキストで団体Bのデータを直接IDで取得しようとする、**Then** RLSポリシーによりアクセスが拒否される
3. **Given** RLSポリシーが有効、**When** 存在しない団体ID（'nonexistent'）でクエリを実行する、**Then** 空の結果セットが返される（エラーではなく、アクセス権がないためデータが見えない）
4. **Given** 団体Aが削除された、**When** 団体Aのコンテキストでクエリを実行する、**Then** 空の結果セットが返される

---

### User Story 3 - サービス層の非同期化 (Priority: P2)

開発者は、全サービス層の関数を同期処理から非同期処理（async/await）に変更し、Supabase Clientの非同期APIと統合する。集計処理はTypeScriptコードからSQLクエリに移行され、パフォーマンスが向上する。

**Why this priority**: データストレージの移行後に必要だが、データベーススキーマやRLSほど基盤的ではない。段階的に実装可能。

**Independent Test**: 各サービス関数を呼び出し、正しいデータが返されることを確認する。集計関数（calculateEventSummary, calculateEventTotalSummary）がSQLで実行され、正しい結果を返すことを検証する。

**Acceptance Scenarios**:

1. **Given** Supabaseデータベースにデータが存在する、**When** `getAllEventDates(orgId)` を呼び出す、**Then** 非同期処理により全イベントが日付昇順で返される
2. **Given** 同じ状態で、**When** `calculateEventSummary(orgId, eventId)` を呼び出す、**Then** SQLのGROUP BYクエリによりグループ別の出欠集計が返される
3. **Given** 100メンバー、10イベントのデータが存在する、**When** 集計関数を呼び出す、**Then** 200ms以内に結果が返される（パフォーマンステスト）
4. **Given** upsertBulkAttendances関数を使用、**When** 複数の出欠データを一括で作成・更新する、**Then** バッチ処理により効率的に処理され、重複データが自動的に更新される

---

### User Story 4 - UI層の非同期対応とローディング状態 (Priority: P3)

開発者は、全ページコンポーネントをサービス層の非同期関数に対応させ、適切なローディング状態とエラーハンドリングを実装する。ユーザーはデータ読み込み中に視覚的なフィードバックを受け取り、エラー発生時には明確なメッセージが表示される。

**Why this priority**: ユーザー体験の向上に重要だが、基盤機能（データベース、RLS、サービス層）が動作すれば後から改善可能。

**Independent Test**: 各ページにアクセスし、データ読み込み中にローディングスピナーが表示され、読み込み完了後に正しいデータが表示されることを確認する。

**Acceptance Scenarios**:

1. **Given** イベント一覧ページ（/[org]/）にアクセスする、**When** データベースからデータを取得中、**Then** ローディングスピナーが表示され、取得完了後にイベント一覧が表示される
2. **Given** 出欠登録ページにアクセス、**When** データ取得エラーが発生する、**Then** ユーザーフレンドリーなエラーメッセージが表示され、リトライオプションが提供される
3. **Given** 複数の非同期操作が並行実行される、**When** 一部の操作が失敗する、**Then** 成功した操作の結果は表示され、失敗した操作のみエラー表示される
4. **Given** OrganizationContextがSupabaseから団体データを取得、**When** 存在しない団体IDでアクセスする、**Then** 404エラーページが表示される

---

### User Story 5 - テスト戦略の更新 (Priority: P2)

開発者は、全テストをSupabase Client対応に更新し、適切なモック戦略を実装する。既存のテストカバレッジ（45%以上）を維持しながら、非同期処理とデータベース操作のテストを追加する。

**Why this priority**: 品質保証に重要だが、実装と並行して段階的に更新可能。P2として実装フェーズ中に対応。

**Independent Test**: 全テストスイートを実行し、181個のテストすべてがpassすることを確認する。カバレッジレポートで閾値（45%以上）を満たすことを検証する。

**Acceptance Scenarios**:

1. **Given** Supabase Clientモックが実装されている、**When** サービス層のテストを実行する、**Then** 全テストがpassし、実際のデータベースに接続せずにテストが完了する
2. **Given** 非同期処理のテストが追加されている、**When** async/await関数をテストする、**Then** Promiseが正しく解決され、期待される結果が返される
3. **Given** テストカバレッジを測定、**When** `npm test` を実行する、**Then** カバレッジが最小閾値（branches: 30%, functions: 50%, lines: 45%, statements: 45%）を満たす
4. **Given** CI/CDパイプライン、**When** プルリクエストが作成される、**Then** 全テスト、リント、ビルドが自動実行され、すべてpassする

---

### Edge Cases

- Supabaseプロジェクトへの接続が失敗した場合、適切なエラーメッセージを表示し、リトライオプションを提供する
- データベースの容量制限に達した場合、警告メッセージを表示し、古いデータの削除を促す
- ネットワーク遅延が発生した場合でも、ローディング状態を適切に表示し、タイムアウト処理を実装する
- 複数のタブやウィンドウで同時に同じ団体を操作した場合、データの整合性を保つ（楽観的ロックまたはタイムスタンプベースの競合解決）
- 極めて大量のデータ（10,000+レコード）が存在する場合でも、ページネーションやインデックスにより許容範囲内のパフォーマンスを維持する
- RLSポリシーの設定ミスにより意図しないデータ漏洩が発生しないよう、各ポリシーを個別にテストする
- データベースマイグレーション実行中にエラーが発生した場合、ロールバック可能な状態を維持する
- UUID生成が衝突した場合（極めて稀）、データベースの一意制約によりエラーが発生し、再試行する

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: システムはSupabase PostgreSQLデータベースに5つのテーブル（organizations, event_dates, groups, members, attendances）を作成し、各テーブルに適切なカラム、主キー、外部キー、インデックスを設定すること
- **FR-002**: 全ての外部キー制約は `ON DELETE CASCADE` を設定し、親レコード削除時に関連データも自動削除されること
- **FR-003**: attendancesテーブルには `(event_date_id, member_id)` の一意制約を設定し、重複登録を防止すること
- **FR-004**: 全テーブルに `organization_id` カラムを含め、Row Level Security (RLS) ポリシーによりアクセス制御を行うこと
- **FR-005**: RLSポリシーは、URLパスの団体IDに基づいて、各クエリで該当する団体のデータのみアクセス可能とすること
- **FR-006**: RLSポリシーは認証なしアクセスに対応し、将来的に認証機能を追加した際に拡張可能な設計とすること
- **FR-007**: パフォーマンス最適化のため、頻繁にクエリされるカラム（organization_id, date, group_id, event_date_id など）にインデックスを作成すること
- **FR-008**: データ層（lib/storage.ts または lib/supabase-storage.ts）は全CRUD操作を非同期関数として実装し、Supabase Clientを使用すること
- **FR-009**: サービス層（*-service.ts）の全関数を async/await に変更し、データ層の非同期関数を呼び出すこと
- **FR-010**: 集計処理（calculateEventSummary, calculateEventTotalSummary）はSQLクエリ（JOIN, GROUP BY）で実装し、TypeScriptでのループ処理を削減すること
- **FR-011**: upsert操作（upsertAttendance, upsertBulkAttendances）はSupabaseの `upsert()` メソッドまたはSQL `ON CONFLICT ... DO UPDATE` 構文を使用すること
- **FR-012**: 全ページコンポーネントはサービス層の非同期関数呼び出しに `await` を追加し、適切なエラーハンドリングを実装すること
- **FR-013**: データ読み込み中はローディングスピナーまたはスケルトンUIを表示し、読み込み完了後に実際のデータを表示すること
- **FR-014**: データベース操作エラー発生時は、ユーザーフレンドリーなエラーメッセージを表示し、可能であればリトライオプションを提供すること
- **FR-015**: OrganizationContextはSupabaseから団体データを非同期で取得し、存在しない団体IDの場合は404エラーページを表示すること
- **FR-016**: Supabase接続情報（URL, API Key）は環境変数（.env.local）で管理し、ソースコードにハードコードしないこと
- **FR-017**: 全テストはSupabase Clientのモックを使用し、実際のデータベースに接続せずにテスト可能であること
- **FR-018**: テストカバレッジは現在のレベル（約85%: statements 84.82%, branches 74.71%, functions 84.77%, lines 85.51%）を維持し、最小閾値（branches: 30%, functions: 50%, lines: 45%, statements: 45%）を下回らないこと
- **FR-019**: CI/CDパイプライン（型チェック、リント、テスト、ビルド）が全てpassすること

### Key Entities

- **Organization（団体）**: 複数の独立した団体を表す。各団体はランダムに発行された一意のID、名前、説明を持つ。PostgreSQLテーブルの主キーとして機能し、全ての他のエンティティが外部キーで参照する。
  - 属性: id（10文字のランダム文字列、主キー）、name（1-100文字）、description（0-500文字、オプション）、created_at（タイムスタンプ）

- **EventDate（イベント）**: 特定の団体に紐づく練習や本番などのイベント。日付、タイトル、場所を含む。
  - 属性: id（UUID、主キー）、organization_id（外部キー → organizations.id、ON DELETE CASCADE）、date（日付型）、title（1-100文字）、location（0-200文字、オプション）、created_at（タイムスタンプ）

- **Group（グループ）**: 特定の団体内のパートやセクション。表示順序と色を持つ。
  - 属性: id（UUID、主キー）、organization_id（外部キー → organizations.id、ON DELETE CASCADE）、name（1-50文字）、order（整数、≥0）、color（#RRGGBB形式、オプション）、created_at（タイムスタンプ）

- **Member（メンバー）**: 特定の団体内のグループに所属するメンバー。
  - 属性: id（UUID、主キー）、organization_id（外部キー → organizations.id、ON DELETE CASCADE）、group_id（外部キー → groups.id、ON DELETE CASCADE）、name（1-50文字）、created_at（タイムスタンプ）

- **Attendance（出欠記録）**: 特定の団体内のメンバーとイベントの組み合わせによる出欠状況。'◯'（参加）、'△'（未定）、'✗'（欠席）のいずれかのステータスを持つ。
  - 属性: id（UUID、主キー）、organization_id（外部キー → organizations.id、ON DELETE CASCADE）、event_date_id（外部キー → event_dates.id、ON DELETE CASCADE）、member_id（外部キー → members.id、ON DELETE CASCADE）、status（ENUM: '◯', '△', '✗'）、created_at（タイムスタンプ）
  - 一意制約: (event_date_id, member_id)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 全テストスイート（181テスト）が100% passし、ビルドが成功する
- **SC-002**: テストカバレッジが現在のレベル（約85%）を維持し、最小閾値（branches: 30%, functions: 50%, lines: 45%, statements: 45%）を満たす
- **SC-003**: マルチテナント機能が正常に動作し、3つ以上の異なる団体が同時に利用でき、各団体のデータが完全に分離されている
- **SC-004**: RLSポリシーにより、他の団体のデータに一切アクセスできないことを自動テストで100%検証できる
- **SC-005**: パフォーマンステストを通過し、100メンバーのデータに対する集計処理が200ms以内に完了する
- **SC-006**: データベースクエリがインデックスを適切に使用し、1000+レコードのクエリが許容範囲内（500ms以内）で完了する
- **SC-007**: ユーザーは各ページでデータ読み込み中にローディング状態を確認でき、エラー発生時には明確なメッセージが表示される
- **SC-008**: CI/CDパイプライン（型チェック、リント、テスト、ビルド）が全てpassし、プルリクエストをマージ可能である

## Assumptions

- Supabaseプロジェクトは新規作成され、接続情報（URL, API Key）が提供される
- 認証機能は本フィーチャーの範囲外とし、後続のフィーチャーで実装する
- 既存のlocalStorageデータを移行するツールは提供せず、ユーザーは新規にデータを作成する（クリーンスタート）
- マルチテナント機能（005-multi-tenant）は既に実装されており、全エンティティに `organizationId` フィールドが含まれている
- Supabase無料プランの制限内（500MB ストレージ、50,000 月間アクティブユーザー）で運用可能である
- 開発環境とプロダクション環境で異なるSupabaseプロジェクトを使用する
- データベースマイグレーションはSupabase CLIまたはSupabase Dashboardで実行される
- 既存のZodスキーマ（lib/validation.ts）は引き続き使用され、データベースの制約と一致する
- 既存のデータモデル（types/index.ts）は変更せず、Supabaseの型定義と統合する
- nanoid(10)で生成されるOrganization IDは引き続き使用され、データベースの主キーとして機能する
- 既存のテスト（181テスト）は段階的に更新され、実装と並行して修正される

## Constraints

- 大規模な変更が必要（約236ファイル: 新規20、大幅変更10、軽微変更25、テスト更新181）
- 全サービス層の同期処理から非同期処理への変更により、多くのコンポーネントが影響を受ける
- テストの一時的な失敗が予想されるため、段階的な実装とテスト修正が必要
- Supabase無料プランの制限（500MB ストレージ、API呼び出し数、同時接続数）により、大規模なデータや高トラフィックには対応できない
- ネットワークレイテンシーにより、localStorageと比較してデータ取得が遅くなる可能性がある
- RLSポリシーの設定ミスにより、意図しないデータ漏洩のリスクがある（徹底的なテストが必要）
- 既存のローカル開発環境からSupabase環境への移行により、開発者の学習コストが発生する
- Supabase Clientのバージョンアップにより、将来的に互換性の問題が発生する可能性がある

## Out of Scope

以下は本フィーチャーの範囲外とし、将来の拡張または別フィーチャーとして扱う：

- ユーザー認証とログイン機能（Supabase Authの統合は後続フィーチャー）
- 既存のlocalStorageデータをSupabaseに移行するツールやUI
- リアルタイム機能（Supabase Realtimeによるデータ同期）
- ファイルアップロード機能（Supabase Storageの使用）
- データベースのバックアップとリストア機能
- パフォーマンスモニタリングとログ分析
- 有料プランへのアップグレードと課金管理
- 他のデータベース（PostgreSQL以外）への対応
- オフライン対応（Service Workerやキャッシュ戦略）
- データのエクスポート・インポート機能（CSV, JSON など）
- 監査ログ（データ変更履歴の記録）
- 複数リージョンへのデータ分散
- カスタムSQL関数やトリガーの実装（必要最小限のRLSポリシーのみ）
