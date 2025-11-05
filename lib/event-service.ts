import type { EventDate } from '@/types';
import { loadEventDates, saveEventDates } from './storage';
import { CreateEventDateInputSchema, type EventDateInput } from './validation';
import { getCurrentTimestamp } from './date-utils';
import { ErrorMessages } from './error-utils';

// イベント日付を作成
export function createEventDate(input: EventDateInput): EventDate {
  const validated = CreateEventDateInputSchema.parse(input);

  const newEventDate: EventDate = {
    id: crypto.randomUUID(),
    date: validated.date,
    title: validated.title,
    location: validated.location,
    createdAt: getCurrentTimestamp(),
  };

  const eventDates = loadEventDates();
  eventDates.push(newEventDate);

  const success = saveEventDates(eventDates);
  if (!success) {
    throw new Error(ErrorMessages.STORAGE_FULL);
  }

  return newEventDate;
}

// すべてのイベント日付を取得（日付昇順）
export function getAllEventDates(): EventDate[] {
  const eventDates = loadEventDates();
  return eventDates.sort((a, b) => a.date.localeCompare(b.date));
}

// IDでイベント日付を取得
export function getEventDateById(id: string): EventDate | null {
  const eventDates = loadEventDates();
  return eventDates.find((event) => event.id === id) || null;
}

// イベント日付を更新
export function updateEventDate(id: string, input: Partial<EventDateInput>): EventDate {
  const eventDates = loadEventDates();
  const index = eventDates.findIndex((event) => event.id === id);

  if (index === -1) {
    throw new Error(ErrorMessages.NOT_FOUND('イベント日付'));
  }

  const updateData: EventDateInput = {
    date: input.date ?? eventDates[index].date,
    title: input.title ?? eventDates[index].title,
    location: input.location !== undefined ? input.location : eventDates[index].location,
  };
  const validated = CreateEventDateInputSchema.parse(updateData);

  const updatedEventDate: EventDate = {
    ...eventDates[index],
    date: validated.date,
    title: validated.title,
    location: validated.location,
  };

  eventDates[index] = updatedEventDate;

  const success = saveEventDates(eventDates);
  if (!success) {
    throw new Error(ErrorMessages.STORAGE_FULL);
  }

  return updatedEventDate;
}

// イベント日付を削除
export function deleteEventDate(id: string): boolean {
  const eventDates = loadEventDates();
  const filteredEventDates = eventDates.filter((event) => event.id !== id);

  if (eventDates.length === filteredEventDates.length) {
    return false;
  }

  return saveEventDates(filteredEventDates);
}
