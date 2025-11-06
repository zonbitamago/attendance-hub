# Tasks: 入力欄テキスト視認性の改善

**Input**: Design documents from `/specs/002-input-text-visibility/`
**Prerequisites**: plan.md (completed), spec.md (completed), research.md (completed), quickstart.md (completed)

**Tests**: この機能はUIスタイリングのみの変更のため、自動テストではなく手動テストで検証します。

**Organization**: タスクはユーザーストーリー別に整理されていますが、すべてのストーリーは同じファイルを修正するため、実際には順次実行されます。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[Story]**: このタスクが属するユーザーストーリー（US1、US2、US3）
- 説明には正確なファイルパスを含める

## Path Conventions

- **Next.js App Router**: `app/` at repository root
- この機能の対象: `app/admin/groups/page.tsx`, `app/admin/events/page.tsx`, `app/events/[id]/register/page.tsx`

## Phase 1: Setup（共有インフラストラクチャ）

**目的**: 開発環境の確認と準備

- [X] T001 開発サーバーが正常に起動することを確認（`npm run dev`）
- [X] T002 Tailwind CSSが正しく設定されていることを確認（tailwind.config.tsの`content`配列）
- [X] T003 ブラウザでライトモード/ダークモードの切り替え方法を確認

---

## Phase 2: Foundational（ブロッキング前提条件）

**目的**: すべてのユーザーストーリーに必要なコア調査とパターン確立

**⚠️ CRITICAL**: この段階が完了するまで、ユーザーストーリーの作業は開始できません

- [X] T004 research.mdの内容を確認し、適用するTailwindクラスを理解（`text-gray-900`、`placeholder:text-gray-400`）
- [X] T005 quickstart.mdの手動テスト手順を確認
- [X] T006 3つの対象ファイル（app/admin/groups/page.tsx、app/admin/events/page.tsx、app/events/[id]/register/page.tsx）を開き、修正箇所を確認

**Checkpoint**: 基盤準備完了 - ユーザーストーリーの実装を開始可能

---

## Phase 3: User Story 1 - ライトモードでの入力欄視認性 (Priority: P1) 🎯 MVP

**Goal**: ライトモード環境で全9箇所の入力欄の入力テキストが明瞭に表示される

**Independent Test**: ライトモードのブラウザでグループ作成画面（http://localhost:3000/admin/groups）を開き、グループ名を入力して視認性を確認

### Implementation for User Story 1

- [X] T007 [US1] app/admin/groups/page.tsx の133行目のグループ名input要素のclassNameに `text-gray-900 placeholder:text-gray-400` を追加
- [X] T008 [US1] app/admin/groups/page.tsx の148行目の表示順序input要素のclassNameに `text-gray-900 placeholder:text-gray-400` を追加
- [X] T009 [US1] app/admin/groups/page.tsx の165行目のカラーコードinput要素のclassNameに `text-gray-900 placeholder:text-gray-400` を追加
- [ ] T010 [US1] ライトモードでグループ管理画面（http://localhost:3000/admin/groups）を開き、3つの入力欄すべてで入力テキストが濃いグレーで明瞭に表示されることを手動確認
- [X] T011 [US1] app/admin/events/page.tsx の134行目の日付input要素のclassNameに `text-gray-900 placeholder:text-gray-400` を追加
- [X] T012 [US1] app/admin/events/page.tsx の148行目のタイトルinput要素のclassNameに `text-gray-900 placeholder:text-gray-400` を追加
- [X] T013 [US1] app/admin/events/page.tsx の163行目の場所input要素のclassNameに `text-gray-900 placeholder:text-gray-400` を追加
- [ ] T014 [US1] ライトモードでイベント管理画面（http://localhost:3000/admin/events）を開き、3つの入力欄すべてで入力テキストが明瞭に表示されることを手動確認
- [X] T015 [US1] app/events/[id]/register/page.tsx の160行目のグループselect要素のclassNameに `text-gray-900 placeholder:text-gray-400` を追加
- [X] T016 [US1] app/events/[id]/register/page.tsx の188行目のメンバーselect要素のclassNameに `text-gray-900 placeholder:text-gray-400` を追加
- [X] T017 [US1] app/events/[id]/register/page.tsx の212行目の新メンバー名input要素のclassNameに `text-gray-900 placeholder:text-gray-400` を追加
- [ ] T018 [US1] ライトモードで出欠登録画面（http://localhost:3000/events/[実際のイベントID]/register）を開き、3つの入力欄すべてで入力テキストが明瞭に表示されることを手動確認

**Checkpoint**: この時点で、User Story 1は完全に機能し、ライトモードで独立してテスト可能

---

## Phase 4: User Story 2 - ダークモードでの入力欄視認性 (Priority: P1)

**Goal**: ダークモード環境で全9箇所の入力欄の入力テキストが明瞭に表示される（ライトモードと同じ視認性）

**Independent Test**: ダークモードに設定したブラウザでグループ作成画面を開き、グループ名を入力して視認性を確認（ライトモードとの一貫性も検証）

### Implementation for User Story 2

**注**: User Story 1で既にclassNameを追加しているため、追加の実装は不要。ダークモードでのテストのみ実行。

- [ ] T019 [US2] ブラウザまたはOSをダークモードに切り替え（Chrome DevTools: F12 > ⋮ > More tools > Rendering > Emulate CSS media feature prefers-color-scheme > dark）
- [ ] T020 [US2] ダークモードでグループ管理画面（http://localhost:3000/admin/groups）を開き、3つの入力欄すべてで入力テキストが背景とのコントラストが明確で読みやすいことを手動確認
- [ ] T021 [US2] ダークモードでイベント管理画面（http://localhost:3000/admin/events）を開き、3つの入力欄すべてで入力テキストが明瞭に表示されることを手動確認
- [ ] T022 [US2] ダークモードで出欠登録画面（http://localhost:3000/events/[実際のイベントID]/register）を開き、3つの入力欄すべてで入力テキストが明瞭に表示されることを手動確認
- [ ] T023 [US2] システムカラースキームをライト⇔ダークで切り替えても、入力欄の視認性が一貫して維持されることを確認

**Checkpoint**: この時点で、User Stories 1と2の両方が独立して機能している

---

## Phase 5: User Story 3 - プレースホルダーとの明確な区別 (Priority: P2)

**Goal**: プレースホルダーテキストと実際の入力内容が色の違いで明確に区別できる

**Independent Test**: 入力欄にフォーカスを当て、プレースホルダー状態と入力後の文字色の違いを目視で確認

### Implementation for User Story 3

**注**: User Story 1で既に`placeholder:text-gray-400`を追加しているため、追加の実装は不要。プレースホルダーの視認性テストのみ実行。

- [ ] T024 [US3] ライトモードでグループ管理画面を開き、各入力欄のプレースホルダーが薄いグレー（#9ca3af）で表示されることを確認
- [ ] T025 [US3] グループ名入力欄にテキストを入力し、入力テキスト（濃いグレー）とプレースホルダー（薄いグレー）が明確に区別できることを確認
- [ ] T026 [US3] すべてのテキストを削除し、プレースホルダーが再び薄い色で表示されることを確認
- [ ] T027 [US3] イベント管理画面と出欠登録画面でも同様の確認を実施（プレースホルダーと入力テキストの区別）
- [ ] T028 [US3] ダークモードでも同じプレースホルダーと入力テキストの区別が維持されることを確認

**Checkpoint**: すべてのユーザーストーリーが独立して機能している

---

## Phase 6: コントラスト比検証

**Goal**: WCAG 2.1 AA基準（4.5:1）を満たすことを確認

- [ ] T029 [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)を開く
- [ ] T030 入力テキスト色（#111827）と白背景（#FFFFFF）のコントラスト比が16.6:1であることを確認
- [ ] T031 プレースホルダー色（#9ca3af）と白背景（#FFFFFF）のコントラスト比が4.6:1以上であることを確認
- [ ] T032 両方のコントラスト比がWCAG AA基準（4.5:1）を満たすことを記録

---

## Phase 7: ブラウザ互換性テスト

**Goal**: すべての主要ブラウザで一貫した視認性を確保

- [ ] T033 [P] Chrome最新版でライトモード・ダークモードの両方をテストし、全9箇所の入力欄で視認性を確認
- [ ] T034 [P] Firefox最新版でライトモード・ダークモードの両方をテストし、全9箇所の入力欄で視認性を確認
- [ ] T035 [P] Safari最新版（macOS）でライトモード・ダークモードの両方をテストし、全9箇所の入力欄で視認性を確認
- [ ] T036 [P] Edge最新版でライトモード・ダークモードの両方をテストし、全9箇所の入力欄で視認性を確認

---

## Phase 8: モバイルデバイステスト

**Goal**: モバイルビューポートでの視認性を確認

- [ ] T037 Chrome DevToolsでiPhone 12 Pro（390x844）をエミュレートし、全9箇所の入力欄の視認性を確認
- [ ] T038 Chrome DevToolsでiPad Air（820x1180）をエミュレートし、全9箇所の入力欄の視認性を確認
- [ ] T039 Chrome DevToolsでPixel 5（393x851）をエミュレートし、全9箇所の入力欄の視認性を確認
- [ ] T040 各デバイスで文字が小さすぎず、タップ時のフォーカス状態が明確、入力中のテキストが明瞭であることを確認

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: 複数のユーザーストーリーに影響する改善

- [ ] T041 変更されたファイルのTypeScript型チェックを実行（`npx tsc --noEmit`）し、型エラーがないことを確認
- [ ] T042 リンティングを実行（`npm run lint`）し、コードスタイルの問題がないことを確認
- [ ] T043 開発サーバーをハードリフレッシュ（Cmd+Shift+R または Ctrl+Shift+R）し、ブラウザキャッシュをクリア
- [ ] T044 最終的な視覚的検証: 全3ページ（グループ管理、イベント管理、出欠登録）で全9箇所の入力欄がライトモード・ダークモード両方で明瞭に表示されることを確認
- [ ] T045 quickstart.mdの手動テスト手順をすべて実行し、期待される動作と一致することを確認
- [ ] T046 変更をコミット準備: `git status`で変更されたファイルを確認（app/admin/groups/page.tsx、app/admin/events/page.tsx、app/events/[id]/register/page.tsx）

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存関係なし - すぐに開始可能
- **Foundational (Phase 2)**: Setupの完了に依存 - すべてのユーザーストーリーをブロック
- **User Stories (Phase 3-5)**: Foundational段階の完了に依存
  - User Story 1、2、3は同じファイルを修正するため、順次実行
  - US1で実装 → US2でダークモードテスト → US3でプレースホルダーテスト
- **Verification Phases (Phase 6-8)**: User Story 3の完了に依存
- **Polish (Phase 9)**: すべてのフェーズの完了に依存

### User Story Dependencies

- **User Story 1 (P1)**: Foundational（Phase 2）完了後に開始可能 - 他のストーリーへの依存なし
- **User Story 2 (P1)**: User Story 1の実装に依存（同じclassNameを使用）- テストのみ
- **User Story 3 (P2)**: User Story 1の実装に依存（同じclassNameを使用）- テストのみ

### Within Each User Story

- User Story 1: 実装タスク（T007-T018）→ 手動テスト
- User Story 2: 手動テストのみ（ダークモード）
- User Story 3: 手動テストのみ（プレースホルダー）

### Parallel Opportunities

- **Phase 1**: T001、T002、T003は並列実行可能（異なる確認タスク）
- **Phase 3**: T007、T008、T009は並列実行可能（同じファイルの異なる行）
  - ただし、実際にはファイルコンフリクトを避けるため順次実行推奨
- **Phase 7**: T033-T036（ブラウザテスト）は並列実行可能（異なるブラウザ）
- **Phase 8**: T037-T039（モバイルテスト）は並列実行可能（異なるデバイス）

**注**: この機能は3つの同じファイルを修正するため、真の並列実行機会は限定的。主に検証タスク（Phase 7-8）で並列化可能。

---

## Parallel Example: User Story 1

```bash
# グループ管理画面の3つの入力欄を順次修正（ファイルコンフリクト回避）:
Task T007: "app/admin/groups/page.tsx の133行目を修正"
Task T008: "app/admin/groups/page.tsx の148行目を修正"
Task T009: "app/admin/groups/page.tsx の165行目を修正"

# 手動テスト実行:
Task T010: "ライトモードでグループ管理画面をテスト"

# イベント管理画面の3つの入力欄を順次修正:
Task T011: "app/admin/events/page.tsx の134行目を修正"
Task T012: "app/admin/events/page.tsx の148行目を修正"
Task T013: "app/admin/events/page.tsx の163行目を修正"
```

---

## Parallel Example: Browser Testing (Phase 7)

```bash
# 異なるブラウザで並列テスト可能:
Task T033: "Chrome最新版でテスト"
Task T034: "Firefox最新版でテスト"
Task T035: "Safari最新版でテスト"
Task T036: "Edge最新版でテスト"

# 4つのブラウザすべてで同時にテスト実行可能
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2のみ)

1. Phase 1を完了: Setup
2. Phase 2を完了: Foundational（CRITICAL - すべてのストーリーをブロック）
3. Phase 3を完了: User Story 1（ライトモード実装+テスト）
4. Phase 4を完了: User Story 2（ダークモードテスト）
5. **STOP and VALIDATE**: ライトモード・ダークモード両方で独立テスト
6. 必要に応じてデプロイ/デモ

### Incremental Delivery

1. Setup + Foundational完了 → 基盤準備完了
2. User Story 1追加 → ライトモードで独立テスト → デプロイ/デモ（MVP!）
3. User Story 2追加 → ダークモードで独立テスト → デプロイ/デモ
4. User Story 3追加 → プレースホルダーで独立テスト → デプロイ/デモ
5. 各ストーリーが前のストーリーを壊すことなく価値を追加

### Sequential Strategy（推奨）

この機能は同じファイルを修正するため、順次実行が推奨：

1. チームでSetup + Foundationalを完了
2. 順次実装:
   - Developer A: User Story 1（実装）
   - Developer A: User Story 2（テスト）
   - Developer A: User Story 3（テスト）
3. 並列検証:
   - Multiple testers: Phase 7（ブラウザテスト）
   - Multiple testers: Phase 8（モバイルテスト）

---

## Notes

- [P] タスク = 異なるファイル、依存関係なし
- [Story] ラベルは特定のユーザーストーリーへのタスクのトレーサビリティのためにマッピング
- 各ユーザーストーリーは独立して完成可能でテスト可能
- タスクまたは論理グループごとにコミット
- 任意のチェックポイントで停止してストーリーを独立検証
- 避けるべき: 曖昧なタスク、同じファイルの競合、独立性を壊すストーリー間の依存関係
- この機能は視覚的検証が中心のため、自動テストではなく手動テストを使用
- Tailwindクラスの追加のみのため、TypeScript型システムへの影響なし
