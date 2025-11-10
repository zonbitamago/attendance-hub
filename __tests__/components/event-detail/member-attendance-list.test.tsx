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
});
