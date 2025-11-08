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

export interface Course {
  _id: string;
  tenant: string;
  name: string;
  description?: string;
  professor: string | User;
  students: string[] | User[];
  price?: number;
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
  materials: LessonMaterial[];
  isDeleted: boolean;
  createdBy?: string | User;
  updatedBy?: string | User;
  createdAt: string;
}

export interface LessonMaterial {
  type: 'pdf' | 'video' | 'presentation' | 'link';
  url: string;
  storageKey?: string;
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
  course?: string | Course;
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
