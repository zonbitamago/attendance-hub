import { render, screen, fireEvent } from '@testing-library/react';
import { GroupAttendanceAccordion } from '@/components/event-detail/group-attendance-accordion';
import type { MemberAttendanceDetail } from '@/types';

describe('GroupAttendanceAccordion', () => {
  describe('Test Case 1: アコーディオンの展開/折りたたみ', () => {
    it('グループ名をクリックすると展開/折りたたみが切り替わる', () => {
      const mockMembers: MemberAttendanceDetail[] = [
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

      const mockOnToggle = jest.fn();

      render(
        <GroupAttendanceAccordion
          groupId="group-1"
          groupName="打"
          members={mockMembers}
          isExpanded={false}
          onToggle={mockOnToggle}
        />
      );

      // グループ名が表示されること
      const groupButton = screen.getByRole('button', { name: /打/i });
      expect(groupButton).toBeInTheDocument();

      // 初期状態では折りたたまれている（メンバーリストが非表示）
      expect(screen.queryByText('やまだたろう')).not.toBeInTheDocument();

      // グループ名をクリックするとonToggleが呼ばれる
      fireEvent.click(groupButton);
      expect(mockOnToggle).toHaveBeenCalledTimes(1);
      expect(mockOnToggle).toHaveBeenCalledWith('group-1');
    });

    it('isExpandedがtrueの場合、メンバーリストが表示される', () => {
      const mockMembers: MemberAttendanceDetail[] = [
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

      const mockOnToggle = jest.fn();

      render(
        <GroupAttendanceAccordion
          groupId="group-1"
          groupName="打"
          members={mockMembers}
          isExpanded={true}
          onToggle={mockOnToggle}
        />
      );

      // メンバーリストが表示されること
      expect(screen.getByText('やまだたろう')).toBeInTheDocument();
      expect(screen.getByText('◯')).toBeInTheDocument();
    });
  });

  describe('Test Case 2: ARIA属性の確認', () => {
    it('aria-expanded属性が正しく設定される', () => {
      const mockMembers: MemberAttendanceDetail[] = [];
      const mockOnToggle = jest.fn();

      const { rerender } = render(
        <GroupAttendanceAccordion
          groupId="group-1"
          groupName="打"
          members={mockMembers}
          isExpanded={false}
          onToggle={mockOnToggle}
        />
      );

      const button = screen.getByRole('button');

      // 折りたたまれている場合、aria-expanded="false"
      expect(button).toHaveAttribute('aria-expanded', 'false');

      // 再レンダリングして展開状態に変更
      rerender(
        <GroupAttendanceAccordion
          groupId="group-1"
          groupName="打"
          members={mockMembers}
          isExpanded={true}
          onToggle={mockOnToggle}
        />
      );

      // 展開されている場合、aria-expanded="true"
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('aria-controls属性が正しく設定される', () => {
      const mockMembers: MemberAttendanceDetail[] = [];
      const mockOnToggle = jest.fn();

      render(
        <GroupAttendanceAccordion
          groupId="group-1"
          groupName="打"
          members={mockMembers}
          isExpanded={false}
          onToggle={mockOnToggle}
        />
      );

      const button = screen.getByRole('button');

      // aria-controls属性が設定されていること
      expect(button).toHaveAttribute('aria-controls');

      const controlsId = button.getAttribute('aria-controls');
      expect(controlsId).toBeTruthy();
    });
  });

  describe('Test Case 3: キーボード操作（Enter/Space）', () => {
    it('Enterキーでアコーディオンが操作できる', () => {
      const mockMembers: MemberAttendanceDetail[] = [];
      const mockOnToggle = jest.fn();

      render(
        <GroupAttendanceAccordion
          groupId="group-1"
          groupName="打"
          members={mockMembers}
          isExpanded={false}
          onToggle={mockOnToggle}
        />
      );

      const button = screen.getByRole('button');

      // Enterキーを押下
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });

      // onToggleが呼ばれること
      expect(mockOnToggle).toHaveBeenCalledTimes(1);
      expect(mockOnToggle).toHaveBeenCalledWith('group-1');
    });

    it('Spaceキーでアコーディオンが操作できる', () => {
      const mockMembers: MemberAttendanceDetail[] = [];
      const mockOnToggle = jest.fn();

      render(
        <GroupAttendanceAccordion
          groupId="group-1"
          groupName="打"
          members={mockMembers}
          isExpanded={false}
          onToggle={mockOnToggle}
        />
      );

      const button = screen.getByRole('button');

      // Spaceキーを押下
      fireEvent.keyDown(button, { key: ' ', code: 'Space' });

      // onToggleが呼ばれること
      expect(mockOnToggle).toHaveBeenCalledTimes(1);
      expect(mockOnToggle).toHaveBeenCalledWith('group-1');
    });
  });

  describe('Test Case 4: フィルタ機能の統合', () => {
    it('filterStatus propがMemberAttendanceListに渡され、フィルタリングが適用される', () => {
      const mockMembers: MemberAttendanceDetail[] = [
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

      const mockOnToggle = jest.fn();

      render(
        <GroupAttendanceAccordion
          groupId="group-1"
          groupName="打"
          members={mockMembers}
          isExpanded={true}
          onToggle={mockOnToggle}
          filterStatus="attending"
        />
      );

      // ◯ステータスのメンバーのみ表示されること
      expect(screen.getByText('やまだたろう')).toBeInTheDocument();

      // △、✗のメンバーは表示されないこと（フィルタリングされている）
      expect(screen.queryByText('すずきはなこ')).not.toBeInTheDocument();
      expect(screen.queryByText('さとうけんじ')).not.toBeInTheDocument();
    });
  });
});
