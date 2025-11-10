# Research: イベント画面 個人別出欠状況表示機能

**フィーチャー**: 007-event-member-attendance
**作成日**: 2025-11-10
**ステータス**: Phase 0 完了

## 調査項目と決定事項

### 1. アコーディオンUIの実装パターン

**調査内容**: React + Tailwind CSSでアクセシブルなアコーディオンUIを実装する方法

**決定**: **ネイティブReact状態管理 + Tailwind CSS**

**実装方針**:
```typescript
// useState で展開状態を管理
const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

// トグル関数
const toggleGroup = (groupId: string) => {
  setExpandedGroups(prev => {
    const next = new Set(prev);
    if (next.has(groupId)) {
      next.delete(groupId);
    } else {
      next.add(groupId);
    }
    return next;
  });
};

// Tailwind CSSのtransitionでアニメーション
<div className="transition-all duration-200 ease-in-out overflow-hidden">
```

**根拠**:
- 外部ライブラリ不要（Headless UI、Radix UIなど）
- プロジェクトの既存パターンと一貫性がある
- 軽量でパフォーマンスが良い
- カスタマイズが容易

**代替案**:
- ❌ **Headless UI Disclosure**: 追加の依存関係、オーバースペック
- ❌ **Radix UI Accordion**: 追加の依存関係、学習コスト
- ❌ **details/summary要素**: スタイリング制約、ブラウザ互換性

---

### 2. アクセシビリティ対応のアコーディオン

**調査内容**: WCAG 2.1 AA準拠のアコーディオン実装

**決定**: **WAI-ARIA Authoring Practices Guide準拠**

**実装要件**:

#### ARIA属性
```tsx
<button
  aria-expanded={isExpanded}
  aria-controls={`group-members-${groupId}`}
  onClick={handleToggle}
  onKeyDown={handleKeyDown}
>
  {groupName}
</button>

<div
  id={`group-members-${groupId}`}
  role="region"
  aria-labelledby={`group-header-${groupId}`}
  hidden={!isExpanded}
>
  {/* メンバーリスト */}
</div>
```

#### キーボード操作
- **Enter/Space**: アコーディオンの展開/折りたたみ
- **Tab**: 次のアコーディオンへフォーカス移動
- **Shift+Tab**: 前のアコーディオンへフォーカス移動

#### フォーカス表示
```css
/* Tailwind CSS */
focus:outline-none focus:ring-2 focus:ring-blue-500
```

**根拠**:
- WAI-ARIAの公式ガイドライン準拠
- スクリーンリーダー対応
- キーボードのみでの操作可能
- constitution原則VIに準拠

**参考資料**:
- [WAI-ARIA Authoring Practices - Accordion Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/)

---

### 3. 大量データのパフォーマンス最適化

**調査内容**: 100人以上のメンバーデータを快適に表示する方法

**決定**: **React.useMemo + 段階的レンダリング**

**実装戦略**:

#### 1. useMemoでフィルタ/ソート結果をメモ化
```typescript
const filteredAndSortedMembers = useMemo(() => {
  let result = members;

  // フィルタ適用
  if (filterStatus !== 'all') {
    result = result.filter(m => m.status === filterStatus);
  }

  // 検索適用
  if (searchQuery) {
    result = result.filter(m =>
      m.memberName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // ソート適用
  if (sortBy === 'name') {
    result = result.sort((a, b) =>
      a.memberName.localeCompare(b.memberName, 'ja')
    );
  } else {
    // ステータス順（◯→△→✗→-）
    const statusOrder = { '◯': 0, '△': 1, '✗': 2, null: 3 };
    result = result.sort((a, b) =>
      (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3)
    );
  }

  return result;
}, [members, filterStatus, searchQuery, sortBy]);
```

#### 2. 展開済みグループのみレンダリング
- 折りたたまれたグループのメンバーリストはレンダリングしない
- `hidden`属性を使用してDOMには存在するが非表示

#### 3. 仮想スクロールは**不要**
- 100人程度ではブラウザのネイティブスクロールで十分
- 複雑性を避ける（YAGNI原則）
- 将来的にパフォーマンス問題が発生したら検討

**根拠**:
- useMemoで不要な再計算を防ぐ
- 最小限の複雑性で最大の効果
- constitution原則IX（パフォーマンス基準）に準拠

**代替案**:
- ❌ **react-window/react-virtualized**: 複雑性が高い、100人程度では不要
- ❌ **Intersection Observer API**: 実装コストが高い、メリットが少ない

**パフォーマンス目標**:
- 100人のメンバー: 1秒以内でレンダリング
- フィルタ/ソート: 200ms以内
- アコーディオン展開: 200ms以内のアニメーション

---

### 4. フィルタリング・ソート・検索のベストプラクティス

**調査内容**: ユーザーフレンドリーなフィルタ/ソート/検索UIの設計

**決定**: **すべて同一階層で提供、リアルタイム適用**

**UI配置**:
```
[検索ボックス: メンバー名で検索]  [フィルタ: すべて ▼]  [ソート: 名前順 ⇅]

▼ グループA (◯3 △1 ✗2)
  ◯ 山田太郎
  ◯ 鈴木花子
  ...
```

**実装詳細**:

#### 検索
- **リアルタイム検索**: onChange で即座に結果更新
- **大文字小文字区別なし**: toLowerCase()で正規化
- **部分一致**: includes() で検索
- **全グループ横断**: すべてのグループから該当メンバーを抽出

#### フィルタ
- **ドロップダウン形式**: select要素
- **選択肢**: すべて / 参加のみ / 未定のみ / 欠席のみ / 未登録のみ
- **グループごとに適用**: 各グループ内でフィルタリング

#### ソート
- **トグルボタン**: クリックで切り替え
- **2つのモード**: 名前順（五十音順/アルファベット順） / ステータス順（◯→△→✗→-）
- **ビジュアルフィードバック**: アイコンで現在のソート方法を表示

**組み合わせ動作**:
1. 検索 → フィルタ → ソート の順で適用
2. 検索でマッチしたメンバーに対してフィルタを適用
3. フィルタ後の結果をソート

**根拠**:
- ユーザーが期待する動作と一致
- 実装がシンプル
- パフォーマンスへの影響が最小限

---

### 5. 日本語文字列のソート

**調査内容**: 日本語の名前を正しくソートする方法

**決定**: **String.prototype.localeCompare() with 'ja' locale**

**実装**:
```typescript
members.sort((a, b) =>
  a.memberName.localeCompare(b.memberName, 'ja')
);
```

**根拠**:
- ネイティブのJavaScript APIで日本語の五十音順に対応
- 追加のライブラリ不要
- パフォーマンスも十分

**代替案**:
- ❌ **カスタムソート関数**: 複雑、メンテナンスコスト高
- ❌ **Intl.Collator**: 高度だがlocaleCompareで十分

---

### 6. エラー処理とエッジケース

**調査内容**: ロバストなUI実装のためのエラー処理

**決定**: **明示的なエラーメッセージ + フォールバックUI**

**実装方針**:

#### 空の状態メッセージ
```typescript
// グループにメンバーが0人
{members.length === 0 && (
  <p className="text-gray-500 text-sm py-4">
    メンバーがいません
  </p>
)}

// 検索結果が0件
{filteredMembers.length === 0 && searchQuery && (
  <p className="text-gray-500 text-sm py-4">
    「{searchQuery}」に該当するメンバーが見つかりません
  </p>
)}

// フィルタ適用で0件
{filteredMembers.length === 0 && filterStatus !== 'all' && (
  <p className="text-gray-500 text-sm py-4">
    条件に該当するメンバーがいません
  </p>
)}
```

#### 未登録メンバーの表示
```typescript
{member.hasRegistered ? member.status : '-'}
<span className="text-gray-400 text-xs ml-2">（未登録）</span>
```

**根拠**:
- ユーザーが状況を理解しやすい
- constitution原則VII（日本語対応）に準拠
- エラーではなく正常な状態として扱う

---

## まとめ

### 技術選定の理由

| 項目 | 選定技術 | 理由 |
|------|----------|------|
| アコーディオン | React useState + Tailwind CSS | シンプル、外部依存なし、既存パターンと一貫性 |
| アクセシビリティ | WAI-ARIA準拠 | 標準、スクリーンリーダー対応、キーボード操作 |
| パフォーマンス | React.useMemo | 不要な再計算を防ぐ、100人程度では十分 |
| フィルタ/ソート | クライアントサイドロジック | リアルタイム、シンプル、サーバー不要 |
| 日本語ソート | localeCompare('ja') | ネイティブAPI、追加ライブラリ不要 |

### 未解決の技術的課題

**なし**: すべての技術的不明点は調査により解決済み。Phase 1（設計）に進む準備が整った。

### 次のステップ

Phase 1で以下を作成:
1. **data-model.md**: 型定義とデータ構造
2. **contracts/**: サービス関数のインターフェース
3. **quickstart.md**: 開発環境セットアップ手順
