import React from 'react';
import { Edit3, Key, LogIn, LogOut, PlusCircle, Shield, Trash2 } from 'lucide-react';
import type { ActivityAction } from '../types/activityLog.types';

export const ACTION_META: Record<ActivityAction, { label: string; icon: React.ReactNode; color: string; bg: string }> =
  {
    CREATE_USER: {
      label: 'Tạo tài khoản',
      icon: <PlusCircle size={14} />,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50 border-emerald-200',
    },
    UPDATE_USER: {
      label: 'Cập nhật user',
      icon: <Edit3 size={14} />,
      color: 'text-blue-700',
      bg: 'bg-blue-50 border-blue-200',
    },
    DELETE_USER: {
      label: 'Xóa tài khoản',
      icon: <Trash2 size={14} />,
      color: 'text-red-700',
      bg: 'bg-red-50 border-red-200',
    },
    CREATE_ROLE: {
      label: 'Tạo vai trò',
      icon: <Shield size={14} />,
      color: 'text-violet-700',
      bg: 'bg-violet-50 border-violet-200',
    },
    UPDATE_ROLE: {
      label: 'Cập nhật vai trò',
      icon: <Edit3 size={14} />,
      color: 'text-indigo-700',
      bg: 'bg-indigo-50 border-indigo-200',
    },
    DELETE_ROLE: {
      label: 'Xóa vai trò',
      icon: <Trash2 size={14} />,
      color: 'text-rose-700',
      bg: 'bg-rose-50 border-rose-200',
    },
    LOGIN: {
      label: 'Đăng nhập',
      icon: <LogIn size={14} />,
      color: 'text-teal-700',
      bg: 'bg-teal-50 border-teal-200',
    },
    LOGOUT: {
      label: 'Đăng xuất',
      icon: <LogOut size={14} />,
      color: 'text-gray-600',
      bg: 'bg-gray-50 border-gray-200',
    },
    CHANGE_PASSWORD: {
      label: 'Đổi mật khẩu',
      icon: <Key size={14} />,
      color: 'text-amber-700',
      bg: 'bg-amber-50 border-amber-200',
    },
    ASSIGN_ROLE: {
      label: 'Gán vai trò',
      icon: <Shield size={14} />,
      color: 'text-purple-700',
      bg: 'bg-purple-50 border-purple-200',
    },
  };

export const ACTION_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Tất cả hành động' },
  { value: 'CREATE_USER', label: 'Tạo tài khoản' },
  { value: 'UPDATE_USER', label: 'Cập nhật user' },
  { value: 'DELETE_USER', label: 'Xóa tài khoản' },
  { value: 'CREATE_ROLE', label: 'Tạo vai trò' },
  { value: 'UPDATE_ROLE', label: 'Cập nhật vai trò' },
  { value: 'DELETE_ROLE', label: 'Xóa vai trò' },
  { value: 'LOGIN', label: 'Đăng nhập' },
  { value: 'LOGOUT', label: 'Đăng xuất' },
  { value: 'CHANGE_PASSWORD', label: 'Đổi mật khẩu' },
  { value: 'ASSIGN_ROLE', label: 'Gán vai trò' },
];

export const PALETTE = [
  { bg: 'bg-blue-100', text: 'text-blue-700', ring: 'ring-blue-200' },
  { bg: 'bg-violet-100', text: 'text-violet-700', ring: 'ring-violet-200' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700', ring: 'ring-indigo-200' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-200' },
  { bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-200' },
  { bg: 'bg-rose-100', text: 'text-rose-700', ring: 'ring-rose-200' },
];
