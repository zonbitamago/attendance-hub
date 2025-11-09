# サービス契約: Organization Service

**モジュール**: `lib/organization-service.ts`
**目的**: 団体のCRUD操作とクエリを管理
**依存関係**: `lib/storage.ts`, `lib/validation.ts`, `nanoid`

## 関数

### `createOrganization`

自動生成されたIDで新しい団体を作成します。

**シグネチャ**:
```typescript
function createOrganization(input: CreateOrganizationInput): Organization
```

**パラメータ**:
- `input: CreateOrganizationInput`
  - `name: string` (必須, 1-100文字)
  - `description?: string` (オプション, 0-500文字)

**戻り値**: `Organization` - 生成されたIDを持つ新規作成された団体

**動作**:
1. `CreateOrganizationInputSchema`で入力を検証
2. nanoidを使用して一意な10文字のIDを生成
3. `createdAt`タイムスタンプを持つOrganizationオブジェクトを作成
4. localStorageから既存の団体を読み込み
5. リストに新しい団体を追加
6. 更新されたリストをlocalStorageに保存
7. 作成された団体を返す

**エラー**:
- `ZodError`: 入力検証が失敗した場合
- `QuotaExceededError`: localStorageが満杯の場合

**例**:
```typescript
const org = createOrganization({
  name: '吹奏楽団A',
  description: '地域の吹奏楽団です'
});
// org.id = "abc123def4" (auto-generated)
```

---

### `getAllOrganizations`

すべての団体を取得します。

**シグネチャ**:
```typescript
function getAllOrganizations(): Organization[]
```

**パラメータ**: なし

**戻り値**: `Organization[]` - すべての団体の配列、`createdAt`降順でソート（新しい順）

**動作**:
1. localStorageキー`attendance_organizations`から団体を読み込み
2. JSON配列をパース
3. `createdAt`降順でソート
4. 配列を返す

**エラー**:
- 団体が存在しない場合は`[]`を返す

**例**:
```typescript
const orgs = getAllOrganizations();
// [{ id: "xyz...", name: "Org B", ... }, { id: "abc...", name: "Org A", ... }]
```

---

### `getOrganizationById`

IDで単一の団体を取得します。

**シグネチャ**:
```typescript
function getOrganizationById(id: string): Organization | null
```

**パラメータ**:
- `id: string` (必須, 10文字)

**戻り値**:
- `Organization` - 見つかった場合
- `null` - 見つからなかった場合

**動作**:
1. すべての団体を読み込み
2. `id`が一致する団体を検索
3. 団体または`null`を返す

**エラー**: なし（代わりに`null`を返す）

**例**:
```typescript
const org = getOrganizationById('abc123def4');
if (org) {
  console.log(org.name); // "吹奏楽団A"
}
```

---

### `updateOrganization`

既存の団体を更新します。

**シグネチャ**:
```typescript
function updateOrganization(id: string, input: UpdateOrganizationInput): Organization
```

**パラメータ**:
- `id: string` (必須, 10文字)
- `input: UpdateOrganizationInput`
  - `name?: string` (オプション, 1-100文字)
  - `description?: string` (オプション, 0-500文字)

**戻り値**: `Organization` - 更新された団体

**動作**:
1. `UpdateOrganizationInputSchema`で入力を検証
2. すべての団体を読み込み
3. `id`で団体を検索
4. 見つからない場合はエラーをスロー
5. 更新されたフィールドをマージ（`id`と`createdAt`は保持）
6. 更新されたリストを保存
7. 更新された団体を返す

**エラー**:
- `Error('Organization not found')`: IDが存在しない場合
- `ZodError`: 入力検証が失敗した場合

**例**:
```typescript
const updated = updateOrganization('abc123def4', {
  name: '吹奏楽団A改',
  description: '新しい説明'
});
```

---

### `deleteOrganization`

団体とそのすべての関連データを削除します。

**シグネチャ**:
```typescript
function deleteOrganization(id: string): void
```

**パラメータ**:
- `id: string` (必須, 10文字)

**戻り値**: `void`

**動作**:
1. すべての団体を読み込み
2. `id`で団体を検索
3. 見つからない場合はエラーをスロー
4. リストから団体を削除
5. 更新されたリストを保存
6. **カスケード削除**: すべての関連データを削除:
   - storage.tsから`clearOrganizationData(id)`を呼び出し
   - 削除対象: event_dates, groups, members, attendances

**エラー**:
- `Error('Organization not found')`: IDが存在しない場合

**副作用**:
- **破壊的**: 団体のすべてのデータを永久に削除
- アンドゥ/ロールバック不可

**例**:
```typescript
deleteOrganization('abc123def4');
// All data for this organization is now gone
```

---

## 型定義

```typescript
export interface Organization {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface CreateOrganizationInput {
  name: string;
  description?: string;
}

export interface UpdateOrganizationInput {
  name?: string;
  description?: string;
}
```

## バリデーションスキーマ

```typescript
export const CreateOrganizationInputSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const UpdateOrganizationInputSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});
```

## テスト要件

### ユニットテスト (`__tests__/lib/organization-service.test.ts`)

**必須テストケース**:
1. ✅ `createOrganization`が一意なIDを生成
2. ✅ `createOrganization`が入力を検証（nameは必須）
3. ✅ `createOrganization`がlocalStorageに保存
4. ✅ `getAllOrganizations`がデータがない場合に空配列を返す
5. ✅ `getAllOrganizations`がcreatedAt降順でソート
6. ✅ `getOrganizationById`が未知のIDに対してnullを返す
7. ✅ `getOrganizationById`が有効なIDに対して団体を返す
8. ✅ `updateOrganization`が未知のIDに対してエラーをスロー
9. ✅ `updateOrganization`が部分的な更新をマージ
10. ✅ `updateOrganization`がidとcreatedAtを保持
11. ✅ `deleteOrganization`が未知のIDに対してエラーをスロー
12. ✅ `deleteOrganization`がリストから団体を削除
13. ✅ `deleteOrganization`がclearOrganizationDataを呼び出す

**カバレッジ目標**: 90%以上

---

## 使用例

### 団体を作成して使用

```typescript
// Create organization
const org = createOrganization({ name: '吹奏楽団A' });

// Use org.id for creating related data
const group = createGroup(org.id, { name: '金管', order: 1 });
const event = createEventDate(org.id, {
  date: '2025-12-01',
  title: '定期演奏会'
});
```

### 団体一覧を表示（トップページ用）

```typescript
const orgs = getAllOrganizations();

orgs.forEach(org => {
  console.log(`/${org.id}/ - ${org.name}`);
});
```

### 団体名を更新

```typescript
const updated = updateOrganization('abc123def4', {
  name: '吹奏楽団A改'
});
```

### 団体を削除（確認あり）

```typescript
const confirmed = confirm('本当に削除しますか？全てのデータが失われます。');
if (confirmed) {
  deleteOrganization('abc123def4');
  router.push('/'); // トップページにリダイレクト
}
```

---

**契約バージョン**: 1.0
**最終更新**: 2025-11-09
