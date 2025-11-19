'use client';

import { useState, useEffect } from 'react';
import { loadEventDates, loadAttendances } from '@/lib/storage';
import type { EventDate, Attendance, AttendanceStatus } from '@/types';

interface EventListProps {
  memberId: string | null;
  selectedEvents: string[];
  onSelectionChange: (selectedEventIds: string[]) => void;
  eventStatuses?: Record<string, AttendanceStatus>;
  onStatusChange?: (eventId: string, status: AttendanceStatus) => void;
  organizationId: string;
}

export function EventList({
  memberId,
  selectedEvents,
  onSelectionChange,
  eventStatuses = {},
  onStatusChange,
  organizationId
}: EventListProps) {
  const [eventDates, setEventDates] = useState<EventDate[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);

  // イベントと出欠情報を読み込み
  useEffect(() => {
    setEventDates(loadEventDates(organizationId));
    setAttendances(loadAttendances(organizationId));
  }, [organizationId]);

  // チェックボックスの変更処理
  const handleCheckboxChange = (eventId: string, isChecked: boolean) => {
    if (isChecked) {
      // 選択に追加
      onSelectionChange([...selectedEvents, eventId]);
    } else {
      // 選択から削除
      onSelectionChange(selectedEvents.filter((id) => id !== eventId));
    }
  };

  // 特定のイベントとメンバーの既存出欠ステータスを取得
  const getExistingStatus = (eventDateId: string): string | null => {
    if (!memberId) return null;

    const attendance = attendances.find(
      (a) => a.eventDateId === eventDateId && a.memberId === memberId
    );

    return attendance ? attendance.status : null;
  };

  return (
    <div className="space-y-3">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">イベントを選択</h3>

      {eventDates.length === 0 ? (
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">イベントがありません</p>
      ) : (
        <div className="space-y-2">
          {eventDates.map((event) => {
            const existingStatus = getExistingStatus(event.id);
            const isSelected = selectedEvents.includes(event.id);

            return (
              <div
                key={event.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => handleCheckboxChange(event.id, e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    aria-label={`${event.title}を選択`}
                  />

                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{event.title}</div>

                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <div>{event.date}</div>
                      <div>{event.location}</div>
                    </div>

                    {existingStatus && (
                      <div className="mt-2 text-sm text-blue-600 font-medium">
                        現在: {existingStatus}
                      </div>
                    )}

                    {/* 個別ステータス選択（選択済みイベントのみ表示） */}
                    {isSelected && onStatusChange && (
                      <div className="mt-3">
                        <label
                          htmlFor={`status-${event.id}`}
                          className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          このイベントのステータス
                        </label>
                        <select
                          id={`status-${event.id}`}
                          aria-label="ステータス"
                          value={eventStatuses[event.id] || '◯'}
                          onChange={(e) =>
                            onStatusChange(event.id, e.target.value as AttendanceStatus)
                          }
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                        >
                          <option value="◯">◯ 出席</option>
                          <option value="△">△ 未定</option>
                          <option value="✗">✗ 欠席</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
