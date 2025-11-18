import { chromium } from '@playwright/test';

/**
 * スクリーンショット用テストデータ作成スクリプト
 *
 * 実行方法:
 * 1. 開発サーバーを起動: npm run dev
 * 2. スクリプト実行: npx playwright test e2e/seed-test-data.ts --headed
 *
 * このスクリプトは実際のブラウザ操作でテストデータを作成します。
 */

const BASE_URL = 'http://localhost:3000';

async function seedTestData() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    locale: 'ja-JP',
    timezoneId: 'Asia/Tokyo',
  });
  const page = await context.newPage();

  console.log('テストデータの作成を開始します...');

  // 1. 団体を作成
  console.log('1. 団体を作成中...');
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');

  await page.fill('input[name="name"]', 'サンプル吹奏楽団');
  await page.fill('textarea[name="description"]', '東京を拠点に活動する市民吹奏楽団です。毎週土曜日に練習しています。');
  await page.click('button[type="submit"]');

  // URLから団体IDを取得
  await page.waitForSelector('text=団体が作成されました');
  const urlText = await page.locator('code').first().textContent();
  const orgId = urlText?.split('/').pop() || '';
  console.log(`   団体ID: ${orgId}`);

  // 団体ページに移動
  await page.goto(`${BASE_URL}/${orgId}`);
  await page.waitForLoadState('networkidle');

  // 2. グループを作成
  console.log('2. グループを作成中...');
  await page.goto(`${BASE_URL}/${orgId}/admin/groups`);
  await page.waitForLoadState('networkidle');

  const groups = [
    { name: 'フルート', members: ['田中花子', '鈴木美咲', '山田愛'] },
    { name: 'クラリネット', members: ['佐藤健太', '高橋直樹', '渡辺翔', '伊藤麻衣'] },
    { name: 'トランペット', members: ['中村大輔', '小林優子', '加藤誠'] },
    { name: 'ホルン', members: ['山本彩', '松本健'] },
    { name: 'パーカッション', members: ['井上拓也', '木村美穂', '林太郎'] },
  ];

  for (const group of groups) {
    // グループ作成
    const groupNameInput = page.locator('input[placeholder*="グループ名"]').first();
    await groupNameInput.fill(group.name);
    await page.click('button:has-text("グループを追加")');
    await page.waitForTimeout(500);

    // メンバー追加
    for (const member of group.members) {
      const memberInput = page.locator(`input[placeholder*="メンバー名"]`).last();
      if (await memberInput.isVisible()) {
        await memberInput.fill(member);
        await page.click('button:has-text("メンバーを追加")');
        await page.waitForTimeout(300);
      }
    }
    console.log(`   ${group.name}: ${group.members.length}名`);
  }

  // 3. イベントを作成
  console.log('3. イベントを作成中...');
  await page.goto(`${BASE_URL}/${orgId}/admin/events`);
  await page.waitForLoadState('networkidle');

  const events = [
    { title: '定期練習', date: '2025-11-23', location: '市民文化センター 音楽室' },
    { title: '定期練習', date: '2025-11-30', location: '市民文化センター 音楽室' },
    { title: 'クリスマスコンサート', date: '2025-12-24', location: '市民ホール' },
    { title: '新年会', date: '2026-01-11', location: '中央公民館' },
  ];

  let firstEventId = '';

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const titleInput = page.locator('input[type="text"]').first();
    const dateInput = page.locator('input[type="date"]');
    const locationInput = page.locator('input[placeholder*="場所"]');

    await titleInput.fill(event.title);
    await dateInput.fill(event.date);
    if (await locationInput.isVisible()) {
      await locationInput.fill(event.location);
    }
    await page.click('button:has-text("イベントを追加")');
    await page.waitForTimeout(500);

    // 最初のイベントIDを取得（リストから）
    if (i === 0) {
      await page.waitForTimeout(1000);
      // イベントリストのリンクからIDを取得
      const eventLink = page.locator('a[href*="/events/"]').first();
      const href = await eventLink.getAttribute('href');
      firstEventId = href?.split('/events/').pop()?.split('/')[0] || '';
    }

    console.log(`   ${event.title} (${event.date})`);
  }

  console.log(`   最初のイベントID: ${firstEventId}`);

  // 4. 出欠を登録（いくつかのサンプル）
  console.log('4. サンプル出欠を登録中...');

  // 最初のイベントに移動
  if (firstEventId) {
    await page.goto(`${BASE_URL}/${orgId}/events/${firstEventId}/register`);
    await page.waitForLoadState('networkidle');

    // グループを選択して出欠登録（いくつかのサンプル）
    const groupSelect = page.locator('select').first();
    if (await groupSelect.isVisible()) {
      // フルートグループを選択
      await groupSelect.selectOption({ index: 1 });
      await page.waitForTimeout(500);

      // メンバーを選択して出欠登録
      const memberSelect = page.locator('select').nth(1);
      if (await memberSelect.isVisible()) {
        await memberSelect.selectOption({ index: 1 });
        await page.waitForTimeout(300);

        // 参加ボタンをクリック
        const attendButton = page.locator('button:has-text("◯")').first();
        if (await attendButton.isVisible()) {
          await attendButton.click();
          await page.waitForTimeout(500);
        }
      }
    }
    console.log('   サンプル出欠を登録しました');
  }

  // 完了メッセージ
  console.log('\n========================================');
  console.log('テストデータの作成が完了しました！');
  console.log('========================================');
  console.log(`\n団体ID: ${orgId}`);
  console.log(`イベントID: ${firstEventId}`);
  console.log('\n次のステップ:');
  console.log('1. e2e/capture-screenshots.spec.ts の TEST_ORG_ID と TEST_EVENT_ID を更新');
  console.log('2. npm run capture-screenshots を実行');
  console.log('========================================\n');

  // ブラウザを閉じる
  await browser.close();

  return { orgId, firstEventId };
}

// 直接実行された場合
seedTestData().catch(console.error);
