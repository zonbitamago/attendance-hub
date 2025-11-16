import { createOrganization } from '@/lib/organization-service';
import { createGroup, getAllGroups } from '@/lib/group-service';
import { createMember, getAllMembers } from '@/lib/member-service';
import { createEventDate, getAllEventDates } from '@/lib/event-service';
import { createAttendance, getAllAttendances } from '@/lib/attendance-service';
import { clearAllData } from '@/lib/storage';

describe('Data Isolation Integration Test', () => {
  beforeEach(() => {
    // 各テスト前にすべてのデータをクリア
    clearAllData();
  });

  afterEach(() => {
    // テスト後もクリーンアップ
    clearAllData();
  });

  it('should isolate data between two different organizations', async () => {
    // 団体1を作成
    const org1 = await createOrganization({
      name: '団体A',
      description: 'テスト団体A',
    });

    // 団体2を作成
    const org2 = await createOrganization({
      name: '団体B',
      description: 'テスト団体B',
    });

    // 団体1にグループを追加
    const group1 = await createGroup(org1.id, {
      name: 'グループA1',
      order: 1,
      color: '#FF0000',
    });

    // 団体2にグループを追加
    const group2 = await createGroup(org2.id, {
      name: 'グループB1',
      order: 1,
      color: '#0000FF',
    });

    // 団体1のグループは団体1からのみ見える
    const org1Groups = await getAllGroups(org1.id);
    expect(org1Groups).toHaveLength(1);
    expect(org1Groups[0].id).toBe(group1.id);
    expect(org1Groups[0].name).toBe('グループA1');

    // 団体2のグループは団体2からのみ見える
    const org2Groups = await getAllGroups(org2.id);
    expect(org2Groups).toHaveLength(1);
    expect(org2Groups[0].id).toBe(group2.id);
    expect(org2Groups[0].name).toBe('グループB1');
  });

  it('should isolate members between organizations', async () => {
    // 団体を作成
    const org1 = await createOrganization({ name: '団体A' });
    const org2 = await createOrganization({ name: '団体B' });

    // 各団体にグループを作成
    const group1 = await createGroup(org1.id, { name: 'グループA', order: 1, color: '#FF0000' });
    const group2 = await createGroup(org2.id, { name: 'グループB', order: 1, color: '#0000FF' });

    // 団体1にメンバーを追加
    const member1 = await createMember(org1.id, {
      name: 'メンバーA',
      groupId: group1.id,
    });

    // 団体2にメンバーを追加
    const member2 = await createMember(org2.id, {
      name: 'メンバーB',
      groupId: group2.id,
    });

    // データ分離を確認
    const org1Members = await getAllMembers(org1.id);
    expect(org1Members).toHaveLength(1);
    expect(org1Members[0].name).toBe('メンバーA');

    const org2Members = await getAllMembers(org2.id);
    expect(org2Members).toHaveLength(1);
    expect(org2Members[0].name).toBe('メンバーB');
  });

  it('should isolate events between organizations', async () => {
    const org1 = await createOrganization({ name: '団体A' });
    const org2 = await createOrganization({ name: '団体B' });

    // 団体1にイベントを追加
    const event1 = await createEventDate(org1.id, {
      title: 'イベントA',
      date: '2025-01-10',
    });

    // 団体2にイベントを追加
    const event2 = await createEventDate(org2.id, {
      title: 'イベントB',
      date: '2025-01-11',
    });

    // データ分離を確認
    const org1Events = await getAllEventDates(org1.id);
    expect(org1Events).toHaveLength(1);
    expect(org1Events[0].title).toBe('イベントA');

    const org2Events = await getAllEventDates(org2.id);
    expect(org2Events).toHaveLength(1);
    expect(org2Events[0].title).toBe('イベントB');
  });

  it('should isolate attendances between organizations', async () => {
    const org1 = await createOrganization({ name: '団体A' });
    const org2 = await createOrganization({ name: '団体B' });

    // セットアップ: グループ、メンバー、イベントを作成
    const group1 = await createGroup(org1.id, { name: 'グループA', order: 1, color: '#FF0000' });
    const group2 = await createGroup(org2.id, { name: 'グループB', order: 1, color: '#0000FF' });

    const member1 = await createMember(org1.id, { name: 'メンバーA', groupId: group1.id });
    const member2 = await createMember(org2.id, { name: 'メンバーB', groupId: group2.id });

    const event1 = await createEventDate(org1.id, { title: 'イベントA', date: '2025-01-10' });
    const event2 = await createEventDate(org2.id, { title: 'イベントB', date: '2025-01-11' });

    // 出欠記録を作成
    const attendance1 = await createAttendance(org1.id, {
      eventDateId: event1.id,
      memberId: member1.id,
      status: '◯',
    });

    const attendance2 = await createAttendance(org2.id, {
      eventDateId: event2.id,
      memberId: member2.id,
      status: '✗',
    });

    // データ分離を確認
    const org1Attendances = await getAllAttendances(org1.id);
    expect(org1Attendances).toHaveLength(1);
    expect(org1Attendances[0].status).toBe('◯');

    const org2Attendances = await getAllAttendances(org2.id);
    expect(org2Attendances).toHaveLength(1);
    expect(org2Attendances[0].status).toBe('✗');
  });

  it('should maintain data isolation with multiple entities', async () => {
    // より複雑なシナリオ: 2つの団体で複数のエンティティを作成
    const org1 = await createOrganization({ name: '音楽サークル' });
    const org2 = await createOrganization({ name: 'スポーツクラブ' });

    // 団体1: 3グループ、5メンバー、2イベント
    const org1Groups = [
      await createGroup(org1.id, { name: 'ボーカル', order: 1, color: '#FF0000' }),
      await createGroup(org1.id, { name: 'ギター', order: 2, color: '#00FF00' }),
      await createGroup(org1.id, { name: 'ドラム', order: 3, color: '#0000FF' }),
    ];

    for (const group of org1Groups) {
      await createMember(org1.id, { name: `${group.name}メンバー1`, groupId: group.id });
      await createMember(org1.id, { name: `${group.name}メンバー2`, groupId: group.id });
    }

    const org1Event1 = await createEventDate(org1.id, { title: 'ライブ練習', date: '2025-01-15' });
    const org1Event2 = await createEventDate(org1.id, { title: '本番ライブ', date: '2025-01-20' });

    // 団体2: 2グループ、4メンバー、3イベント
    const org2Groups = [
      await createGroup(org2.id, { name: 'サッカー', order: 1, color: '#FFFF00' }),
      await createGroup(org2.id, { name: 'バスケ', order: 2, color: '#FF00FF' }),
    ];

    for (const group of org2Groups) {
      await createMember(org2.id, { name: `${group.name}選手1`, groupId: group.id });
      await createMember(org2.id, { name: `${group.name}選手2`, groupId: group.id });
    }

    const org2Event1 = await createEventDate(org2.id, { title: '練習試合', date: '2025-01-12' });
    const org2Event2 = await createEventDate(org2.id, { title: '大会予選', date: '2025-01-18' });
    const org2Event3 = await createEventDate(org2.id, { title: '大会決勝', date: '2025-01-25' });

    // 検証: 各団体のデータ数が正しいこと
    expect(await getAllGroups(org1.id)).toHaveLength(3);
    expect(await getAllGroups(org2.id)).toHaveLength(2);

    expect(await getAllMembers(org1.id)).toHaveLength(6); // 3グループ × 2メンバー
    expect(await getAllMembers(org2.id)).toHaveLength(4); // 2グループ × 2メンバー

    expect(await getAllEventDates(org1.id)).toHaveLength(2);
    expect(await getAllEventDates(org2.id)).toHaveLength(3);

    // 検証: グループ名が正しく分離されていること
    const org1GroupNames = (await getAllGroups(org1.id)).map((g) => g.name);
    expect(org1GroupNames).toContain('ボーカル');
    expect(org1GroupNames).toContain('ギター');
    expect(org1GroupNames).not.toContain('サッカー');

    const org2GroupNames = (await getAllGroups(org2.id)).map((g) => g.name);
    expect(org2GroupNames).toContain('サッカー');
    expect(org2GroupNames).toContain('バスケ');
    expect(org2GroupNames).not.toContain('ボーカル');
  });

  it('should handle edge case: organization with no data', async () => {
    const org1 = await createOrganization({ name: '団体A' });
    const org2 = await createOrganization({ name: '団体B' });

    // 団体1にのみデータを追加
    await createGroup(org1.id, { name: 'グループA', order: 1, color: '#FF0000' });

    // 団体2はデータなし
    expect(await getAllGroups(org2.id)).toHaveLength(0);
    expect(await getAllMembers(org2.id)).toHaveLength(0);
    expect(await getAllEventDates(org2.id)).toHaveLength(0);
    expect(await getAllAttendances(org2.id)).toHaveLength(0);
  });
});
