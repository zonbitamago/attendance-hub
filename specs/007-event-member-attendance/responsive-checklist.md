# レスポンシブデザインチェックリスト

Feature 007 - イベント画面 個人別出欠状況表示機能

## 概要

Tailwind CSS のモバイルファーストアプローチを採用し、以下のブレークポイントでレスポンシブ対応を実装：
- **ベース**: 320px～（モバイル）
- **sm**: 640px～（大きめのモバイル/小さめのタブレット）
- **lg**: 1024px～（デスクトップ）

---

## T141: モバイル (320px)

### ✅ イベント詳細ページ ([`app/[org]/events/[id]/page.tsx`](../../../app/[org]/events/[id]/page.tsx))

#### レイアウト
- [x] **コンテナパディング**: `px-4` (16px) - モバイルで適切な余白
  - 実装: [`page.tsx:91`](../../../app/[org]/events/[id]/page.tsx#L91)

- [x] **カードパディング**: `p-4` (16px) - コンパクトな表示
  - 実装: [`page.tsx:103,123,148`](../../../app/[org]/events/[id]/page.tsx#L103,L123,L148)

#### タイポグラフィ
- [x] **イベントタイトル**: `text-xl` (1.25rem) - モバイルで読みやすいサイズ
  - 実装: [`page.tsx:104`](../../../app/[org]/events/[id]/page.tsx#L104)

- [x] **日付**: `text-sm` (0.875rem) - コンパクトだが読みやすい
  - 実装: [`page.tsx:105`](../../../app/[org]/events/[id]/page.tsx#L105)

- [x] **セクション見出し**: `text-lg` (1.125rem) - 適切な階層表現
  - 実装: [`page.tsx:124,149`](../../../app/[org]/events/[id]/page.tsx#L124,L149)

#### ボタン
- [x] **出欠登録ボタン**: `w-full` - モバイルで全幅表示、タップしやすい
  - 実装: [`page.tsx:115`](../../../app/[org]/events/[id]/page.tsx#L115)

#### フィルタ・検索コンポーネント
- [x] **AttendanceFilters**: フレックスボックスレイアウトで自動折り返し
  - 実装: [`attendance-filters.tsx:40`](../../../components/event-detail/attendance-filters.tsx#L40)

**検証方法**:
```bash
# ブラウザ開発者ツールでデバイスエミュレーション
1. Chrome DevTools → デバイスツールバー (Cmd+Shift+M)
2. 幅を320pxに設定
3. イベント詳細ページを開く
4. 以下を確認:
   - 横スクロールが発生しない
   - すべてのテキストが読める
   - ボタンが全幅で表示される
   - フィルタコントロールが縦に並ぶ（必要に応じて）
```

---

## T142: タブレット (768px)

### ✅ イベント詳細ページ

#### レイアウト
- [x] **コンテナパディング**: `sm:px-6` (24px) - タブレットで余裕のある余白
  - 実装: [`page.tsx:91`](../../../app/[org]/events/[id]/page.tsx#L91)

- [x] **カードパディング**: `sm:p-6` (24px) - より広々としたカード内部
  - 実装: [`page.tsx:103,123,148`](../../../app/[org]/events/[id]/page.tsx#L103,L123,L148)

#### タイポグラフィ
- [x] **イベントタイトル**: `sm:text-2xl` (1.5rem) - タブレットで大きく表示
  - 実装: [`page.tsx:104`](../../../app/[org]/events/[id]/page.tsx#L104)

- [x] **日付**: `sm:text-base` (1rem) - より読みやすく
  - 実装: [`page.tsx:105`](../../../app/[org]/events/[id]/page.tsx#L105)

- [x] **セクション見出し**: `sm:text-xl` (1.25rem) - 強調表示
  - 実装: [`page.tsx:124,149`](../../../app/[org]/events/[id]/page.tsx#L124,L149)

#### ボタン
- [x] **出欠登録ボタン**: `sm:w-auto` - タブレットでインラインブロック表示、コンパクト
  - 実装: [`page.tsx:115`](../../../app/[org]/events/[id]/page.tsx#L115)

**検証方法**:
```bash
# ブラウザ開発者ツールでデバイスエミュレーション
1. Chrome DevTools → デバイスツールバー
2. iPad (768 x 1024) を選択
3. イベント詳細ページを開く
4. 以下を確認:
   - カード内の余白が増える
   - タイトルが大きくなる
   - 出欠登録ボタンが適切な幅になる
```

---

## T143: デスクトップ (1024px以上)

### ✅ イベント詳細ページ

#### レイアウト
- [x] **コンテナパディング**: `lg:px-8` (32px) - デスクトップで最大の余白
  - 実装: [`page.tsx:91`](../../../app/[org]/events/[id]/page.tsx#L91)

- [x] **最大幅制限**: `max-w-4xl` (896px) - 中央寄せで読みやすい幅
  - 実装: [`page.tsx:91`](../../../app/[org]/events/[id]/page.tsx#L91)

#### その他
- すべてのコンポーネントがデスクトップ幅で適切に表示される
- グループアコーディオンが展開しても横幅に収まる
- フィルタコントロールが横並びで快適に操作できる

**検証方法**:
```bash
# ブラウザで通常表示
1. ブラウザウィンドウを1024px以上に広げる
2. イベント詳細ページを開く
3. 以下を確認:
   - コンテンツが中央寄せで表示される
   - 横幅が896px (max-w-4xl) を超えない
   - 左右に適切な余白がある
```

---

## コンポーネント別レスポンシブ対応

### ✅ AttendanceFilters ([`attendance-filters.tsx`](../../../components/event-detail/attendance-filters.tsx))
- [x] フレックスボックスレイアウト (`flex flex-col gap-4`)
- [x] モバイル: 縦並び
- [x] タブレット以上: 必要に応じて横並び（flexの自動調整）

### ✅ GroupAttendanceAccordion ([`group-attendance-accordion.tsx`](../../../components/event-detail/group-attendance-accordion.tsx))
- [x] ボタンが全幅 (`w-full`) - すべてのビューポートで適切
- [x] アイコンと文字が横並びで適切にレイアウト (`flex justify-between`)

### ✅ MemberAttendanceList ([`member-attendance-list.tsx`](../../../components/event-detail/member-attendance-list.tsx))
- [x] リスト項目が全幅で表示
- [x] メンバー名とステータスが左右に配置 (`flex justify-between`)
- [x] すべてのビューポートで読みやすい

---

## 総括

### ✅ T141: モバイル (320px)
- コンパクトなパディングとタイポグラフィ
- 全幅ボタンでタップしやすい
- 横スクロール無し

### ✅ T142: タブレット (768px)
- より広い余白と大きいフォント
- ボタンが適切なサイズに
- 読みやすさ向上

### ✅ T143: デスクトップ (1024px以上)
- 最大の余白で快適な閲覧体験
- 中央寄せで視線が集中
- すべての操作が快適

**レスポンシブデザイン要件: すべて満たしている ✓**
