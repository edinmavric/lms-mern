export interface User {
  _id: string;
  tenant: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'professor' | 'student';
  status: 'active' | 'pending' | 'disabled';
  pendingApproval: boolean;
  approvedBy?: string;
  approvedAt?: string;
  createdBy?: string;
  createdAt: string;
}

export interface Tenant {
  _id: string;
  name: string;
  domain?: string;
  contactEmail?: string;
  settings: TenantSettings;
  isDeleted: boolean;
  deletedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TenantSummary {
  id: string;
  name: string;
  domain?: string;
  contactEmail?: string;
}

export interface TenantSettings {
  gradeScale: {
    min: number;
    max: number;
    label: '1-5' | '1-10' | '6-10';
  };
  attendanceRules: {
    requiredPresencePercent: number;
    allowRemote: boolean;
  };
  currency: string;
  locale: string;
}

export interface Department {
  _id: string;
  tenant: string;
  name: string;
  description?: string;
  isDeleted: boolean;
  createdBy?: string | User;
  updatedBy?: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  _id: string;
  tenant: string;
  name: string;
  description?: string;
  professor: string | User;
  department?: string | Department;
  students: string[] | User[];
  price?: number;
  enrollmentPassword?: string;
  schedule?: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  isDeleted: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
}

export interface Lesson {
  _id: string;
  tenant: string;
  course: string | Course;
  title: string;
  content?: string;
  date: string;
  startTime: string;
  endTime: string;
  isDeleted: boolean;
  createdBy?: string | User;
  updatedBy?: string | User;
  createdAt: string;
}

export interface LessonMaterial {
  _id: string;
  tenant: string;
  lesson: string | Lesson;
  course: string | Course;
  professor: string | User;
  name: string;
  description?: string;
  type:
    | 'pdf'
    | 'video'
    | 'presentation'
    | 'link'
    | 'document'
    | 'image'
    | 'other';
  url: string;
  storageKey?: string;
  isDeleted: boolean;
  createdBy?: string | User;
  updatedBy?: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  _id: string;
  tenant: string;
  user: string | User;
  action:
    | 'user.created'
    | 'user.updated'
    | 'user.deleted'
    | 'user.approved'
    | 'user.disabled'
    | 'user.login'
    | 'user.logout'
    | 'user.password_reset'
    | 'course.created'
    | 'course.updated'
    | 'course.deleted'
    | 'course.enrolled'
    | 'course.unenrolled'
    | 'lesson.created'
    | 'lesson.updated'
    | 'lesson.deleted'
    | 'lesson.material_added'
    | 'lesson.material_deleted'
    | 'grade.created'
    | 'grade.updated'
    | 'grade.deleted'
    | 'exam.created'
    | 'exam.updated'
    | 'exam.deleted'
    | 'exam.subscribed'
    | 'exam.graded'
    | 'attendance.marked'
    | 'attendance.updated'
    | 'payment.received'
    | 'payment.updated'
    | 'department.created'
    | 'department.updated'
    | 'department.deleted'
    | 'settings.updated'
    | 'bank_account.created'
    | 'bank_account.updated'
    | 'bank_account.deleted'
    | 'point.created'
    | 'point.updated'
    | 'point.deleted'
    | 'enrollment.created'
    | 'enrollment.updated'
    | 'enrollment.deleted'
    | 'consultation.created'
    | 'consultation.updated'
    | 'consultation.deleted'
    | 'consultation.registered'
    | 'consultation.unregistered'
    | 'consultation.cancelled'
    | 'notification.created'
    | 'notification.updated'
    | 'notification.deleted'
    | 'notification.published'
    | 'notification.read'
    | 'videocall.created'
    | 'videocall.updated'
    | 'videocall.ended'
    | 'videocall.cancelled'
    | 'videocall.participants_updated';
  entityType:
    | 'User'
    | 'Course'
    | 'Lesson'
    | 'Grade'
    | 'Exam'
    | 'ExamSubscription'
    | 'Attendance'
    | 'Enrollment'
    | 'Payment'
    | 'Department'
    | 'BankAccount'
    | 'LessonMaterial'
    | 'Point'
    | 'Tenant'
    | 'Consultation'
    | 'Notification'
    | 'VideoCall';
  entityId: string;
  changes?: Record<string, { old: any; new: any }>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLogStats {
  actionStats: Array<{ _id: string; count: number }>;
  severityStats: Array<{ _id: string; count: number }>;
  entityTypeStats: Array<{ _id: string; count: number }>;
  period: string;
  startDate: string;
  endDate: string;
}

export interface Enrollment {
  _id: string;
  tenant: string;
  student: string | User;
  course: string | Course;
  status: 'active' | 'completed' | 'cancelled' | 'paused';
  payments: Payment[];
  isDeleted: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
}

export interface Payment {
  amount: number;
  date: string;
  status: 'paid' | 'pending';
}

export interface Grade {
  _id: string;
  tenant: string;
  student: string | User;
  course: string | Course;
  professor: string | User;
  value: number;
  comment?: string;
  attempt: number;
  date: string;
  history: GradeHistory[];
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GradeHistory {
  oldValue: number;
  newValue: number;
  changedBy: string | User;
  changedAt: string;
}

export interface Attendance {
  _id: string;
  tenant: string;
  student: string | User;
  lesson: string | Lesson;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  recordedBy?: string | User;
  recordedAt: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
}

export interface BankAccount {
  _id: string;
  tenant: string;
  accountHolderName: string;
  bankName?: string;
  iban: string;
  swiftCode?: string;
  currency: 'EUR' | 'USD' | 'GBP' | 'RSD' | 'CHF' | 'JPY' | 'AUD' | 'CAD';
  isPrimary: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
}

export interface Point {
  _id: string;
  tenant: string;
  student: string | User;
  course: string | Course;
  professor: string | User;
  points: number;
  maxPoints: number;
  title: string;
  description?: string;
  date: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Exam {
  _id: string;
  tenant: string;
  course: string | Course;
  professor: string | User;
  title: string;
  description?: string;
  date: string;
  location?: string;
  maxPoints: number;
  passingPoints: number;
  type: 'preliminary' | 'finishing';
  isActive: boolean;
  subscriptionDeadline: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExamSubscription {
  _id: string;
  tenant: string;
  exam: string | Exam;
  student: string | User;
  status: 'subscribed' | 'graded' | 'passed' | 'failed';
  points?: number;
  grade?: number;
  gradedBy?: string | User;
  gradedAt?: string;
  comment?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
  tenant: TenantSummary;
}

export interface ApiError {
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface Consultation {
  _id: string;
  tenant: string;
  professor: string | User;
  courses: Array<string | Course>;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  roomNumber: string;
  maxStudents?: number | null;
  registeredStudents: Array<{
    student: string | User;
    registeredAt: string;
  }>;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  availableSpots?: number | null;
  isFull: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConsultationData {
  courses?: string[];
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  roomNumber: string;
  maxStudents?: number;
  notes?: string;
}

export interface NotificationAttachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Notification {
  _id: string;
  tenant: string;
  title: string;
  content: string;
  type: 'general' | 'urgent' | 'maintenance' | 'event' | 'academic';
  priority: 'low' | 'medium' | 'high';
  targetAudience: 'all' | 'students' | 'professors' | 'specific';
  targetUsers?: Array<string | User>;
  targetCourses?: Array<string | Course>;
  targetDepartments?: Array<string | Department>;
  isPublished: boolean;
  publishedAt?: string;
  expiresAt?: string;
  isPinned: boolean;
  attachments?: NotificationAttachment[];
  readBy: Array<{ user: string | User; readAt: string }>;
  readCount: number;
  createdBy: string | User;
  updatedBy?: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationData {
  title: string;
  content: string;
  type?: 'general' | 'urgent' | 'maintenance' | 'event' | 'academic';
  priority?: 'low' | 'medium' | 'high';
  targetAudience?: 'all' | 'students' | 'professors' | 'specific';
  targetUsers?: string[];
  targetCourses?: string[];
  targetDepartments?: string[];
  isPublished?: boolean;
  expiresAt?: string;
  isPinned?: boolean;
}

export interface VideoCallParticipant {
  user: string | User;
  role: 'host' | 'cohost' | 'participant';
  joinedAt?: string;
  leftAt?: string;
}

export interface VideoCall {
  _id: string;
  tenant: string;
  lesson: string | Lesson;
  course: string | Course;
  callType: string;
  callId: string;
  callCid: string;
  title: string;
  description?: string;
  status: 'active' | 'ended' | 'cancelled';
  lessonStartAt: string;
  lessonEndAt: string;
  startedAt: string;
  endedAt?: string;
  participants: VideoCallParticipant[];
  createdBy: string | User;
  updatedBy?: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVideoCallDto {
  lessonId: string;
  title?: string;
  description?: string;
  callType?: string;
}

export interface VideoCallTokenResponse {
  token: string;
  apiKey: string;
  call: {
    id: string;
    callId: string;
    callType: string;
    callCid: string;
    title: string;
    status: 'active' | 'ended' | 'cancelled';
  };
  role: 'host' | 'cohost' | 'participant';
  expiresAt: string;
}
