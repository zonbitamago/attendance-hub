'use client';

import { useState, useEffect } from 'react';
import { loadEventDates, loadAttendances } from '@/lib/storage';
import type { EventDate, Attendance } from '@/types';

interface EventListProps {
  memberId: string | null;
  selectedEvents: string[];
  onSelectionChange: (selectedEventIds: string[]) => void;
}

export function EventList({ memberId, selectedEvents, onSelectionChange }: EventListProps) {
  const [eventDates, setEventDates] = useState<EventDate[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);

  // イベントと出欠情報を読み込み
  useEffect(() => {
    setEventDates(loadEventDates());
    setAttendances(loadAttendances());
  }, []);

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
      <h3 className="text-base sm:text-lg font-semibold text-gray-800">イベントを選択</h3>

      {eventDates.length === 0 ? (
        <p className="text-sm sm:text-base text-gray-500">イベントがありません</p>
      ) : (
        <div className="space-y-2">
          {eventDates.map((event) => {
            const existingStatus = getExistingStatus(event.id);
            const isSelected = selectedEvents.includes(event.id);

            return (
              <div
                key={event.id}
                className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors"
              >
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => handleCheckboxChange(event.id, e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />

                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{event.title}</div>

                    <div className="text-sm text-gray-600 mt-1">
                      <div>{event.date}</div>
                      <div>{event.location}</div>
                    </div>

                    {existingStatus && (
                      <div className="mt-2 text-sm text-blue-600 font-medium">
                        現在: {existingStatus}
                      </div>
                    )}
                  </div>
                </label>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
