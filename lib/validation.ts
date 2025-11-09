import { z } from 'zod';

// AttendanceStatus
export const AttendanceStatusSchema = z.enum(['◯', '△', '✗']);

// Organization（団体）
export const OrganizationSchema = z.object({
  id: z.string().length(10, 'IDは10文字である必要があります'),
  name: z
    .string()
    .min(1, '団体名を入力してください')
    .max(100, '団体名は100文字以内で入力してください')
    .trim(),
  description: z
    .string()
    .max(500, '説明は500文字以内で入力してください')
    .optional(),
  createdAt: z.string().datetime(),
});

export const CreateOrganizationInputSchema = z.object({
  name: z
    .string()
    .min(1, '団体名を入力してください')
    .max(100, '団体名は100文字以内で入力してください')
    .trim(),
  description: z
    .string()
    .max(500, '説明は500文字以内で入力してください')
    .optional(),
});

export const UpdateOrganizationInputSchema = z
  .object({
    name: z
      .string()
      .min(1, '団体名を入力してください')
      .max(100, '団体名は100文字以内で入力してください')
      .trim()
      .optional(),
    description: z
      .string()
      .max(500, '説明は500文字以内で入力してください')
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: '少なくとも1つのフィールドを指定してください',
  });

// EventDate（イベント日付）
export const EventDateSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().length(10),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日付はYYYY-MM-DD形式で入力してください'),
  title: z
    .string()
    .min(1, 'タイトルを入力してください')
    .max(100, 'タイトルは100文字以内で入力してください')
    .trim(),
  location: z
    .string()
    .max(200, '場所は200文字以内で入力してください')
    .optional(),
  createdAt: z.string().datetime(),
});

export const CreateEventDateInputSchema = EventDateSchema.omit({ id: true, organizationId: true, createdAt: true });

// Group（グループ）
export const GroupSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().length(10),
  name: z
    .string()
    .min(1, 'グループ名を入力してください')
    .max(50, 'グループ名は50文字以内で入力してください')
    .trim(),
  order: z.number().int().min(0, '表示順は0以上の整数を指定してください'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '色は#RRGGBBの形式で入力してください').optional(),
  createdAt: z.string().datetime(),
});

export const CreateGroupInputSchema = GroupSchema.omit({ id: true, organizationId: true, createdAt: true });

// Member（メンバー）
export const MemberSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().length(10),
  groupId: z.string().uuid(),
  name: z
    .string()
    .min(1, '名前を入力してください')
    .max(50, '名前は50文字以内で入力してください')
    .trim(),
  createdAt: z.string().datetime(),
});

export const CreateMemberInputSchema = MemberSchema.omit({ id: true, organizationId: true, createdAt: true });

// Attendance（出欠登録）
export const AttendanceSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().length(10),
  eventDateId: z.string().uuid(),
  memberId: z.string().uuid(),
  status: AttendanceStatusSchema,
  createdAt: z.string().datetime(),
});

export const CreateAttendanceInputSchema = AttendanceSchema.omit({ id: true, organizationId: true, createdAt: true });

// 型推論
export type EventDateInput = z.infer<typeof CreateEventDateInputSchema>;
export type GroupInput = z.infer<typeof CreateGroupInputSchema>;
export type MemberInput = z.infer<typeof CreateMemberInputSchema>;
export type AttendanceInput = z.infer<typeof CreateAttendanceInputSchema>;
