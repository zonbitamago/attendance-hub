# アクセシビリティチェックリスト

Feature 007 - イベント画面 個人別出欠状況表示機能

## T138: キーボードナビゲーション確認

### ✅ Tab ナビゲーション
- [x] **AttendanceFilters**: すべての入力欄（検索ボックス、フィルタ、ソート）がTabキーで移動可能
- [x] **GroupAttendanceAccordion**: アコーディオンボタンがTabキーで選択可能
- [x] **MemberAttendanceList**: リスト項目は静的コンテンツのため、Tab対象外（適切）

### ✅ Enter/Space キー操作
- [x] **GroupAttendanceAccordion**: EnterキーまたはSpaceキーでアコーディオンの展開/折りたたみが可能
  - 実装箇所: [`group-attendance-accordion.tsx:48-53`](../../../components/event-detail/group-attendance-accordion.tsx#L48-L53)
  - テスト: [`group-attendance-accordion.test.tsx:66-92`](../../../__tests__/components/event-detail/group-attendance-accordion.test.tsx#L66-L92)

**検証方法**:
```bash
# ブラウザで以下を確認
1. イベント詳細ページを開く
2. Tabキーで検索ボックス → フィルタ → ソート → アコーディオンボタンの順に移動できることを確認
3. アコーディオンボタンにフォーカスがある状態でEnterキーまたはSpaceキーを押下
4. アコーディオンが展開/折りたたみされることを確認
```

---

## T139: ARIA属性の確認

### ✅ aria-expanded
- [x] **GroupAttendanceAccordion**: `aria-expanded={isExpanded}` が設定されている
  - 実装箇所: [`group-attendance-accordion.tsx:61`](../../../components/event-detail/group-attendance-accordion.tsx#L61)
  - テスト: [`group-attendance-accordion.test.tsx:52-64`](../../../__tests__/components/event-detail/group-attendance-accordion.test.tsx#L52-L64)

### ✅ aria-controls
- [x] **GroupAttendanceAccordion**: `aria-controls={contentId}` が設定され、対応するコンテンツIDと連携
  - 実装箇所: [`group-attendance-accordion.tsx:46,62,70`](../../../components/event-detail/group-attendance-accordion.tsx#L46,L62,L70)
  - テスト: [`group-attendance-accordion.test.tsx:52-64`](../../../__tests__/components/event-detail/group-attendance-accordion.test.tsx#L52-L64)

### ✅ aria-label（検索ボックス）
- [x] **AttendanceFilters**: 検索ボックスに暗黙的なラベル（`<label htmlFor="search-member">`）が設定
  - 実装箇所: [`attendance-filters.tsx:62-69`](../../../components/event-detail/attendance-filters.tsx#L62-L69)
  - テスト: [`attendance-filters.test.tsx:67-82`](../../../__tests__/components/event-detail/attendance-filters.test.tsx#L67-L82)

**検証方法**:
```bash
# ブラウザの開発者ツールで確認
1. イベント詳細ページを開く
2. アコーディオンボタンを右クリック → 検証
3. HTMLに aria-expanded="false" または aria-expanded="true" が存在することを確認
4. aria-controls属性の値と、コンテンツのid属性が一致することを確認
```

---

## T140: フォーカス表示の確認

### ✅ フォーカスリングの設定
すべてのインタラクティブ要素に統一されたフォーカススタイルが適用されています：

```css
focus:outline-none focus:ring-2 focus:ring-blue-500
```

#### 適用箇所:
- [x] **検索ボックス**: [`attendance-filters.tsx:69`](../../../components/event-detail/attendance-filters.tsx#L69)
- [x] **フィルタドロップダウン**: [`attendance-filters.tsx:83`](../../../components/event-detail/attendance-filters.tsx#L83)
- [x] **ソートドロップダウン**: [`attendance-filters.tsx:98`](../../../components/event-detail/attendance-filters.tsx#L98)
- [x] **アコーディオンボタン**: [`group-attendance-accordion.tsx:63`](../../../components/event-detail/group-attendance-accordion.tsx#L63)

### ✅ コントラスト比
- ブルーのフォーカスリング（`ring-blue-500`）はWCAG AA基準を満たす十分なコントラスト比を提供
- グレー背景（`bg-gray-50`）との組み合わせで視認性が高い

**検証方法**:
```bash
# ブラウザで以下を確認
1. イベント詳細ページを開く
2. Tabキーで各要素にフォーカスを移動
3. 青色のフォーカスリング（2pxの枠線）が明確に表示されることを確認
4. フォーカスリングが要素の周囲を完全に囲んでいることを確認
```

---

## 総括

### ✅ T138: キーボードナビゲーション
- Tab/Enter/Spaceキーによる操作が完全にサポートされている
- すべてのインタラクティブ要素がキーボードでアクセス可能

### ✅ T139: ARIA属性
- aria-expanded, aria-controls が適切に設定されている
- スクリーンリーダーが状態変化を正しく読み上げ可能

### ✅ T140: フォーカス表示
- 統一されたフォーカススタイル（青色リング）が適用されている
- WCAG AA基準のコントラスト比を満たしている

**アクセシビリティ要件: すべて満たしている ✓**
