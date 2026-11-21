export type Role = 'teacher' | 'student'
export type QType = 'single' | 'multi' | 'bool' | 'number'
export interface Option { id: string; text: string; correct: boolean }
export interface Question { id: string; type: QType; text: string; options: Option[]; answer?: boolean | number; explanation?: string }
export interface Student { id: string; full_name: string; grade: number | null; tg_id: number | null; user_id: string | null }
export interface LessonRow { id: string; student_id: string; starts_at: string; duration_min: number; topic: string; price?: number; paid?: boolean; status: 'planned' | 'done' | 'cancelled'; rescheduled: boolean; students?: { full_name: string } | null }
export interface Folder { id: string; name: string; parent_id: string | null }
export interface TaskRow { id: string; title: string; folder_id: string | null; questions: Question[]; updated_at: string }
export interface Assignment { id: string; title: string; student_id: string; snapshot: Question[]; comment: string | null; created_at: string; students?: { full_name: string } | null; attempts?: { score: number; total: number; created_at: string }[] }
export interface AttemptRow { id: string; assignment_id: string; student_id: string; score: number; total: number; attempt_no: number; created_at: string; assignments?: { title: string } | null; students?: { full_name: string } | null }
