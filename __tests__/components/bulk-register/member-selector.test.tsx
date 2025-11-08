import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberSelector } from '@/components/bulk-register/member-selector';
import { loadGroups, loadMembers } from '@/lib/storage';
import type { Group, Member } from '@/types';

// storage モジュールをモック
jest.mock('@/lib/storage');

describe('MemberSelector', () => {
  const mockLoadGroups = loadGroups as jest.MockedFunction<typeof loadGroups>;
  const mockLoadMembers = loadMembers as jest.MockedFunction<typeof loadMembers>;

  const mockGroups: Group[] = [
    { id: 'group-1', name: 'トランペット', order: 1, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'group-2', name: 'トロンボーン', order: 2, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'group-3', name: 'ホルン', order: 3, createdAt: '2025-01-01T00:00:00Z' },
  ];

  const mockMembers: Member[] = [
    { id: 'member-1', groupId: 'group-1', name: '田中太郎', createdAt: '2025-01-01T00:00:00Z' },
    { id: 'member-2', groupId: 'group-1', name: '佐藤花子', createdAt: '2025-01-01T00:00:00Z' },
    { id: 'member-3', groupId: 'group-2', name: '鈴木一郎', createdAt: '2025-01-01T00:00:00Z' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadGroups.mockReturnValue(mockGroups);
    mockLoadMembers.mockReturnValue(mockMembers);
  });

  describe('Test Case 1: グループ選択が動作する', () => {
    it('グループ一覧を表示する', () => {
      const onSelect = jest.fn();

      render(<MemberSelector onSelect={onSelect} />);

      // グループ選択のラベルが表示される
      expect(screen.getByText('グループを選択')).toBeInTheDocument();

      // グループドロップダウンが表示される
      const groupSelect = screen.getByRole('combobox', { name: /グループ/i });
      expect(groupSelect).toBeInTheDocument();

      // プレースホルダーが表示される
      expect(screen.getByText('グループを選んでください')).toBeInTheDocument();
    });

    it('グループを選択すると、選択されたグループIDが保存される', async () => {
      const user = userEvent.setup();
      const onSelect = jest.fn();

      render(<MemberSelector onSelect={onSelect} />);

      const groupSelect = screen.getByRole('combobox', { name: /グループ/i });

      // グループを選択
      await user.selectOptions(groupSelect, 'group-1');

      expect(groupSelect).toHaveValue('group-1');
    });
  });

  describe('Test Case 2: メンバー選択が動作する', () => {
    it('グループ選択後、そのグループのメンバー一覧が表示される', async () => {
      const user = userEvent.setup();
      const onSelect = jest.fn();

      render(<MemberSelector onSelect={onSelect} />);

      const groupSelect = screen.getByRole('combobox', { name: /グループ/i });

      // グループを選択
      await user.selectOptions(groupSelect, 'group-1');

      // メンバー選択が表示される
      const memberSelect = screen.getByRole('combobox', { name: /メンバー/i });
      expect(memberSelect).toBeInTheDocument();

      // グループ1のメンバーのみが表示される
      expect(screen.getByText('田中太郎')).toBeInTheDocument();
      expect(screen.getByText('佐藤花子')).toBeInTheDocument();
      expect(screen.queryByText('鈴木一郎')).not.toBeInTheDocument();
    });

    it('メンバーを選択すると、onSelectコールバックが呼ばれる', async () => {
      const user = userEvent.setup();
      const onSelect = jest.fn();

      render(<MemberSelector onSelect={onSelect} />);

      // グループを選択
      const groupSelect = screen.getByRole('combobox', { name: /グループ/i });
      await user.selectOptions(groupSelect, 'group-1');

      // メンバーを選択
      const memberSelect = screen.getByRole('combobox', { name: /メンバー/i });
      await user.selectOptions(memberSelect, 'member-1');

      expect(onSelect).toHaveBeenCalledWith({
        groupId: 'group-1',
        memberId: 'member-1',
        memberName: '田中太郎',
      });
    });
  });

  describe('Test Case 3: 新規メンバー作成', () => {
    it('「新しいメンバーを追加」を選択すると、名前入力フィールドが表示される', async () => {
      const user = userEvent.setup();
      const onSelect = jest.fn();

      render(<MemberSelector onSelect={onSelect} />);

      // グループを選択
      const groupSelect = screen.getByRole('combobox', { name: /グループ/i });
      await user.selectOptions(groupSelect, 'group-1');

      // メンバー選択で「新しいメンバーを追加」を選択
      const memberSelect = screen.getByRole('combobox', { name: /メンバー/i });
      await user.selectOptions(memberSelect, '__new__');

      // 新規メンバー名入力フィールドが表示される
      const nameInput = screen.getByRole('textbox', { name: /名前/i });
      expect(nameInput).toBeInTheDocument();
      expect(nameInput).toHaveFocus();
    });

    it('新規メンバー名を入力すると、onSelectコールバックが呼ばれる', async () => {
      const user = userEvent.setup();
      const onSelect = jest.fn();

      render(<MemberSelector onSelect={onSelect} />);

      // グループを選択
      const groupSelect = screen.getByRole('combobox', { name: /グループ/i });
      await user.selectOptions(groupSelect, 'group-1');

      // 「新しいメンバーを追加」を選択
      const memberSelect = screen.getByRole('combobox', { name: /メンバー/i });
      await user.selectOptions(memberSelect, '__new__');

      // 新規メンバー名を入力
      const nameInput = screen.getByRole('textbox', { name: /名前/i });
      await user.type(nameInput, '山田太郎');

      // onSelectが新規メンバー情報で呼ばれる
      expect(onSelect).toHaveBeenCalledWith({
        groupId: 'group-1',
        memberId: null,
        memberName: '山田太郎',
      });
    });
  });
});
