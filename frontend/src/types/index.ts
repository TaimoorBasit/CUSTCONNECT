export interface User {
  id: string;
  email?: string | null;
  username?: string | null;
  firstName: string;
  lastName: string;
  profileImage?: string;
  isVerified: boolean;
  year?: number;
  studentId?: string;
  university?: {
    id: string;
    name: string;
    city: string;
  };
  department?: {
    id: string;
    name: string;
    code: string;
  };
  roles: Array<{
    id: string;
    name: string;
  }>;
  createdAt: string;
  isActive?: boolean;
  universityId?: string;
  departmentId?: string;
}

export interface University {
  id: string;
  name: string;
  domain: string;
  country: string;
  city: string;
  isActive: boolean;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  universityId: string;
  isActive: boolean;
}

export interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  privacy: 'PUBLIC' | 'UNIVERSITY_ONLY' | 'FOLLOWERS_ONLY';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
    year?: number;
    university?: {
      name: string;
    };
  };
  likes: number;
  comments: number;
  isLiked: boolean;
  isFollowing: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
    year?: number;
  };
  canEdit?: boolean;
  canDelete?: boolean;
}

export interface BusRoute {
  id: string;
  name: string;
  number: string;
  description?: string;
  isActive: boolean;
  university: {
    id: string;
    name: string;
    city: string;
  };
  schedules: Array<{
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' | 'BUS_ALERT';
    createdAt: string;
  }>;
  isSubscribed: boolean;
}

export interface Cafe {
  id: string;
  name: string;
  description?: string;
  location: string;
  phone?: string;
  email?: string;
  openingHours?: string;
  imageUrl?: string;
  isActive: boolean;
  university?: {
    id: string;
    name: string;
    city: string;
  };
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  menus: Array<{
    id: string;
    name: string;
    description?: string;
    price: number;
    category: string;
    imageUrl?: string;
    isAvailable: boolean;
  }>;
  deals: Array<{
    id: string;
    title: string;
    description?: string;
    discount?: number;
    menuItemIds?: string;
    validFrom: string;
    validUntil: string;
    isActive: boolean;
  }>;
}

export interface AcademicResource {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  isActive: boolean;
  createdAt: string;
  uploader: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
    year?: number;
  };
  course?: {
    id: string;
    name: string;
    code: string;
    credits: number;
  };
  semester?: {
    id: string;
    name: string;
    year: number;
  };
}

export interface GPARecord {
  id: string;
  semester: string;
  year: number;
  gpa: number;
  cgpa: number;
  credits: number;
  createdAt: string;
  subjects: Array<{
    id: string;
    name: string;
    code: string;
    credits: number;
    grade: string;
    gpa: number;
  }>;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  organizer: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
    year?: number;
  };
  university: {
    id: string;
    name: string;
    city: string;
  };
  userRSVP?: 'GOING' | 'NOT_GOING' | 'MAYBE';
  rsvpCount: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' | 'BUS_ALERT' | 'EVENT_UPDATE' | 'NEW_MESSAGE';
  isRead: boolean;
  createdAt: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  universityId?: string;
  departmentId?: string;
  year?: number | string;
  studentId?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}









