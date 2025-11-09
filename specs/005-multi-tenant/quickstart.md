# クイックスタート: マルチテナント団体対応

**フィーチャー**: 005-multi-tenant
**ブランチ**: `005-multi-tenant`
**日付**: 2025-11-09

## 前提条件

- Node.js 20.x以降
- npm または yarn
- Git
- モダンブラウザ（Chrome, Firefox, Safari最新版）

## セットアップ手順

### 1. フィーチャーブランチをチェックアウト

```bash
# 正しいブランチにいることを確認
git checkout 005-multi-tenant

# 最新の変更を取得
git pull origin 005-multi-tenant
```

### 2. 依存関係をインストール

```bash
# nanoidをインストール（新しい依存関係）
npm install nanoid

# すべての依存関係をインストール
npm install
```

### 3. TypeScript設定を確認

`tsconfig.json`がstrict modeを有効にしていることを確認:

```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

### 4. テストを実行（TDDアプローチ）

実装開始前に、既存のテストを実行してベースラインを確立:

```bash
# すべてのテストを実行
npm test

# 期待値: 84テストがパス（既存テスト）
```

### 5. 開発サーバーを起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

---

## 実装フロー（TDD）

各コンポーネントでTest-Driven Developmentサイクルに従います:

### フェーズ1: データモデル & ストレージ層

**順序**: ボトムアップ（データ層 → サービス層 → UI層）

#### 1.1 型を更新

**ファイル**: `types/index.ts`

**手順**:
1. `Organization`インターフェースを追加
2. 既存のインターフェースに`organizationId`フィールドを追加
3. Organizationの入力/更新型を追加

**検証**:
```bash
npx tsc --noEmit
# エラーがないはず
```

#### 1.2 バリデーションを更新

**ファイル**: `lib/validation.ts`

**TDD手順**:
1. ✅ **Red**: `OrganizationSchema`のテストを書く（テスト失敗）
2. ✅ **Green**: `OrganizationSchema`を実装
3. ✅ **Refactor**: スキーマ定義をクリーンアップ

**テストファイル**: `__tests__/lib/validation.test.ts`

**実行**:
```bash
npm test -- validation.test.ts
```

#### 1.3 ストレージ層を更新

**ファイル**: `lib/storage.ts`

**TDD手順**:
1. ✅ **Red**: `loadOrganizations`, `saveOrganizations`のテストを書く
2. ✅ **Green**: 団体ストレージ関数を実装
3. ✅ **Red**: 更新された`loadEventDates(orgId)`などのテストを書く
4. ✅ **Green**: `orgId`パラメータを受け取るよう関数を更新
5. ✅ **Red**: `clearOrganizationData`のテストを書く
6. ✅ **Green**: カスケード削除を実装

**テストファイル**: `__tests__/lib/storage.test.ts`

**実行**:
```bash
npm test -- storage.test.ts
```

#### 1.4 Organization Serviceを作成

**ファイル**: `lib/organization-service.ts`

**TDD手順**:
1. ✅ **Red**: `createOrganization`のテストを書く（ID生成、検証）
2. ✅ **Green**: nanoidで実装
3. ✅ **Red**: CRUD操作のテストを書く
4. ✅ **Green**: すべての関数を実装
5. ✅ **Refactor**: 共通パターンを抽出

**テストファイル**: `__tests__/lib/organization-service.test.ts`

**実行**:
```bash
npm test -- organization-service.test.ts
```

#### 1.5 Migration Moduleを作成

**ファイル**: `lib/migration.ts`

**TDD手順**:
1. ✅ **Red**: レガシーデータ検出のテストを書く
2. ✅ **Green**: 検出ロジックを実装
3. ✅ **Red**: デフォルト団体作成のテストを書く
4. ✅ **Green**: デフォルト団体作成を実装
5. ✅ **Red**: 各データ型のマイグレーションテストを書く
6. ✅ **Green**: すべての型のマイグレーションを実装
7. ✅ **Red**: マイグレーションフラグ設定のテストを書く
8. ✅ **Green**: フラグロジックを実装
9. ✅ **Refactor**: 繰り返しコードを統合

**テストファイル**: `__tests__/lib/migration.test.ts`

**実行**:
```bash
npm test -- migration.test.ts
```

**期待値**: マイグレーションロジックで100%カバレッジ（重要）

---

### フェーズ2: サービス層の更新

既存のサービス層を`organizationId`に対応させます。

#### 2.1 Group Serviceを更新

**ファイル**: `lib/group-service.ts`

**TDD手順**:
1. ✅ **Red**: 既存のテストを`orgId`を渡すよう更新
2. ✅ **Green**: すべての関数に`orgId`パラメータを追加
3. ✅ **Red**: 団体分離のテストを書く
4. ✅ **Green**: orgIdによるデータフィルタリングを検証
5. ✅ **Refactor**: 関数シグネチャをクリーンアップ

**テストファイル**: `__tests__/lib/group-service.test.ts`

**実行**:
```bash
npm test -- group-service.test.ts
```

#### 2.2 Event, Member, Attendance Servicesを更新

Group Serviceと同じTDDパターンに従います:
- `lib/event-service.ts` + `__tests__/lib/event-service.test.ts`
- `lib/member-service.ts` + `__tests__/lib/member-service.test.ts`
- `lib/attendance-service.ts` + `__tests__/lib/attendance-service.test.ts`

---

### フェーズ3: Context & App Router

#### 3.1 Organization Contextを作成

**ファイル**: `contexts/organization-context.tsx`

**TDD手順**:
1. ✅ **Red**: `useOrganization`フックのテストを書く
2. ✅ **Green**: OrganizationProviderを実装
3. ✅ **Red**: 団体が見つからない場合のテストを書く
4. ✅ **Green**: エラーハンドリングを実装
5. ✅ **Refactor**: useMemoで最適化

**テストファイル**: `__tests__/contexts/organization-context.test.tsx`

**実行**:
```bash
npm test -- organization-context.test.tsx
```

#### 3.2 [org] Layoutを作成

**ファイル**: `app/[org]/layout.tsx`

**手順**:
1. 動的ルートフォルダを作成: `app/[org]/`
2. OrganizationProviderを使用したレイアウトを実装
3. ローディングとエラー状態を追加

**検証**:
```bash
# http://localhost:3000/abc123def/ を訪問
# 404または「団体が見つかりません」が表示されるはず
```

#### 3.3 既存ページを移動

**手順**:
1. `app/page.tsx` → `app/[org]/page.tsx` に移動
2. `app/admin/` → `app/[org]/admin/` に移動
3. `app/events/` → `app/[org]/events/` に移動
4. `app/my-register/` → `app/[org]/my-register/` に移動
5. すべての内部リンクを`{org}`パラメータを含むよう更新

**リンク更新の例**:
```typescript
// 変更前
<Link href="/admin/groups">グループ管理</Link>

// 変更後
const { organization } = useOrganization();
<Link href={`/${organization.id}/admin/groups`}>グループ管理</Link>
```

#### 3.4 新しいトップページを作成

**ファイル**: `app/page.tsx`

**実装**:
1. 説明付きのランディングページ
2. 団体作成フォーム
3. マウント時にマイグレーションをチェック（`migrateToMultiTenant()`を呼び出し）
4. マイグレーション済みの場合はデフォルト団体にリダイレクト

**テストファイル**: `__tests__/app/page.test.tsx`

---

### フェーズ4: UIコンポーネントの更新

すべてのコンポーネントを`organizationId`を使用するよう更新します。

#### 4.1 一括登録コンポーネントを更新

**ファイル**:
- `components/bulk-register/member-selector.tsx`
- `components/bulk-register/event-list.tsx`

**変更**:
- `organizationId` propを追加
- サービス層関数に渡す

**テストファイル**:
- `__tests__/components/bulk-register/member-selector.test.tsx`
- `__tests__/components/bulk-register/event-list.test.tsx`

#### 4.2 団体設定ページを作成

**ファイル**: `app/[org]/admin/organizations/page.tsx`

**TDD手順**:
1. ✅ **Red**: 団体情報表示のテストを書く
2. ✅ **Green**: 表示を実装
3. ✅ **Red**: 団体名更新のテストを書く
4. ✅ **Green**: 更新フォームを実装
5. ✅ **Red**: 確認付き削除のテストを書く
6. ✅ **Green**: 削除ボタンを実装
7. ✅ **Refactor**: フォームコンポーネントを抽出

**テストファイル**: `__tests__/app/admin/organizations/page.test.tsx`

---

## テスト戦略

### カテゴリ別にテストを実行

```bash
# ユニットテスト（サービス層）
npm test -- lib/

# 統合テスト（コンポーネント）
npm test -- components/

# ページテスト
npm test -- app/

# マイグレーションテスト（重要）
npm test -- migration.test.ts --coverage
```

### カバレッジ目標

| 層 | カバレッジ目標 |
|-------|---------------|
| Migration | 100% |
| Organization Service | 90%以上 |
| Storage | 90%以上 |
| Other Services | 80%以上 |
| Components | 60%以上 |
| Overall | 70%以上 |

### すべてのテストを実行

```bash
# すべてのテスト
npm test

# カバレッジ付き
npm test -- --coverage

# ウォッチモード（開発中）
npm test -- --watch
```

---

## 手動テストチェックリスト

### シナリオ1: 新規ユーザー（レガシーデータなし）

1. localStorageをクリア: `localStorage.clear()`
2. `/`を訪問
3. ✅ 「団体を作成」ボタンのあるランディングページが表示される
4. ✅ 団体「Test Org」を作成
5. ✅ `/{org-id}/`にリダイレクト
6. ✅ イベント一覧が表示される（空）
7. ✅ グループ、メンバー、イベントを作成
8. ✅ リロード時にデータが永続化されることを確認

### シナリオ2: 既存ユーザー（レガシーデータあり）

1. レガシーデータをセットアップ:
   ```javascript
   localStorage.setItem('attendance_event_dates', JSON.stringify([
     { id: '1', date: '2025-01-01', title: 'Event 1', createdAt: new Date().toISOString() }
   ]));
   ```
2. `/`を訪問
3. ✅ デフォルト団体へ自動マイグレーション
4. ✅ `/{default-org-id}/`にリダイレクト
5. ✅ 既存のイベント「Event 1」が表示される
6. ✅ レガシーキーが削除されたことを確認

### シナリオ3: 複数団体

1. 団体A「Band A」を作成
2. 団体Aにイベント「Concert A」を追加
3. `/`を訪問 → 団体B「Soccer B」を作成
4. 団体Bにイベント「Game B」を追加
5. ✅ `/{org-a-id}/`を訪問: 「Concert A」のみ表示
6. ✅ `/{org-b-id}/`を訪問: 「Game B」のみ表示
7. ✅ 団体間でデータ漏洩なし

### シナリオ4: 団体削除

1. データを持つ団体を作成
2. `/{org-id}/admin/organizations`を訪問
3. 「団体を削除」をクリック
4. ✅ 確認ダイアログが表示される
5. ✅ 確認後、`/`にリダイレクト
6. ✅ 団体のすべてのデータがlocalStorageから削除される
7. ✅ `/{org-id}/`を訪問: 404エラー

---

## 開発のヒント

### localStorageをデバッグ

```javascript
// すべてのキーを表示
Object.keys(localStorage).filter(k => k.startsWith('attendance_'));

// 団体を表示
JSON.parse(localStorage.getItem('attendance_organizations') || '[]');

// 団体固有のデータを表示
const orgId = 'abc123def';
JSON.parse(localStorage.getItem(`attendance_${orgId}_event_dates`) || '[]');
```

### すべてをリセット

```javascript
// attendance-hubのすべてのデータをクリア
Object.keys(localStorage)
  .filter(k => k.startsWith('attendance_'))
  .forEach(k => localStorage.removeItem(k));
```

### マイグレーションをテスト

```javascript
// レガシーデータをセットアップ
localStorage.setItem('attendance_migration_completed', null);
localStorage.setItem('attendance_event_dates', JSON.stringify([...]));

// ページをリロード → マイグレーションがトリガーされるはず
```

---

## よくある問題

### 問題: organizationId追加後にTypeScriptエラー

**解決策**: 型チェックを実行してすべてのエラーを修正
```bash
npx tsc --noEmit
```

### 問題: サービス層の変更後にテストが失敗

**解決策**: テストモックを`organizationId`を含むよう更新
```typescript
// 変更前
createGroup({ name: 'Group 1' });

// 変更後
createGroup('org-id', { name: 'Group 1' });
```

### 問題: マイグレーションがトリガーされない

**解決策**: マイグレーションフラグをチェック
```javascript
localStorage.removeItem('attendance_migration_completed');
```

### 問題: localStorage QuotaExceededError

**解決策**: 古いデータをクリアまたはテストデータサイズを削減
```javascript
localStorage.clear();
```

---

## 次のステップ

実装後:

1. ✅ 完全なテストスイートを実行: `npm test`
2. ✅ 型チェックを実行: `npx tsc --noEmit`
3. ✅ リンターを実行: `npm run lint`
4. ✅ ビルドを実行: `npm run build`
5. ✅ 手動テスト（上記のすべてのシナリオ）
6. ✅ コードレビュー用のPRを作成
7. ✅ 新機能でSPECIFICATION.mdを更新

---

## 参考ドキュメント

- [仕様書](./spec.md) - 機能要件
- [実装計画](./plan.md) - 技術的アプローチ
- [データモデル](./data-model.md) - エンティティ定義
- [調査](./research.md) - 技術的決定
- [契約](./contracts/) - サービス層契約

---

**最終更新**: 2025-11-09
**実装準備完了**: ✅ Yes
