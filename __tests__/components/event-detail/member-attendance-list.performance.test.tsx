/**
 * Performance tests for MemberAttendanceList component
 *
 * Tests with large datasets (100+ members) to ensure:
 * - Filter/sort/search operations complete within 200ms
 * - Component renders efficiently with large datasets
 */

import { render, screen } from '@testing-library/react';
import { MemberAttendanceList } from '@/components/event-detail/member-attendance-list';
import type { MemberAttendanceDetail } from '@/types';

/**
 * Generate mock member data for performance testing
 */
function generateMockMembers(count: number): MemberAttendanceDetail[] {
  const statuses: Array<'◯' | '△' | '✗' | null> = ['◯', '△', '✗', null];
  const firstNames = [
    'たろう', 'はなこ', 'じろう', 'ゆい', 'さぶろう',
    'あい', 'けん', 'まい', 'りょう', 'さき'
  ];
  const lastNames = [
    'やまだ', 'すずき', 'たなか', 'わたなべ', 'さとう',
    'たかはし', 'いとう', 'なかむら', 'こばやし', 'かとう'
  ];

  return Array.from({ length: count }, (_, i) => ({
    memberId: `member-${i + 1}`,
    memberName: `${lastNames[i % lastNames.length]}${firstNames[i % firstNames.length]}${Math.floor(i / (firstNames.length * lastNames.length)) || ''}`,
    status: statuses[i % statuses.length],
    groupId: `group-${Math.floor(i / 10) + 1}`,
    groupName: `グループ${Math.floor(i / 10) + 1}`,
    hasRegistered: statuses[i % statuses.length] !== null,
    memberCreatedAt: new Date().toISOString(),
  }));
}

describe('MemberAttendanceList Performance Tests', () => {
  describe('T135-T137: Large dataset performance', () => {
    const largeMemberList = generateMockMembers(100);

    it('T135: renders 100 members without crashing', () => {
      const startTime = performance.now();

      render(<MemberAttendanceList members={largeMemberList} />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (< 1000ms)
      expect(renderTime).toBeLessThan(1000);

      // Verify members are rendered
      expect(screen.getAllByRole('listitem')).toHaveLength(100);
    });

    it('T136: filter operation completes within 200ms', () => {
      const startTime = performance.now();

      const { rerender } = render(
        <MemberAttendanceList members={largeMemberList} filterStatus="all" />
      );

      // Change filter to 'attending'
      rerender(
        <MemberAttendanceList members={largeMemberList} filterStatus="attending" />
      );

      const endTime = performance.now();
      const filterTime = endTime - startTime;

      // Filter operation should complete within 200ms
      expect(filterTime).toBeLessThan(200);

      // Verify only attending members are shown
      const displayedMembers = screen.getAllByRole('listitem');
      displayedMembers.forEach(item => {
        expect(item.textContent).toContain('◯');
      });
    });

    it('T137: sort operation completes within 200ms', () => {
      const startTime = performance.now();

      const { rerender } = render(
        <MemberAttendanceList members={largeMemberList} sortBy="name" />
      );

      // Change sort to 'status'
      rerender(
        <MemberAttendanceList members={largeMemberList} sortBy="status" />
      );

      const endTime = performance.now();
      const sortTime = endTime - startTime;

      // Sort operation should complete within 200ms
      expect(sortTime).toBeLessThan(200);
    });

    it('T137 (continued): search operation completes within 200ms', () => {
      const startTime = performance.now();

      const { rerender } = render(
        <MemberAttendanceList members={largeMemberList} searchQuery="" />
      );

      // Change search query
      rerender(
        <MemberAttendanceList members={largeMemberList} searchQuery="やまだ" />
      );

      const endTime = performance.now();
      const searchTime = endTime - startTime;

      // Search operation should complete within 200ms
      expect(searchTime).toBeLessThan(200);

      // Verify only matching members are shown
      const displayedMembers = screen.getAllByRole('listitem');
      displayedMembers.forEach(item => {
        expect(item.textContent).toContain('やまだ');
      });
    });

    it('T137 (final): combined filter+sort+search completes within 200ms', () => {
      const startTime = performance.now();

      render(
        <MemberAttendanceList
          members={largeMemberList}
          searchQuery="た"
          filterStatus="attending"
          sortBy="name"
        />
      );

      const endTime = performance.now();
      const combinedTime = endTime - startTime;

      // Combined operations should complete within 200ms
      expect(combinedTime).toBeLessThan(200);
    });
  });
});
