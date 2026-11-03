import type { UserProfile } from './types';

export const DEMO_ADMIN: UserProfile = {
  id: 'usr-admin-01',
  email: 'quantri@learning-universe.edu.vn',
  fullName: 'Ban Quản trị & Biên tập',
  avatarUrl: null,
  role: 'admin',
  status: 'approved',
  createdAt: '2026-10-01T08:00:00.000Z',
  updatedAt: '2026-10-01T08:00:00.000Z',
};

export const DEMO_APPROVED_STUDENT: UserProfile = {
  id: 'usr-student-01',
  email: 'sinhvien.toan@hnue.edu.vn',
  fullName: 'Nguyễn Văn Minh',
  avatarUrl: null,
  role: 'student',
  status: 'approved',
  createdAt: '2026-10-15T09:30:00.000Z',
  updatedAt: '2026-10-15T09:30:00.000Z',
};

export const DEMO_PENDING_STUDENT: UserProfile = {
  id: 'usr-pending-01',
  email: 'choduyet.tran@gmail.com',
  fullName: 'Trần Thị Thu Trang',
  avatarUrl: null,
  role: 'student',
  status: 'pending',
  createdAt: '2026-11-02T14:15:00.000Z',
  updatedAt: '2026-11-02T14:15:00.000Z',
};

export const DEMO_REJECTED_STUDENT: UserProfile = {
  id: 'usr-rejected-01',
  email: 'khoataikhoan@gmail.com',
  fullName: 'Lê Hoàng Nam',
  avatarUrl: null,
  role: 'student',
  status: 'rejected',
  createdAt: '2026-10-20T10:00:00.000Z',
  updatedAt: '2026-10-20T10:00:00.000Z',
};

export const INITIAL_DEMO_USERS: readonly UserProfile[] = [
  DEMO_ADMIN,
  DEMO_APPROVED_STUDENT,
  DEMO_PENDING_STUDENT,
  {
    id: 'usr-pending-02',
    email: 'phan.hoang.anh@outlook.com',
    fullName: 'Phan Hoàng Ánh',
    avatarUrl: null,
    role: 'student',
    status: 'pending',
    createdAt: '2026-11-03T07:20:00.000Z',
    updatedAt: '2026-11-03T07:20:00.000Z',
  },
  {
    id: 'usr-approved-02',
    email: 'le.thanh.tam@hcmue.edu.vn',
    fullName: 'Lê Thanh Tâm',
    avatarUrl: null,
    role: 'student',
    status: 'approved',
    createdAt: '2026-10-25T11:00:00.000Z',
    updatedAt: '2026-10-25T11:00:00.000Z',
  },
  DEMO_REJECTED_STUDENT,
];
