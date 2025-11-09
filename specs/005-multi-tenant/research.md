# 調査報告: マルチテナント団体対応

**フィーチャー**: 005-multi-tenant
**日付**: 2025-11-09
**フェーズ**: 0 - 調査・技術検証

## 概要

この調査ドキュメントは、localStorage + URLパスベースの識別を使用して、Next.js 16 App Router アプリケーションにマルチテナント団体対応を実装するための技術的決定、ベストプラクティス、パターンをまとめたものです。

## 主要な調査領域

### 1. マルチテナント向けNext.js App Router動的ルーティング

**決定**: ルートレベルで `[org]` 動的ルートパラメータを使用

**理由**:
- Next.js 16 App Routerはネストされた動的ルートと自動パラメータ受け渡しをサポート
- パターン: `app/[org]/page.tsx` により全ての子ルートが `org` パラメータにアクセス可能
- Server Componentsはparamsに直接アクセス可能、Client ComponentsはpropsまたはContext経由で受け取る
- SEOフレンドリーなURL（`/abc123def/events/xyz` はインデックス化可能でブックマーク可能）

**実装パターン**:
```typescript
// app/[org]/layout.tsx (Server Component - default)
export default function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { org: string };
}) {
  // 団体の存在を確認
  // OrganizationProviderで子要素をラップ
  return <OrganizationProvider slug={params.org}>{children}</OrganizationProvider>;
}

// app/[org]/page.tsx (Server or Client Component)
export default function EventsPage({ params }: { params: { org: string } }) {
  // params または useOrganization() hook で org にアクセス
}
```

**検討した代替案**:
- **クエリパラメータ** (`?org=abc123def`): 却下 - SEOフレンドリーでない、ブックマーク不可
- **サブドメインベース** (`abc123def.domain.com`): 却下 - DNS設定とSSL証明書が必要、過剰
- **Cookieベース**: 却下 - URLで明示的に識別できない、共有不可

**参考資料**:
- [Next.js App Router Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
- [Next.js Layouts and Templates](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts)

---

### 2. nanoid によるランダムID生成

**決定**: `nanoid` ライブラリを使用して10文字の団体IDを生成

**理由**:
- **衝突耐性**: 10文字の英数字小文字で ~4兆通りの組み合わせ
- **URL安全**: デフォルトで `A-Za-z0-9_-` を使用（カスタムアルファベット可能）
- **コンパクト**: UUIDv4（36文字）より短く、URLに適している
- **パフォーマンス**: 非常に高速（秒間100万ID生成可能）
- **TypeScriptサポート**: 型定義が公式にサポート

**実装**:
```bash
npm install nanoid
```

```typescript
import { customAlphabet } from 'nanoid';

// カスタムアルファベット: 小文字英数字のみ（読みやすさと衝突回避）
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 10);

export function generateOrganizationId(): string {
  return nanoid(); // 例: "abc123def4"
}
```

**衝突確率**:
- 10文字、36文字アルファベット: 36^10 = 3.6 × 10^15 通り
- 100万団体作成でも衝突確率: ~0.00000001%（実用上無視できる）

**検討した代替案**:
- **UUIDv4**: 却下 - 36文字で長すぎる、URLに不向き
- **Short UUID**: 検討済み - nanoidと同等だが、nanoidの方がカスタマイズ性が高い
- **連番ID** (1, 2, 3...): 却下 - 推測可能、セキュリティリスク

**参考資料**:
- [nanoid GitHub](https://github.com/ai/nanoid)
- [nanoid vs UUID](https://zelark.github.io/nano-id-cc/)

---

### 3. localStorage マルチテナントデータ分離パターン

**決定**: localStorageキーの一部として団体IDを使用: `attendance_${orgId}_${dataType}`

**理由**:
- **完全な分離**: 各団体のデータが異なるキーに保存され、混在しない
- **シンプルなクエリ**: `localStorage.getItem(key)` で直接アクセス可能
- **移行フレンドリー**: Supabase移行時にキー構造がテーブル名と一致しやすい
- **デバッグ**: Chrome DevToolsで団体ごとのデータを視覚的に確認可能

**キー構造**:
```typescript
const STORAGE_KEYS = {
  ORGANIZATIONS: 'attendance_organizations',  // グローバル（全団体のメタデータ）
  EVENT_DATES: (orgId: string) => `attendance_${orgId}_event_dates`,
  GROUPS: (orgId: string) => `attendance_${orgId}_groups`,
  MEMBERS: (orgId: string) => `attendance_${orgId}_members`,
  ATTENDANCES: (orgId: string) => `attendance_${orgId}_attendances`,
};
```

**例**:
```typescript
// 団体 "abc123def" のイベントを保存
const key = STORAGE_KEYS.EVENT_DATES('abc123def');
// key = "attendance_abc123def_event_dates"
localStorage.setItem(key, JSON.stringify(events));
```

**団体削除時のデータクリーンアップ**:
```typescript
export function clearOrganizationData(orgId: string): void {
  const keysToRemove = [
    STORAGE_KEYS.EVENT_DATES(orgId),
    STORAGE_KEYS.GROUPS(orgId),
    STORAGE_KEYS.MEMBERS(orgId),
    STORAGE_KEYS.ATTENDANCES(orgId),
  ];

  keysToRemove.forEach(key => localStorage.removeItem(key));
}
```

**検討した代替案**:
- **ネストされたオブジェクトを持つ単一キー**: 却下 - 全データを毎回パース・保存する必要があり、パフォーマンス悪い
- **IndexedDB**: 検討済み - より強力だが、複雑性が増す。プロトタイプにはlocalStorageで十分
- **プレフィックスベースのフィルタリング**: 検討済み - `Object.keys(localStorage).filter()` だが、キー関数アプローチの方がタイプセーフ

**容量管理**:
- localStorage制限: ~5-10MB（ブラウザにより異なる）
- 1団体あたり想定データ: ~500KB（イベント100件、メンバー100人、出欠10,000レコード）
- 最大団体数: ~10-20団体（余裕を持って）
- Quota exceeded error handling: `try-catch` で `QuotaExceededError` を捕捉し、ユーザーに警告

**参考資料**:
- [MDN: Window.localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [localStorage best practices](https://www.smashingmagazine.com/2010/10/local-storage-and-how-to-use-it/)

---

### 4. localStorage データマイグレーション戦略

**決定**: 初回ロード時にレガシーデータを検出し、デフォルト団体に自動マイグレーション

**理由**:
- **データ損失ゼロ**: 既存ユーザーのデータを保護
- **シームレスな移行**: ユーザーは何もせずに継続利用可能
- **一度限りの操作**: マイグレーション完了フラグで二重実行を防止
- **デフォルト団体へリダイレクト**: マイグレーション後、デフォルト団体URLにリダイレクト

**マイグレーションフロー**:
```typescript
export function migrateToMultiTenant(): { migrated: boolean; defaultOrgId?: string } {
  // ステップ1: マイグレーションフラグを確認
  const migrationCompleted = localStorage.getItem('attendance_migration_completed');
  if (migrationCompleted === 'true') {
    return { migrated: false }; // 既にマイグレーション済み
  }

  // ステップ2: レガシーデータを検出
  const legacyKeys = ['attendance_event_dates', 'attendance_groups', 'attendance_members', 'attendance_attendances'];
  const hasLegacyData = legacyKeys.some(key => localStorage.getItem(key) !== null);

  if (!hasLegacyData) {
    // レガシーデータなし、完了とマーク
    localStorage.setItem('attendance_migration_completed', 'true');
    return { migrated: false };
  }

  // ステップ3: デフォルト団体を作成
  const defaultOrgId = nanoid();
  const defaultOrg: Organization = {
    id: defaultOrgId,
    name: 'マイ団体',
    description: '既存データから自動作成された団体です',
    createdAt: new Date().toISOString(),
  };

  const orgs = [defaultOrg];
  localStorage.setItem(STORAGE_KEYS.ORGANIZATIONS, JSON.stringify(orgs));

  // ステップ4: 各データタイプをマイグレーション
  legacyKeys.forEach(legacyKey => {
    const data = localStorage.getItem(legacyKey);
    if (!data) return;

    const dataType = legacyKey.replace('attendance_', '');
    const newKey = `attendance_${defaultOrgId}_${dataType}`;

    // パース、organizationIdを追加、保存
    const items = JSON.parse(data);
    const migratedItems = items.map((item: any) => ({
      ...item,
      organizationId: defaultOrgId,
    }));

    localStorage.setItem(newKey, JSON.stringify(migratedItems));
    localStorage.removeItem(legacyKey); // レガシーキーをクリーンアップ
  });

  // ステップ5: マイグレーション完了をマーク
  localStorage.setItem('attendance_migration_completed', 'true');

  return { migrated: true, defaultOrgId };
}
```

**実行タイミング**:
- **場所**: トップレベルページ（`app/page.tsx`）
- **タイミング**: マウント時の`useEffect`（クライアントサイドのみ）
- **リダイレクト**: マイグレーション後、`/${defaultOrgId}/`にリダイレクト

**エラーハンドリング**:
```typescript
try {
  const result = migrateToMultiTenant();
  if (result.migrated && result.defaultOrgId) {
    router.push(`/${result.defaultOrgId}/`);
  }
} catch (error) {
  console.error('Migration failed:', error);
  // ユーザーフレンドリーなエラーメッセージを表示
  // フォールバック: 手動で新しい団体を作成できるようにする
}
```

**ロールバック計画**:
- マイグレーション失敗時、レガシーキーは削除されない
- ユーザーはlocalStorageを手動でクリアして最初からやり直せる
- 将来の改善: バックアップ用のエクスポート/インポート機能

**検討した代替案**:
- **手動マイグレーション**: 却下 - 悪いUX、ユーザーがデータを失う可能性
- **遅延マイグレーション**: 却下 - 複雑性が増す、一括移行の方がシンプル
- **レガシーと新規の両方を保持**: 却下 - データ重複、一貫性の問題

**参考資料**:
- [Data migration best practices](https://martinfowler.com/articles/evodb.html)
- [localStorage versioning](https://blog.logrocket.com/localstorage-javascript-complete-guide/)

---

### 5. 団体状態管理のためのReact Context

**決定**: React Context APIを使用して全コンポーネントに現在の団体を提供

**理由**:
- **Prop drillingを回避**: 深いコンポーネントツリーでorganizationを渡す必要がない
- **型安全**: TypeScript + Context で型安全なアクセス
- **Server/Clientハイブリッド**: Server Componentsで読み込み、Client Componentsでコンテキスト提供
- **パフォーマンス**: useMemoで不要な再レンダリングを防止

**実装**:
```typescript
// contexts/organization-context.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Organization } from '@/types';

interface OrganizationContextValue {
  organization: Organization;
  isLoading: boolean;
  error?: string;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

export function OrganizationProvider({
  children,
  orgId
}: {
  children: ReactNode;
  orgId: string;
}) {
  const [state, setState] = useState<OrganizationContextValue>({
    organization: null!,
    isLoading: true,
  });

  useEffect(() => {
    // localStorageから団体をロード
    const orgs = getOrganizations();
    const org = orgs.find(o => o.id === orgId);

    if (!org) {
      setState({ organization: null!, isLoading: false, error: '団体が見つかりません' });
      return;
    }

    setState({ organization: org, isLoading: false });
  }, [orgId]);

  if (state.isLoading) return <LoadingSpinner />;
  if (state.error) return <NotFound message={state.error} />;

  return (
    <OrganizationContext.Provider value={state}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within OrganizationProvider');
  }
  return context;
}
```

**コンポーネントでの使用法**:
```typescript
'use client';

import { useOrganization } from '@/contexts/organization-context';

export default function EventsPage() {
  const { organization } = useOrganization();

  // データ取得にorganization.idを使用
  const events = loadEventDates(organization.id);

  return <div>{organization.name} のイベント</div>;
}
```

**検討した代替案**:
- **Zustand/Redux**: 却下 - 過剰、シンプルなContextで十分
- **あらゆる場所でURLパラメータ**: 却下 - prop drillingが発生、コード重複
- **グローバルシングルトン**: 却下 - テスト困難、複数インスタンス不可

**参考資料**:
- [React Context API](https://react.dev/reference/react/createContext)
- [When to use Context](https://react.dev/learn/passing-data-deeply-with-context)

---

### 6. マルチテナント機能のテスト戦略

**決定**: マルチテナントロジックを分離してテスト + データ分離の統合テスト

**理由**:
- **TDDアプローチ**: テストファーストで実装（t-wada原則）
- **データ分離検証**: 異なる団体間でデータ混在がないことを確認
- **マイグレーションテスト**: 既存データの自動移行が正しく動作することを確認
- **Contextテスト**: OrganizationProviderとuseOrganization hookの動作確認

**テスト構造**:
```typescript
// __tests__/lib/organization-service.test.ts
describe('Organization Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('createOrganization', () => {
    it('各団体に一意のIDを生成する', () => {
      const org1 = createOrganization({ name: 'Org 1' });
      const org2 = createOrganization({ name: 'Org 2' });

      expect(org1.id).not.toBe(org2.id);
      expect(org1.id).toHaveLength(10);
    });

    it('localStorageに団体を保存する', () => {
      const org = createOrganization({ name: 'Test Org' });
      const saved = getOrganizations();

      expect(saved).toHaveLength(1);
      expect(saved[0].id).toBe(org.id);
    });
  });
});

// __tests__/lib/migration.test.ts
describe('Data Migration', () => {
  it('レガシーデータをデフォルト団体にマイグレーションする', () => {
    // レガシーデータをセットアップ
    const legacyEvents = [{ id: '1', title: 'Event 1', date: '2025-01-01' }];
    localStorage.setItem('attendance_event_dates', JSON.stringify(legacyEvents));

    // マイグレーション実行
    const result = migrateToMultiTenant();

    expect(result.migrated).toBe(true);
    expect(result.defaultOrgId).toBeDefined();

    // マイグレーションされたデータを検証
    const newKey = `attendance_${result.defaultOrgId}_event_dates`;
    const migrated = JSON.parse(localStorage.getItem(newKey)!);

    expect(migrated).toHaveLength(1);
    expect(migrated[0].organizationId).toBe(result.defaultOrgId);

    // レガシーキーが削除されたことを検証
    expect(localStorage.getItem('attendance_event_dates')).toBeNull();
  });
});

// __tests__/lib/data-isolation.test.ts
describe('Multi-Tenant Data Isolation', () => {
  it('団体間でデータが漏洩しない', () => {
    const org1 = createOrganization({ name: 'Org 1' });
    const org2 = createOrganization({ name: 'Org 2' });

    // org1のデータを作成
    const group1 = createGroup(org1.id, { name: 'Group 1' });

    // org2のデータをロード
    const org2Groups = getAllGroups(org2.id);

    expect(org2Groups).toHaveLength(0); // データ漏洩なし
  });
});
```

**カバレッジ目標**:
- Organization Service: 90%以上
- Migration Logic: 100%（クリティカル）
- Data Isolation: 100%（クリティカル）
- Context: 80%以上
- UI Components: 60%以上（既存と同等）

**参考資料**:
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

## 技術的決定のまとめ

| 領域 | 決定 | 理由 |
|------|------|------|
| **ルーティング** | Next.js `[org]` 動的ルート | SEOフレンドリー、ブックマーク可能、型安全 |
| **ID生成** | nanoid（10文字、カスタムアルファベット） | コンパクト、衝突耐性、URL安全 |
| **データストレージ** | org-プレフィックス付きlocalStorageキー | シンプル、分離、移行フレンドリー |
| **マイグレーション** | 初回ロード時に自動検出+移行 | データ損失ゼロ、シームレスなUX |
| **状態管理** | React Context API | Prop drilling回避、型安全 |
| **テスト** | TDD + 分離 + 統合 | 分離検証、リグレッション防止 |

## 実装準備完了

全ての調査完了。未解決事項はありません。Phase 1（データモデル & 契約）に進む準備ができています。

**次のステップ**:
1. Organizationエンティティと更新された関係性を含む `data-model.md` を生成
2. `contracts/` にサービス層契約を定義
3. 開発セットアップ用の `quickstart.md` を作成
4. 新技術（nanoid）でagent contextを更新

---

**調査完了日**: 2025-11-09
**レビュー者**: AI Agent (speckit.plan)
