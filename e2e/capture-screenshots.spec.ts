import { test, expect, Page, BrowserContext } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * 使い方ガイド用スクリーンショットキャプチャスクリプト
 *
 * 実行方法:
 * 1. 開発サーバーを起動: npm run dev
 * 2. テスト実行: npm run capture-screenshots
 *
 * このスクリプトはテストデータを作成し、各画面のスクリーンショットを撮影します。
 */

const SCREENSHOT_DIR = path.join(__dirname, '../public/images/guide');
const STATE_FILE = path.join(__dirname, 'test-state.json');
const STORAGE_STATE_FILE = path.join(__dirname, 'storage-state.json');

// 共有コンテキストとページ
let sharedContext: BrowserContext;
let sharedPage: Page;

// テスト状態を保存/読み込みする関数
function saveState(state: { orgId: string; eventId: string }) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state));
}

function loadState(): { orgId: string; eventId: string } {
  if (fs.existsSync(STATE_FILE)) {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  }
  return { orgId: '', eventId: '' };
}

test.describe('使い方ガイド スクリーンショット', () => {
  test.describe.configure({ mode: 'serial' });

  // 共有コンテキストをセットアップ
  test.beforeAll(async ({ browser }) => {
    sharedContext = await browser.newContext({
      locale: 'ja-JP',
      timezoneId: 'Asia/Tokyo',
      viewport: { width: 1280, height: 720 },
    });
    sharedPage = await sharedContext.newPage();
  });

  test.afterAll(async () => {
    await sharedContext.close();
  });

  // Phase 1: テストデータ作成とスクリーンショット
  test.describe('1. 団体作成', () => {
    test('1-1. 団体作成画面（初期表示）', async () => {
      const page = sharedPage;
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/01-create-org-initial.png`,
        fullPage: true,
      });
    });

    test('1-2. 団体作成画面（入力中）', async () => {
      const page = sharedPage;
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // フォームに入力
      await page.fill('#org-name', 'サンプル吹奏楽団');
      await page.fill('#org-desc', '東京を拠点に活動する市民吹奏楽団です。');

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/01-create-org-filled.png`,
        fullPage: true,
      });

      // 実際に団体を作成
      await page.click('button:has-text("団体を作成")');
      await page.waitForSelector('text=団体が作成されました', { timeout: 10000 });

      // URLからIDを取得（p.font-monoの値から）
      const urlElement = page.locator('p.font-mono').first();
      const urlText = await urlElement.textContent();
      const orgId = urlText?.split('/').pop() || '';
      console.log(`団体ID: ${orgId}`);

      // 状態を保存
      saveState({ orgId, eventId: '' });
    });
  });

  // Phase 2: グループ管理
  test.describe('2. グループ管理', () => {
    test('2-1. グループ管理画面（空）', async () => {
      const page = sharedPage;
      const { orgId } = loadState();
      test.skip(!orgId, '団体IDが取得できていません');

      await page.goto(`/${orgId}/admin/groups`);
      await page.waitForLoadState('networkidle');

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/04-group-management-empty.png`,
        fullPage: true,
      });
    });

    test('2-2. グループ作成', async () => {
      const page = sharedPage;
      const { orgId } = loadState();
      test.skip(!orgId, '団体IDが取得できていません');

      await page.goto(`/${orgId}/admin/groups`);
      await page.waitForLoadState('networkidle');

      // ローディング完了を待機
      await page.waitForSelector('#name', { timeout: 10000 });

      // グループを作成
      const groups = ['フルート', 'クラリネット', 'トランペット'];

      for (let i = 0; i < groups.length; i++) {
        await page.fill('#name', groups[i]);
        await page.fill('#order', String(i + 1));
        await page.click('button:has-text("作成")');
        await page.waitForTimeout(500);
      }

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/04-group-management.png`,
        fullPage: true,
      });
    });

    test('2-3. グループ作成フォーム入力中', async () => {
      const page = sharedPage;
      const { orgId } = loadState();
      test.skip(!orgId, '団体IDが取得できていません');

      await page.goto(`/${orgId}/admin/groups`);
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('#name', { timeout: 10000 });

      // フォームに入力（保存しない）
      await page.fill('#name', 'ホルン');
      await page.fill('#order', '4');

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/04-group-create-form.png`,
        fullPage: true,
      });
    });
  });

  // Phase 3: イベント管理
  test.describe('3. イベント管理', () => {
    test('3-1. イベント管理画面（空）', async () => {
      const page = sharedPage;
      const { orgId } = loadState();
      test.skip(!orgId, '団体IDが取得できていません');

      await page.goto(`/${orgId}/admin/events`);
      await page.waitForLoadState('networkidle');

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/05-event-management-empty.png`,
        fullPage: true,
      });
    });

    test('3-2. イベント作成', async () => {
      const page = sharedPage;
      const state = loadState();
      test.skip(!state.orgId, '団体IDが取得できていません');

      await page.goto(`/${state.orgId}/admin/events`);
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('#date', { timeout: 10000 });

      // イベントを作成
      const events = [
        { title: '定期練習', date: '2025-11-23', location: '市民文化センター' },
        { title: 'クリスマスコンサート', date: '2025-12-24', location: '市民ホール' },
      ];

      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        await page.fill('#date', event.date);
        await page.fill('#title', event.title);
        await page.fill('#location', event.location);
        await page.click('button:has-text("作成")');
        await page.waitForTimeout(500);

      }

      // イベント管理画面のスクリーンショットを撮影
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/05-event-management.png`,
        fullPage: true,
      });

      // 団体トップページに移動してイベントIDを取得
      await page.goto(`/${state.orgId}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      const eventLinks = page.locator('a[href*="/events/"]');
      const count = await eventLinks.count();
      if (count > 0) {
        const href = await eventLinks.first().getAttribute('href');
        const eventId = href?.match(/\/events\/([^/]+)/)?.[1] || '';
        console.log(`イベントID: ${eventId}`);
        // 状態を更新
        saveState({ orgId: state.orgId, eventId });
      }
    });

    test('3-3. イベント作成フォーム入力中', async () => {
      const page = sharedPage;
      const { orgId } = loadState();
      test.skip(!orgId, '団体IDが取得できていません');

      await page.goto(`/${orgId}/admin/events`);
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('#date', { timeout: 10000 });

      // フォームに入力（保存しない）
      await page.fill('#date', '2026-01-11');
      await page.fill('#title', '新年会');
      await page.fill('#location', '中央公民館');

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/05-event-create-form.png`,
        fullPage: true,
      });
    });
  });

  // Phase 4: 管理画面・団体設定
  test.describe('4. 管理画面', () => {
    test('4-1. 管理画面トップ', async () => {
      const page = sharedPage;
      const { orgId } = loadState();
      test.skip(!orgId, '団体IDが取得できていません');

      await page.goto(`/${orgId}/admin`);
      await page.waitForLoadState('networkidle');

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/03-admin-top.png`,
        fullPage: true,
      });
    });

    test('4-2. 団体設定画面', async () => {
      const page = sharedPage;
      const { orgId } = loadState();
      test.skip(!orgId, '団体IDが取得できていません');

      await page.goto(`/${orgId}/admin/organizations`);
      await page.waitForLoadState('networkidle');

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/06-org-settings.png`,
        fullPage: true,
      });
    });
  });

  // Phase 5: 団体トップ
  test.describe('5. 団体トップ', () => {
    test('5-1. イベント一覧', async () => {
      const page = sharedPage;
      const { orgId } = loadState();
      test.skip(!orgId, '団体IDが取得できていません');

      await page.goto(`/${orgId}`);
      await page.waitForLoadState('networkidle');

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/02-org-top-with-events.png`,
        fullPage: true,
      });
    });
  });

  // Phase 6: 出欠登録
  test.describe('6. 出欠登録', () => {
    test('6-1. 出欠登録画面（初期）', async () => {
      const page = sharedPage;
      const { orgId, eventId } = loadState();
      test.skip(!orgId || !eventId, '団体IDまたはイベントIDが取得できていません');

      await page.goto(`/${orgId}/events/${eventId}/register`);
      await page.waitForLoadState('networkidle');

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/08-attendance-register-initial.png`,
        fullPage: true,
      });
    });

    test('6-2. グループ選択後', async () => {
      const page = sharedPage;
      const { orgId, eventId } = loadState();
      test.skip(!orgId || !eventId, '団体IDまたはイベントIDが取得できていません');

      await page.goto(`/${orgId}/events/${eventId}/register`);
      await page.waitForLoadState('networkidle');

      // グループを選択
      const groupSelect = page.locator('select').first();
      if (await groupSelect.isVisible()) {
        const options = await groupSelect.locator('option').allTextContents();
        if (options.length > 1) {
          await groupSelect.selectOption({ index: 1 });
          await page.waitForTimeout(500);
        }
      }

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/08-attendance-register-group-selected.png`,
        fullPage: true,
      });
    });

    test('6-3. 出欠登録してステータス選択', async () => {
      const page = sharedPage;
      const { orgId, eventId } = loadState();
      test.skip(!orgId || !eventId, '団体IDまたはイベントIDが取得できていません');

      await page.goto(`/${orgId}/events/${eventId}/register`);
      await page.waitForLoadState('networkidle');

      // グループ選択
      const groupSelect = page.locator('#group');
      if (await groupSelect.isVisible()) {
        await groupSelect.selectOption({ index: 1 });
        await page.waitForTimeout(500);

        // 新しいメンバー名を入力
        const nameInput = page.locator('#newMember');
        if (await nameInput.isVisible()) {
          await nameInput.fill('山田太郎');
          await page.waitForTimeout(300);
        }

        // 参加ボタンをクリック
        const attendButton = page.locator('button:has-text("◯")').first();
        if (await attendButton.isVisible()) {
          await attendButton.click();
          await page.waitForTimeout(300);
        }
      }

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/08-attendance-register-status-selected.png`,
        fullPage: true,
      });

      // 実際に登録を行う（イベント詳細画面でアコーディオンを表示するため）
      const submitButton = page.locator('button:has-text("登録する")');
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(1000);
      }
    });
  });

  // Phase 7: イベント詳細
  test.describe('7. イベント詳細', () => {
    test('7-1. イベント詳細画面', async () => {
      const page = sharedPage;
      const { orgId, eventId } = loadState();
      test.skip(!orgId || !eventId, '団体IDまたはイベントIDが取得できていません');

      await page.goto(`/${orgId}/events/${eventId}`);
      await page.waitForLoadState('networkidle');

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/07-event-detail.png`,
        fullPage: true,
      });
    });

    test('7-2. アコーディオン展開', async () => {
      const page = sharedPage;
      const { orgId, eventId } = loadState();
      test.skip(!orgId || !eventId, '団体IDまたはイベントIDが取得できていません');

      await page.goto(`/${orgId}/events/${eventId}`);
      await page.waitForLoadState('networkidle');

      // 開発ツールメニューを閉じる（ページ本体をクリック）
      await page.click('body', { position: { x: 640, y: 300 } });
      await page.waitForTimeout(100);

      // 最初のアコーディオンをクリック（aria-controlsがあるボタンはアコーディオンのみ）
      const accordion = page.locator('button[aria-controls]').first();
      if (await accordion.isVisible()) {
        await accordion.click();
        await page.waitForTimeout(300);
      }

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/07-event-detail-expanded.png`,
        fullPage: true,
      });
    });

    test('7-3. フィルタ機能', async () => {
      const page = sharedPage;
      const { orgId, eventId } = loadState();
      test.skip(!orgId || !eventId, '団体IDまたはイベントIDが取得できていません');

      await page.goto(`/${orgId}/events/${eventId}`);
      await page.waitForLoadState('networkidle');

      // フィルタを選択
      const filterSelect = page.locator('select').first();
      if (await filterSelect.isVisible()) {
        await filterSelect.focus();
      }

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/07-event-detail-filter.png`,
        fullPage: true,
      });
    });
  });

  // Phase 8: 一括出欠登録
  test.describe('8. 一括出欠登録', () => {
    test('8-1. 一括登録画面（初期）', async () => {
      const page = sharedPage;
      const { orgId } = loadState();
      test.skip(!orgId, '団体IDが取得できていません');

      await page.goto(`/${orgId}/my-register`);
      await page.waitForLoadState('networkidle');

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/09-bulk-register-initial.png`,
        fullPage: true,
      });
    });

    test('8-2. メンバー選択後', async () => {
      const page = sharedPage;
      const { orgId } = loadState();
      test.skip(!orgId, '団体IDが取得できていません');

      await page.goto(`/${orgId}/my-register`);
      await page.waitForLoadState('networkidle');

      // まずグループを選択
      const groupSelect = page.locator('#group-select');
      if (await groupSelect.isVisible()) {
        const groupOptions = await groupSelect.locator('option').allTextContents();
        if (groupOptions.length > 1) {
          await groupSelect.selectOption({ index: 1 });
          await page.waitForTimeout(500);
        }
      }

      // メンバーを選択
      const memberSelect = page.locator('#member-select');
      if (await memberSelect.isVisible()) {
        const memberOptions = await memberSelect.locator('option').allTextContents();
        if (memberOptions.length > 1) {
          await memberSelect.selectOption({ index: 1 });
          await page.waitForTimeout(500);
        }
      }

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/09-bulk-register-member-selected.png`,
        fullPage: true,
      });
    });

    test('8-3. イベント選択', async () => {
      const page = sharedPage;
      const { orgId } = loadState();
      test.skip(!orgId, '団体IDが取得できていません');

      await page.goto(`/${orgId}/my-register`);
      await page.waitForLoadState('networkidle');

      // メンバー選択後、イベントのステータスを選択
      const memberSelect = page.locator('select').first();
      if (await memberSelect.isVisible()) {
        const options = await memberSelect.locator('option').allTextContents();
        if (options.length > 1) {
          await memberSelect.selectOption({ index: 1 });
          await page.waitForTimeout(500);

          // 最初のイベントの参加ボタンをクリック
          const attendButton = page.locator('button:has-text("◯")').first();
          if (await attendButton.isVisible()) {
            await attendButton.click();
          }
        }
      }

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/09-bulk-register-event-selected.png`,
        fullPage: true,
      });
    });
  });
});
