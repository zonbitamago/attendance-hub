import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyRegisterPage from '@/app/my-register/page';
import { loadGroups, loadMembers, loadEventDates, loadAttendances, saveAttendances } from '@/lib/storage';
import { saveMember } from '@/lib/member-service';
import type { Group, Member, EventDate } from '@/types';

// storage モジュールとmember-serviceをモック
jest.mock('@/lib/storage');
jest.mock('@/lib/member-service', () => ({
  saveMember: jest.fn(),
}));

// next/navigation をモック
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('MyRegisterPage', () => {
  const mockLoadGroups = loadGroups as jest.MockedFunction<typeof loadGroups>;
  const mockLoadMembers = loadMembers as jest.MockedFunction<typeof loadMembers>;
  const mockLoadEventDates = loadEventDates as jest.MockedFunction<typeof loadEventDates>;
  const mockLoadAttendances = loadAttendances as jest.MockedFunction<typeof loadAttendances>;
  const mockSaveAttendances = saveAttendances as jest.MockedFunction<typeof saveAttendances>;
  const mockSaveMember = saveMember as jest.MockedFunction<typeof saveMember>;

  const mockGroups: Group[] = [
    { id: 'group-1', organizationId: 'test-org-id', name: 'トランペット', order: 1, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'group-2', organizationId: 'test-org-id', name: 'トロンボーン', order: 2, createdAt: '2025-01-01T00:00:00Z' },
  ];

  const mockMembers: Member[] = [
    { id: 'member-1', organizationId: 'test-org-id', groupId: 'group-1', name: '田中太郎', createdAt: '2025-01-01T00:00:00Z' },
    { id: 'member-2', organizationId: 'test-org-id', groupId: 'group-1', name: '佐藤花子', createdAt: '2025-01-01T00:00:00Z' },
  ];

  const mockEventDates: EventDate[] = [
    {
      id: 'event-1',
      organizationId: 'test-org-id',
      date: '2025-01-15',
      title: '定期演奏会',
      location: '市民ホール',
      createdAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'event-2',
      organizationId: 'test-org-id',
      date: '2025-01-22',
      title: '通常練習',
      location: '練習場A',
      createdAt: '2025-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadGroups.mockReturnValue(mockGroups);
    mockLoadMembers.mockReturnValue(mockMembers);
    mockLoadEventDates.mockReturnValue(mockEventDates);
    mockLoadAttendances.mockReturnValue([]);
    mockSaveAttendances.mockReturnValue(true);
    mockSaveMember.mockReturnValue({
      id: 'new-member-id',
      organizationId: 'test-org-id',
      groupId: 'group-1',
      name: '山田太郎',
      createdAt: '2025-01-01T00:00:00Z',
    });
  });

  describe('ページ全体の統合', () => {
    it('ページタイトルが表示される', () => {
      render(<MyRegisterPage />);

      expect(screen.getByRole('heading', { name: /一括出欠登録/ })).toBeInTheDocument();
    });

    it('MemberSelectorが表示される', () => {
      render(<MyRegisterPage />);

      // MemberSelector
      expect(screen.getByText('グループを選択')).toBeInTheDocument();

      // 最初は登録ボタンは表示されない（メンバーとイベント選択後に表示）
      expect(screen.queryByRole('button', { name: /登録/ })).not.toBeInTheDocument();
    });

    it('メンバーとイベントを選択して一括登録できる', async () => {
      const user = userEvent.setup();

      render(<MyRegisterPage />);

      // グループを選択
      const groupSelect = screen.getByRole('combobox', { name: /グループ/i });
      await user.selectOptions(groupSelect, 'group-1');

      // メンバーを選択
      const memberSelect = screen.getByRole('combobox', { name: /メンバー/i });
      await user.selectOptions(memberSelect, 'member-1');

      // イベントを選択
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]); // event-1
      await user.click(checkboxes[1]); // event-2

      // 各イベントにデフォルトステータス（◯）が設定されている

      // 一括登録ボタンをクリック
      const submitButton = screen.getByRole('button', { name: /登録/ });
      await user.click(submitButton);

      // saveAttendancesが呼ばれることを確認
      await waitFor(() => {
        expect(mockSaveAttendances).toHaveBeenCalled();
      });

      // 成功メッセージが表示される
      expect(screen.getByText(/登録しました/)).toBeInTheDocument();
    });

    it('登録ボタンはメンバーとイベント選択後にのみ表示される', async () => {
      const user = userEvent.setup();

      render(<MyRegisterPage />);

      // 最初は登録ボタンが表示されない
      expect(screen.queryByRole('button', { name: /登録/ })).not.toBeInTheDocument();

      // グループを選択
      const groupSelect = screen.getByRole('combobox', { name: /グループ/i });
      await user.selectOptions(groupSelect, 'group-1');

      // メンバーを選択
      const memberSelect = screen.getByRole('combobox', { name: /メンバー/i });
      await user.selectOptions(memberSelect, 'member-1');

      // まだ登録ボタンは表示されない（イベント未選択）
      expect(screen.queryByRole('button', { name: /登録/ })).not.toBeInTheDocument();

      // イベントを選択
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);

      // 登録ボタンが表示される
      expect(screen.getByRole('button', { name: /登録/ })).toBeInTheDocument();
    });

    it('新規メンバーを作成して一括登録できる', async () => {
      const user = userEvent.setup();

      render(<MyRegisterPage />);

      // グループを選択
      const groupSelect = screen.getByRole('combobox', { name: /グループ/i });
      await user.selectOptions(groupSelect, 'group-1');

      // 「新しいメンバーを追加」を選択
      const memberSelect = screen.getByRole('combobox', { name: /メンバー/i });
      await user.selectOptions(memberSelect, '__new__');

      // 新規メンバー名を入力
      const nameInput = screen.getByRole('textbox', { name: /名前/i });
      await user.type(nameInput, '山田太郎');

      // イベントを選択
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);

      // デフォルトステータス（◯）が自動設定される

      // 一括登録ボタンをクリック
      const submitButton = screen.getByRole('button', { name: /登録/ });
      await user.click(submitButton);

      // saveAttendancesが呼ばれることを確認
      await waitFor(() => {
        expect(mockSaveAttendances).toHaveBeenCalled();
      });
    });

    it('各イベントに異なるステータスを設定して一括登録できる (User Story 3)', async () => {
      const user = userEvent.setup();

      render(<MyRegisterPage />);

      // グループを選択
      const groupSelect = screen.getByRole('combobox', { name: /グループ/i });
      await user.selectOptions(groupSelect, 'group-1');

      // メンバーを選択
      const memberSelect = screen.getByRole('combobox', { name: /メンバー/i });
      await user.selectOptions(memberSelect, 'member-1');

      // イベントを選択
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]); // event-1
      await user.click(checkboxes[1]); // event-2

      // 各イベントに異なるステータスを設定
      // IDで直接取得
      const statusEvent1 = document.querySelector('#status-event-1') as HTMLSelectElement;
      const statusEvent2 = document.querySelector('#status-event-2') as HTMLSelectElement;

      expect(statusEvent1).toBeInTheDocument();
      expect(statusEvent2).toBeInTheDocument();

      await user.selectOptions(statusEvent1, '◯');
      await user.selectOptions(statusEvent2, '✗');

      // 一括登録ボタンをクリック
      const submitButton = screen.getByRole('button', { name: /登録/ });
      await user.click(submitButton);

      // saveAttendancesが呼ばれることを確認
      await waitFor(() => {
        expect(mockSaveAttendances).toHaveBeenCalled();
      });

      // 成功メッセージが表示される（個別ステータスで2件登録）
      expect(screen.getByText(/登録しました/)).toBeInTheDocument();
    });
  });
});
