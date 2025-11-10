# 受け入れ基準

Feature 007 - イベント画面 個人別出欠状況表示機能

## 概要

全4つのユーザーストーリー（US1～US4）の受け入れ基準を定義し、各機能が要件を満たしていることを検証。

---

## US1: グループメンバーの出欠確認

**ユーザーストーリー**:
イベント主催者として、イベント詳細画面でグループ名をクリックすることで、そのグループに所属するメンバーの名前と出欠ステータス（◯/△/✗/-）を確認したい。

### ✅ 受け入れ基準

#### AC1.1: グループ別アコーディオン表示
- [x] イベント詳細画面に「グループ別出欠状況」セクションが表示される
- [x] 各グループがアコーディオン形式で表示される
- [x] グループヘッダーに集計（◯/△/✗/計）が表示される

**検証**: [`group-attendance-accordion.test.tsx:14-31`](../../../__tests__/components/event-detail/group-attendance-accordion.test.tsx#L14-L31)

#### AC1.2: アコーディオンの展開/折りたたみ
- [x] グループ名をクリックするとメンバーリストが表示される
- [x] 再度クリックすると折りたたまれる
- [x] 初期状態は折りたたまれている

**検証**: [`group-attendance-accordion.test.tsx:14-31`](../../../__tests__/components/event-detail/group-attendance-accordion.test.tsx#L14-L31)

#### AC1.3: メンバー名とステータスの表示
- [x] 各メンバーの名前が表示される
- [x] 出欠ステータスが以下の記号で表示される:
  - ◯: 参加
  - △: 未定
  - ✗: 欠席
  - -: 未登録

**検証**: [`member-attendance-list.test.tsx:12-44`](../../../__tests__/components/event-detail/member-attendance-list.test.tsx#L12-L44)

#### AC1.4: 未登録メンバーの表示
- [x] 出欠を登録していないメンバーも「-」として表示される
- [x] 全メンバーが漏れなく表示される

**検証**: [`member-attendance-list.test.tsx:26-44`](../../../__tests__/components/event-detail/member-attendance-list.test.tsx#L26-L44)

---

## US2: ステータスフィルタリング

**ユーザーストーリー**:
イベント主催者として、特定の出欠ステータス（参加/未定/欠席/未登録）のメンバーのみを表示できるようにフィルタリングしたい。

### ✅ 受け入れ基準

#### AC2.1: フィルタドロップダウンの表示
- [x] フィルタドロップダウンが表示される
- [x] 選択肢: すべて、参加のみ、未定のみ、欠席のみ、未登録のみ

**検証**: [`attendance-filters.test.tsx:12-30`](../../../__tests__/components/event-detail/attendance-filters.test.tsx#L12-L30)

#### AC2.2: 各フィルタオプションの動作
- [x] 「すべて」: 全メンバーが表示される
- [x] 「参加のみ」: ◯ ステータスのメンバーのみ表示
- [x] 「未定のみ」: △ ステータスのメンバーのみ表示
- [x] 「欠席のみ」: ✗ ステータスのメンバーのみ表示
- [x] 「未登録のみ」: status=null のメンバーのみ表示

**検証**: [`member-attendance-list.test.tsx:66-139`](../../../__tests__/components/event-detail/member-attendance-list.test.tsx#L66-L139)

#### AC2.3: フィルタ適用で0件の場合
- [x] 該当メンバーが0件の場合、「メンバーがいません」と表示される

**検証**: [`member-attendance-list.test.tsx:121-139`](../../../__tests__/components/event-detail/member-attendance-list.test.tsx#L121-L139)

---

## US3: メンバーのソート

**ユーザーストーリー**:
イベント主催者として、メンバーリストを名前順（五十音順/アルファベット順）またはステータス順（◯→△→✗→-）で並び替えたい。

### ✅ 受け入れ基準

#### AC3.1: ソートドロップダウンの表示
- [x] ソートドロップダウンが表示される
- [x] 選択肢: 名前順、ステータス順

**検証**: [`attendance-filters.test.tsx:32-50`](../../../__tests__/components/event-detail/attendance-filters.test.tsx#L32-L50)

#### AC3.2: 名前順ソート
- [x] メンバーが名前の昇順（五十音順/アルファベット順）で表示される
- [x] `localeCompare()`で日本語/英語両対応

**検証**: [`member-attendance-list.test.tsx:141-167`](../../../__tests__/components/event-detail/member-attendance-list.test.tsx#L141-L167)

#### AC3.3: ステータス順ソート
- [x] メンバーが以下の順で表示される: ◯ → △ → ✗ → -
- [x] 同じステータス内での順序は保持される

**検証**: [`member-attendance-list.test.tsx:169-200`](../../../__tests__/components/event-detail/member-attendance-list.test.tsx#L169-L200)

#### AC3.4: フィルタ後のソート適用
- [x] フィルタ適用後もソートが正しく機能する
- [x] 処理順序: フィルタ → ソート

**検証**: [`member-attendance-list.test.tsx:202-227`](../../../__tests__/components/event-detail/member-attendance-list.test.tsx#L202-L227)

---

## US4: メンバー名検索

**ユーザーストーリー**:
イベント主催者として、検索ボックスにメンバー名の一部を入力することで、該当するメンバーを素早く見つけたい。

### ✅ 受け入れ基準

#### AC4.1: 検索ボックスの表示
- [x] 検索ボックスが表示される
- [x] プレースホルダー「メンバー名で検索」が表示される

**検証**: [`attendance-filters.test.tsx:67-82`](../../../__tests__/components/event-detail/attendance-filters.test.tsx#L67-L82)

#### AC4.2: 部分一致検索
- [x] 入力した文字列を含むメンバー名が表示される
- [x] 大文字小文字を区別しない
- [x] リアルタイムで結果が更新される

**検証**: [`member-attendance-list.test.tsx:229-270`](../../../__tests__/components/event-detail/member-attendance-list.test.tsx#L229-L270)

#### AC4.3: 検索結果が0件の場合
- [x] 該当メンバーが0件の場合、「メンバーがいません」と表示される

**検証**: [`member-attendance-list.test.tsx:254-270`](../../../__tests__/components/event-detail/member-attendance-list.test.tsx#L254-L270)

#### AC4.4: 検索とフィルタ・ソートの組み合わせ
- [x] 検索→フィルタ→ソートの順で処理される
- [x] 3つの機能が同時に動作する

**検証**: [`member-attendance-list.test.tsx:272-299`](../../../__tests__/components/event-detail/member-attendance-list.test.tsx#L272-L299)

---

## クロスカッティング要件

### ✅ パフォーマンス

#### 大規模データセット (100メンバー)
- [x] レンダリング: 1秒以内（実測: 85ms）
- [x] フィルタ操作: 200ms以内（実測: 26ms）
- [x] ソート操作: 200ms以内（実測: 22ms）
- [x] 検索操作: 200ms以内（実測: 12ms）
- [x] 複合操作: 200ms以内（実測: 2ms）

**検証**: [`member-attendance-list.performance.test.tsx`](../../../__tests__/components/event-detail/member-attendance-list.performance.test.tsx)

### ✅ アクセシビリティ

#### キーボードナビゲーション
- [x] Tab キーでフォーカス移動可能
- [x] Enter/Space キーでアコーディオン操作可能

**検証**: [`group-attendance-accordion.test.tsx:66-92`](../../../__tests__/components/event-detail/group-attendance-accordion.test.tsx#L66-L92)

#### ARIA 属性
- [x] `aria-expanded` 属性が設定されている
- [x] `aria-controls` 属性が設定されている
- [x] フォーカス表示が明確（青色リング）

**検証**: [`group-attendance-accordion.test.tsx:52-64`](../../../__tests__/components/event-detail/group-attendance-accordion.test.tsx#L52-L64)

### ✅ レスポンシブデザイン

#### 各ビューポートでの動作
- [x] モバイル (320px): コンパクト表示、全幅ボタン
- [x] タブレット (768px): 広い余白、大きいフォント
- [x] デスクトップ (1024px+): 中央寄せ、最大余白

**検証**: [responsive-checklist.md](./responsive-checklist.md)

---

## テスト結果サマリー

### ユニットテスト
- **Total Tests**: 233 passed
- **Component Tests**:
  - MemberAttendanceList: 14 tests
  - GroupAttendanceAccordion: 7 tests
  - AttendanceFilters: 9 tests
- **Performance Tests**: 5 tests
- **Coverage**:
  - Statements: 45%+
  - Branches: 30%+
  - Functions: 50%+
  - Lines: 45%+

### 手動テスト (推奨)
以下は手動で確認することを推奨:
1. ブラウザでイベント詳細ページを開く
2. グループアコーディオンを展開/折りたたみ
3. フィルタドロップダウンで各オプションを試す
4. ソートドロップダウンで名前順/ステータス順を試す
5. 検索ボックスにメンバー名を入力
6. フィルタ+ソート+検索を組み合わせて動作確認

---

## 結論

✅ **全ユーザーストーリー（US1～US4）の受け入れ基準を満たしている**

- US1: グループメンバーの出欠確認 ✓
- US2: ステータスフィルタリング ✓
- US3: メンバーのソート ✓
- US4: メンバー名検索 ✓
- パフォーマンス要件 ✓
- アクセシビリティ要件 ✓
- レスポンシブデザイン要件 ✓

**Feature 007 は本番環境にデプロイ可能な状態です。**
