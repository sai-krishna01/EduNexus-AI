
export enum UserRole {
  FOUNDER = 'FOUNDER',
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  GUEST = 'GUEST'
}

export type SubscriptionPlan = 'FREE' | 'PRO' | 'ENTERPRISE';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  isBlocked: boolean;
  createdAt: number;
  lastLogin: number;
  subscription: SubscriptionPlan;
  subscriptionExpiry?: number;
}

export interface SystemSettings {
  id: string; // 'global'
  maintenanceMode: boolean;
  enableAiTeacher: boolean;
  enableFileUploads: boolean;
  enableYouTubeAnalysis: boolean;
  enableChat: boolean;
  enableAds: boolean;
  enablePayments: boolean;
  systemAnnouncement: string;
}

export interface Group {
  id: string;
  name: string;
  type: 'PUBLIC' | 'PRIVATE';
  isAiEnabled: boolean; // If true, AI Teacher automatically replies to questions
  description: string;
  createdBy: string;
  createdAt: number;
  members: string[]; // User IDs
  inviteCode?: string; // For private groups
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // Base64
}

export interface Message {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
  isAi: boolean;
  attachments?: Attachment[];
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  email: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'RESOLVED';
  adminReply?: string;
  timestamp: number;
}

export const DEFAULT_SETTINGS: SystemSettings = {
  id: 'global',
  maintenanceMode: false,
  enableAiTeacher: true,
  enableFileUploads: true,
  enableYouTubeAnalysis: true,
  enableChat: true,
  enableAds: true,
  enablePayments: true,
  systemAnnouncement: "Welcome to EduNexus AI V2.0"
};
