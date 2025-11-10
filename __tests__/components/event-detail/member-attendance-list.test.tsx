import { render, screen } from '@testing-library/react';
import { MemberAttendanceList } from '@/components/event-detail/member-attendance-list';
import type { MemberAttendanceDetail } from '@/types';

describe('MemberAttendanceList', () => {
  describe('Test Case 1: メンバー名とステータスの表示', () => {
    it('登録済みメンバーのリストを名前とステータス記号で表示する', () => {
      const mockDetails: MemberAttendanceDetail[] = [
        {
          memberId: 'member-1',
          memberName: 'やまだたろう',
          groupId: 'group-1',
          groupName: '打',
          status: '◯',
          hasRegistered: true,
          memberCreatedAt: '2025-01-01T00:00:00.000Z',
        },
        {
          memberId: 'member-2',
          memberName: 'すずきはなこ',
          groupId: 'group-1',
          groupName: '打',
          status: '△',
          hasRegistered: true,
          memberCreatedAt: '2025-01-02T00:00:00.000Z',
        },
        {
          memberId: 'member-3',
          memberName: 'さとうけんじ',
          groupId: 'group-1',
          groupName: '打',
          status: '✗',
          hasRegistered: true,
          memberCreatedAt: '2025-01-03T00:00:00.000Z',
        },
      ];

      render(<MemberAttendanceList members={mockDetails} />);

      // 各メンバーの名前が表示されること
      expect(screen.getByText('やまだたろう')).toBeInTheDocument();
      expect(screen.getByText('すずきはなこ')).toBeInTheDocument();
      expect(screen.getByText('さとうけんじ')).toBeInTheDocument();

      // 各メンバーのステータスが表示されること
      expect(screen.getByText('◯')).toBeInTheDocument();
      expect(screen.getByText('△')).toBeInTheDocument();
      expect(screen.getByText('✗')).toBeInTheDocument();
    });
  });

  describe('Test Case 2: 未登録メンバーの表示', () => {
    it('未登録メンバーが「-」と表示される', () => {
      const mockDetails: MemberAttendanceDetail[] = [
        {
          memberId: 'member-1',
          memberName: 'やまだたろう',
          groupId: 'group-1',
          groupName: '打',
          status: null,
          hasRegistered: false,
          memberCreatedAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      render(<MemberAttendanceList members={mockDetails} />);

      // メンバー名が表示されること
      expect(screen.getByText('やまだたろう')).toBeInTheDocument();

      // 未登録なので「-」が表示されること
      expect(screen.getByText('-')).toBeInTheDocument();
    });
  });

  describe('Test Case 3: 空の状態メッセージ', () => {
    it('メンバーが0人の場合「メンバーがいません」と表示される', () => {
      const mockDetails: MemberAttendanceDetail[] = [];

      const { container } = render(<MemberAttendanceList members={mockDetails} />);

      // 空配列の場合、メッセージが表示されること
      expect(screen.getByText('メンバーがいません')).toBeInTheDocument();

      // リストは表示されないこと
      expect(container.querySelector('ul')).not.toBeInTheDocument();
    });
  });

  describe('Test Case 4: 参加のみフィルタ', () => {
    it('filterStatus="attending"の場合、◯ステータスのメンバーのみ表示される', () => {
      const mockDetails: MemberAttendanceDetail[] = [
        {
          memberId: 'member-1',
          memberName: 'やまだたろう',
          groupId: 'group-1',
          groupName: '打',
          status: '◯',
          hasRegistered: true,
          memberCreatedAt: '2025-01-01T00:00:00.000Z',
        },
        {
          memberId: 'member-2',
          memberName: 'すずきはなこ',
          groupId: 'group-1',
          groupName: '打',
          status: '△',
          hasRegistered: true,
          memberCreatedAt: '2025-01-02T00:00:00.000Z',
        },
        {
          memberId: 'member-3',
          memberName: 'さとうけんじ',
          groupId: 'group-1',
          groupName: '打',
          status: '✗',
          hasRegistered: true,
          memberCreatedAt: '2025-01-03T00:00:00.000Z',
        },
        {
          memberId: 'member-4',
          memberName: 'たなかゆい',
          groupId: 'group-1',
          groupName: '打',
          status: null,
          hasRegistered: false,
          memberCreatedAt: '2025-01-04T00:00:00.000Z',
        },
      ];

      render(<MemberAttendanceList members={mockDetails} filterStatus="attending" />);

      // ◯ステータスのメンバーのみ表示されること
      expect(screen.getByText('やまだたろう')).toBeInTheDocument();

      // △、✗、未登録のメンバーは表示されないこと
      expect(screen.queryByText('すずきはなこ')).not.toBeInTheDocument();
      expect(screen.queryByText('さとうけんじ')).not.toBeInTheDocument();
      expect(screen.queryByText('たなかゆい')).not.toBeInTheDocument();
    });
  });

  describe('Test Case 5: 未定のみフィルタ', () => {
    it('filterStatus="maybe"の場合、△ステータスのメンバーのみ表示される', () => {
      const mockDetails: MemberAttendanceDetail[] = [
        {
          memberId: 'member-1',
          memberName: 'やまだたろう',
          groupId: 'group-1',
          groupName: '打',
          status: '◯',
          hasRegistered: true,
          memberCreatedAt: '2025-01-01T00:00:00.000Z',
        },
        {
          memberId: 'member-2',
          memberName: 'すずきはなこ',
          groupId: 'group-1',
          groupName: '打',
          status: '△',
          hasRegistered: true,
          memberCreatedAt: '2025-01-02T00:00:00.000Z',
        },
        {
          memberId: 'member-3',
          memberName: 'さとうけんじ',
          groupId: 'group-1',
          groupName: '打',
          status: '✗',
          hasRegistered: true,
          memberCreatedAt: '2025-01-03T00:00:00.000Z',
        },
        {
          memberId: 'member-4',
          memberName: 'たなかゆい',
          groupId: 'group-1',
          groupName: '打',
          status: null,
          hasRegistered: false,
          memberCreatedAt: '2025-01-04T00:00:00.000Z',
        },
      ];

      render(<MemberAttendanceList members={mockDetails} filterStatus="maybe" />);

      // △ステータスのメンバーのみ表示されること
      expect(screen.getByText('すずきはなこ')).toBeInTheDocument();

      // ◯、✗、未登録のメンバーは表示されないこと
      expect(screen.queryByText('やまだたろう')).not.toBeInTheDocument();
      expect(screen.queryByText('さとうけんじ')).not.toBeInTheDocument();
      expect(screen.queryByText('たなかゆい')).not.toBeInTheDocument();
    });
  });

  describe('Test Case 6: 欠席のみフィルタ', () => {
    it('filterStatus="notAttending"の場合、✗ステータスのメンバーのみ表示される', () => {
      const mockDetails: MemberAttendanceDetail[] = [
        {
          memberId: 'member-1',
          memberName: 'やまだたろう',
          groupId: 'group-1',
          groupName: '打',
          status: '◯',
          hasRegistered: true,
          memberCreatedAt: '2025-01-01T00:00:00.000Z',
        },
        {
          memberId: 'member-2',
          memberName: 'すずきはなこ',
          groupId: 'group-1',
          groupName: '打',
          status: '△',
          hasRegistered: true,
          memberCreatedAt: '2025-01-02T00:00:00.000Z',
        },
        {
          memberId: 'member-3',
          memberName: 'さとうけんじ',
          groupId: 'group-1',
          groupName: '打',
          status: '✗',
          hasRegistered: true,
          memberCreatedAt: '2025-01-03T00:00:00.000Z',
        },
        {
          memberId: 'member-4',
          memberName: 'たなかゆい',
          groupId: 'group-1',
          groupName: '打',
          status: null,
          hasRegistered: false,
          memberCreatedAt: '2025-01-04T00:00:00.000Z',
        },
      ];

      render(<MemberAttendanceList members={mockDetails} filterStatus="notAttending" />);

      // ✗ステータスのメンバーのみ表示されること
      expect(screen.getByText('さとうけんじ')).toBeInTheDocument();

      // ◯、△、未登録のメンバーは表示されないこと
      expect(screen.queryByText('やまだたろう')).not.toBeInTheDocument();
      expect(screen.queryByText('すずきはなこ')).not.toBeInTheDocument();
      expect(screen.queryByText('たなかゆい')).not.toBeInTheDocument();
    });
  });

  describe('Test Case 7: 未登録のみフィルタ', () => {
    it('filterStatus="unregistered"の場合、未登録メンバー（status=null）のみ表示される', () => {
      const mockDetails: MemberAttendanceDetail[] = [
        {
          memberId: 'member-1',
          memberName: 'やまだたろう',
          groupId: 'group-1',
          groupName: '打',
          status: '◯',
          hasRegistered: true,
          memberCreatedAt: '2025-01-01T00:00:00.000Z',
        },
        {
          memberId: 'member-2',
          memberName: 'すずきはなこ',
          groupId: 'group-1',
          groupName: '打',
          status: '△',
          hasRegistered: true,
          memberCreatedAt: '2025-01-02T00:00:00.000Z',
        },
        {
          memberId: 'member-3',
          memberName: 'さとうけんじ',
          groupId: 'group-1',
          groupName: '打',
          status: '✗',
          hasRegistered: true,
          memberCreatedAt: '2025-01-03T00:00:00.000Z',
        },
        {
          memberId: 'member-4',
          memberName: 'たなかゆい',
          groupId: 'group-1',
          groupName: '打',
          status: null,
          hasRegistered: false,
          memberCreatedAt: '2025-01-04T00:00:00.000Z',
        },
      ];

      render(<MemberAttendanceList members={mockDetails} filterStatus="unregistered" />);

      // 未登録メンバーのみ表示されること
      expect(screen.getByText('たなかゆい')).toBeInTheDocument();

      // ◯、△、✗のメンバーは表示されないこと
      expect(screen.queryByText('やまだたろう')).not.toBeInTheDocument();
      expect(screen.queryByText('すずきはなこ')).not.toBeInTheDocument();
      expect(screen.queryByText('さとうけんじ')).not.toBeInTheDocument();
    });
  });

  describe('Test Case 8: フィルタ結果が0件の場合の空メッセージ', () => {
    it('フィルタを適用して0件になった場合「条件に該当するメンバーがいません」と表示される', () => {
      const mockDetails: MemberAttendanceDetail[] = [
        {
          memberId: 'member-1',
          memberName: 'やまだたろう',
          groupId: 'group-1',
          groupName: '打',
          status: '◯',
          hasRegistered: true,
          memberCreatedAt: '2025-01-01T00:00:00.000Z',
        },
        {
          memberId: 'member-2',
          memberName: 'すずきはなこ',
          groupId: 'group-1',
          groupName: '打',
          status: '△',
          hasRegistered: true,
          memberCreatedAt: '2025-01-02T00:00:00.000Z',
        },
      ];

      // 「未登録のみ」フィルタを適用（該当者なし）
      const { container } = render(<MemberAttendanceList members={mockDetails} filterStatus="unregistered" />);

      // 空メッセージが表示されること
      expect(screen.getByText('条件に該当するメンバーがいません')).toBeInTheDocument();

      // リストは表示されないこと
      expect(container.querySelector('ul')).not.toBeInTheDocument();
    });
  });

  describe('Test Case 9: 名前順ソート', () => {
    it('sortBy="name"の場合、メンバーが名前順（五十音順/アルファベット順）で表示される', () => {
      const mockDetails: MemberAttendanceDetail[] = [
        {
          memberId: 'member-1',
          memberName: 'たなかゆい',
          groupId: 'group-1',
          groupName: '打',
          status: '◯',
          hasRegistered: true,
          memberCreatedAt: '2025-01-03T00:00:00.000Z',
        },
        {
          memberId: 'member-2',
          memberName: 'いとうけんた',
          groupId: 'group-1',
          groupName: '打',
          status: '△',
          hasRegistered: true,
          memberCreatedAt: '2025-01-01T00:00:00.000Z',
        },
        {
          memberId: 'member-3',
          memberName: 'さとうじろう',
          groupId: 'group-1',
          groupName: '打',
          status: '✗',
          hasRegistered: true,
          memberCreatedAt: '2025-01-02T00:00:00.000Z',
        },
      ];

      render(<MemberAttendanceList members={mockDetails} sortBy="name" />);

      // メンバーが名前順で表示されること（い→さ→た）
      const memberNames = screen.getAllByText(/いとうけんた|さとうじろう|たなかゆい/);
      expect(memberNames).toHaveLength(3);
      expect(memberNames[0]).toHaveTextContent('いとうけんた');
      expect(memberNames[1]).toHaveTextContent('さとうじろう');
      expect(memberNames[2]).toHaveTextContent('たなかゆい');
    });

    it('漢字名とひらがな名が混在する場合も正しくソートされる', () => {
      const mockDetails: MemberAttendanceDetail[] = [
        {
          memberId: 'member-1',
          memberName: '田中結衣',
          groupId: 'group-1',
          groupName: '打',
          status: '◯',
          hasRegistered: true,
          memberCreatedAt: '2025-01-01T00:00:00.000Z',
        },
        {
          memberId: 'member-2',
          memberName: 'あいうえお',
          groupId: 'group-1',
          groupName: '打',
          status: '△',
          hasRegistered: true,
          memberCreatedAt: '2025-01-02T00:00:00.000Z',
        },
        {
          memberId: 'member-3',
          memberName: '伊藤健太',
          groupId: 'group-1',
          groupName: '打',
          status: '✗',
          hasRegistered: true,
          memberCreatedAt: '2025-01-03T00:00:00.000Z',
        },
        {
          memberId: 'member-4',
          memberName: '佐藤次郎',
          groupId: 'group-1',
          groupName: '打',
          status: null,
          hasRegistered: false,
          memberCreatedAt: '2025-01-04T00:00:00.000Z',
        },
      ];

      render(<MemberAttendanceList members={mockDetails} sortBy="name" />);

      // localeCompare('ja')による正しいソート順: あいうえお→伊藤健太→佐藤次郎→田中結衣
      const memberNames = screen.getAllByText(/あいうえお|伊藤健太|佐藤次郎|田中結衣/);
      expect(memberNames).toHaveLength(4);
      expect(memberNames[0]).toHaveTextContent('あいうえお');
      expect(memberNames[1]).toHaveTextContent('伊藤健太');
      expect(memberNames[2]).toHaveTextContent('佐藤次郎');
      expect(memberNames[3]).toHaveTextContent('田中結衣');
    });
  });

  describe('Test Case 10: ステータス順ソート', () => {
    it('sortBy="status"の場合、メンバーがステータス順（◯→△→✗→-）で表示される', () => {
      const mockDetails: MemberAttendanceDetail[] = [
        {
          memberId: 'member-1',
          memberName: 'いとうけんた',
          groupId: 'group-1',
          groupName: '打',
          status: '△',
          hasRegistered: true,
          memberCreatedAt: '2025-01-01T00:00:00.000Z',
        },
        {
          memberId: 'member-2',
          memberName: 'たなかゆい',
          groupId: 'group-1',
          groupName: '打',
          status: null,
          hasRegistered: false,
          memberCreatedAt: '2025-01-04T00:00:00.000Z',
        },
        {
          memberId: 'member-3',
          memberName: 'さとうじろう',
          groupId: 'group-1',
          groupName: '打',
          status: '✗',
          hasRegistered: true,
          memberCreatedAt: '2025-01-02T00:00:00.000Z',
        },
        {
          memberId: 'member-4',
          memberName: 'やまだたろう',
          groupId: 'group-1',
          groupName: '打',
          status: '◯',
          hasRegistered: true,
          memberCreatedAt: '2025-01-03T00:00:00.000Z',
        },
      ];

      render(<MemberAttendanceList members={mockDetails} sortBy="status" />);

      // メンバーがステータス順で表示されること（◯→△→✗→-）
      const memberNames = screen.getAllByText(/やまだたろう|いとうけんた|さとうじろう|たなかゆい/);
      expect(memberNames).toHaveLength(4);
      expect(memberNames[0]).toHaveTextContent('やまだたろう'); // ◯
      expect(memberNames[1]).toHaveTextContent('いとうけんた'); // △
      expect(memberNames[2]).toHaveTextContent('さとうじろう'); // ✗
      expect(memberNames[3]).toHaveTextContent('たなかゆい'); // -（未登録）
    });
  });

  describe('Test Case 11: 検索フィルタリング', () => {
    it('searchQuery=""の場合、全てのメンバーが表示される', () => {
      const mockDetails: MemberAttendanceDetail[] = [
        {
          memberId: 'member-1',
          memberName: 'やまだたろう',
          groupId: 'group-1',
          groupName: '打',
          status: '◯',
          hasRegistered: true,
          memberCreatedAt: '2025-01-01T00:00:00.000Z',
        },
        {
          memberId: 'member-2',
          memberName: 'すずきはなこ',
          groupId: 'group-1',
          groupName: '打',
          status: '△',
          hasRegistered: true,
          memberCreatedAt: '2025-01-02T00:00:00.000Z',
        },
      ];

      render(<MemberAttendanceList members={mockDetails} searchQuery="" />);

      // 全てのメンバーが表示されること
      expect(screen.getByText('やまだたろう')).toBeInTheDocument();
      expect(screen.getByText('すずきはなこ')).toBeInTheDocument();
    });

    it('searchQueryに一致するメンバーのみが表示される（部分一致）', () => {
      const mockDetails: MemberAttendanceDetail[] = [
        {
          memberId: 'member-1',
          memberName: 'やまだたろう',
          groupId: 'group-1',
          groupName: '打',
          status: '◯',
          hasRegistered: true,
          memberCreatedAt: '2025-01-01T00:00:00.000Z',
        },
        {
          memberId: 'member-2',
          memberName: 'すずきはなこ',
          groupId: 'group-1',
          groupName: '打',
          status: '△',
          hasRegistered: true,
          memberCreatedAt: '2025-01-02T00:00:00.000Z',
        },
        {
          memberId: 'member-3',
          memberName: 'やまもとじろう',
          groupId: 'group-1',
          groupName: '打',
          status: '✗',
          hasRegistered: true,
          memberCreatedAt: '2025-01-03T00:00:00.000Z',
        },
      ];

      render(<MemberAttendanceList members={mockDetails} searchQuery="やま" />);

      // 「やま」を含むメンバーのみが表示されること
      expect(screen.getByText('やまだたろう')).toBeInTheDocument();
      expect(screen.getByText('やまもとじろう')).toBeInTheDocument();

      // 「やま」を含まないメンバーは表示されないこと
      expect(screen.queryByText('すずきはなこ')).not.toBeInTheDocument();
    });

    it('searchQueryが大文字小文字を区別せず検索する', () => {
      const mockDetails: MemberAttendanceDetail[] = [
        {
          memberId: 'member-1',
          memberName: 'John Smith',
          groupId: 'group-1',
          groupName: '打',
          status: '◯',
          hasRegistered: true,
          memberCreatedAt: '2025-01-01T00:00:00.000Z',
        },
        {
          memberId: 'member-2',
          memberName: 'jane doe',
          groupId: 'group-1',
          groupName: '打',
          status: '△',
          hasRegistered: true,
          memberCreatedAt: '2025-01-02T00:00:00.000Z',
        },
      ];

      render(<MemberAttendanceList members={mockDetails} searchQuery="JOHN" />);

      // 大文字小文字を区別せずに検索されること
      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.queryByText('jane doe')).not.toBeInTheDocument();
    });

    it('searchQueryに一致するメンバーがいない場合、空の状態メッセージが表示される', () => {
      const mockDetails: MemberAttendanceDetail[] = [
        {
          memberId: 'member-1',
          memberName: 'やまだたろう',
          groupId: 'group-1',
          groupName: '打',
          status: '◯',
          hasRegistered: true,
          memberCreatedAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      render(<MemberAttendanceList members={mockDetails} searchQuery="存在しない名前" />);

      // 空の状態メッセージが表示されること
      expect(screen.getByText('条件に該当するメンバーがいません')).toBeInTheDocument();

      // メンバーは表示されないこと
      expect(screen.queryByText('やまだたろう')).not.toBeInTheDocument();
    });
  });

  describe('Test Case 12: 検索+フィルタ+ソートの組み合わせ', () => {
    it('検索→フィルタ→ソートの順で正しく適用される', () => {
      const mockDetails: MemberAttendanceDetail[] = [
        {
          memberId: 'member-1',
          memberName: 'やまだたろう',
          groupId: 'group-1',
          groupName: '打',
          status: '△',
          hasRegistered: true,
          memberCreatedAt: '2025-01-01T00:00:00.000Z',
        },
        {
          memberId: 'member-2',
          memberName: 'やまもとはなこ',
          groupId: 'group-1',
          groupName: '打',
          status: '◯',
          hasRegistered: true,
          memberCreatedAt: '2025-01-02T00:00:00.000Z',
        },
        {
          memberId: 'member-3',
          memberName: 'すずきじろう',
          groupId: 'group-1',
          groupName: '打',
          status: '◯',
          hasRegistered: true,
          memberCreatedAt: '2025-01-03T00:00:00.000Z',
        },
        {
          memberId: 'member-4',
          memberName: 'やまぐちゆい',
          groupId: 'group-1',
          groupName: '打',
          status: '△',
          hasRegistered: true,
          memberCreatedAt: '2025-01-04T00:00:00.000Z',
        },
      ];

      // 検索: 「やま」を含む → やまだたろう、やまもとはなこ、やまぐちゆい
      // フィルタ: 参加のみ（◯）→ やまもとはなこ のみ
      // ソート: 名前順（デフォルト）
      render(
        <MemberAttendanceList
          members={mockDetails}
          searchQuery="やま"
          filterStatus="attending"
          sortBy="name"
        />
      );

      // 「やまもとはなこ」のみが表示されること（検索+フィルタ適用）
      expect(screen.getByText('やまもとはなこ')).toBeInTheDocument();

      // 他のメンバーは表示されないこと
      expect(screen.queryByText('やまだたろう')).not.toBeInTheDocument(); // 検索はマッチするがフィルタで除外（△）
      expect(screen.queryByText('すずきじろう')).not.toBeInTheDocument(); // フィルタはマッチするが検索で除外
      expect(screen.queryByText('やまぐちゆい')).not.toBeInTheDocument(); // 検索はマッチするがフィルタで除外（△）
    });

    it('検索+フィルタ+ステータス順ソートが正しく動作する', () => {
      const mockDetails: MemberAttendanceDetail[] = [
        {
          memberId: 'member-1',
          memberName: 'やまだたろう',
          groupId: 'group-1',
          groupName: '打',
          status: '✗',
          hasRegistered: true,
          memberCreatedAt: '2025-01-01T00:00:00.000Z',
        },
        {
          memberId: 'member-2',
          memberName: 'やまもとはなこ',
          groupId: 'group-1',
          groupName: '打',
          status: '◯',
          hasRegistered: true,
          memberCreatedAt: '2025-01-02T00:00:00.000Z',
        },
        {
          memberId: 'member-3',
          memberName: 'やまぐちじろう',
          groupId: 'group-1',
          groupName: '打',
          status: '△',
          hasRegistered: true,
          memberCreatedAt: '2025-01-03T00:00:00.000Z',
        },
      ];

      // 検索: 「やま」を含む → 全員（やまだ、やまもと、やまぐち）
      // フィルタ: すべて
      // ソート: ステータス順（◯→△→✗）
      render(
        <MemberAttendanceList
          members={mockDetails}
          searchQuery="やま"
          filterStatus="all"
          sortBy="status"
        />
      );

      // 全員が表示され、ステータス順になっていること
      const memberNames = screen.getAllByText(/やまだたろう|やまもとはなこ|やまぐちじろう/);
      expect(memberNames).toHaveLength(3);
      expect(memberNames[0]).toHaveTextContent('やまもとはなこ'); // ◯
      expect(memberNames[1]).toHaveTextContent('やまぐちじろう'); // △
      expect(memberNames[2]).toHaveTextContent('やまだたろう'); // ✗
    });
  });
});
