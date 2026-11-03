import {
  Ban,
  Check,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  UserX,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchUsersList,
  updateUserStatus,
  type UserProfile,
  type UserStatus,
} from '@/features/auth';
import { Badge, Button, Card } from '@/shared/ui';
import { normalizeSearchQuery } from '@/utils/vietnamese-text';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

function getInitials(name: string | null, email: string | null): string {
  const source = name?.trim() || email?.split('@')[0] || 'U';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const first = parts[0]?.[0] ?? '';
    const last = parts[parts.length - 1]?.[0] ?? '';
    return (first + last).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

function formatDate(isoString: string): string {
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchUsersList();
      setUsers(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  // Thống kê số lượng theo trạng thái
  const counts = useMemo(() => {
    const pending = users.filter((u) => u.status === 'pending').length;
    const approved = users.filter((u) => u.status === 'approved').length;
    const rejected = users.filter((u) => u.status === 'rejected').length;
    return {
      all: users.length,
      pending,
      approved,
      rejected,
    };
  }, [users]);

  // Bộ lọc và tìm kiếm không dấu
  const filteredUsers = useMemo(() => {
    const normalizedQuery = normalizeSearchQuery(searchQuery);

    return users.filter((user) => {
      // 1. Lọc theo tab trạng thái
      if (statusFilter !== 'all' && user.status !== statusFilter) {
        return false;
      }

      // 2. Tìm kiếm theo tên hoặc email
      if (!normalizedQuery) return true;

      const nameNorm = normalizeSearchQuery(user.fullName ?? '');
      const emailNorm = normalizeSearchQuery(user.email ?? '');

      return nameNorm.includes(normalizedQuery) || emailNorm.includes(normalizedQuery);
    });
  }, [users, statusFilter, searchQuery]);

  const handleStatusChange = async (userId: string, newStatus: UserStatus) => {
    try {
      setProcessingId(userId);
      const updated = await updateUserStatus(userId, newStatus);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));

      const label =
        newStatus === 'approved' ? 'phê duyệt' : newStatus === 'rejected' ? 'từ chối' : 'chờ duyệt';
      setNoticeMessage(`Đã ${label} thành công tài khoản "${updated.fullName || updated.email}".`);

      // Tự động ẩn thông báo sau 4 giây
      setTimeout(() => setNoticeMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi cập nhật trạng thái';
      setNoticeMessage(`Lỗi: ${msg}`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Tiêu đề & Giới thiệu */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-subject-700 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            <span>Ban Biên tập & Quản trị viên</span>
          </div>
          <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            Phê duyệt & Quản lý Học viên
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
            Xét duyệt yêu cầu đăng ký tài khoản của sinh viên, kích hoạt quyền ghi chú bài giảng và
            quản trị danh sách học viên theo quy chuẩn học thuật.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadUsers}
          disabled={isLoading}
          className="gap-2 self-start md:self-auto"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
          <span>Làm mới danh sách</span>
        </Button>
      </div>

      {noticeMessage && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
            <span>{noticeMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setNoticeMessage(null)}
            className="rounded p-1 text-emerald-700 hover:bg-emerald-100"
            aria-label="Đóng thông báo"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* 4 Thẻ KPI Counters */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="border-stone-200/90 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Tổng số học viên</span>
            <Users className="h-4 w-4 text-stone-400" aria-hidden="true" />
          </div>
          <div className="mt-2 text-2xl font-bold text-stone-900">{counts.all}</div>
        </Card>

        <Card className="border-amber-200 bg-amber-50/50 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-800">Đang chờ duyệt</span>
            <Clock className="h-4 w-4 text-amber-600" aria-hidden="true" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-900">{counts.pending}</div>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800">Đã duyệt</span>
            <UserCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-900">{counts.approved}</div>
        </Card>

        <Card className="border-stone-200 bg-stone-50 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-600">Từ chối / Đã khóa</span>
            <UserX className="h-4 w-4 text-stone-500" aria-hidden="true" />
          </div>
          <div className="mt-2 text-2xl font-bold text-stone-800">{counts.rejected}</div>
        </Card>
      </div>

      {/* Thanh điều khiển: Tìm kiếm & Tab lọc */}
      <div className="flex flex-col gap-4 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        {/* Bộ lọc Tabs */}
        <div
          role="tablist"
          aria-label="Lọc trạng thái học viên"
          className="flex flex-wrap items-center gap-1.5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={statusFilter === 'all'}
            onClick={() => setStatusFilter('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Tất cả ({counts.all})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={statusFilter === 'pending'}
            onClick={() => setStatusFilter('pending')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === 'pending'
                ? 'bg-amber-600 text-white'
                : 'text-amber-800 hover:bg-amber-50'
            }`}
          >
            <Clock className="h-3 w-3" aria-hidden="true" />
            <span>Chờ duyệt ({counts.pending})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={statusFilter === 'approved'}
            onClick={() => setStatusFilter('approved')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === 'approved'
                ? 'bg-emerald-700 text-white'
                : 'text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            <Check className="h-3 w-3" aria-hidden="true" />
            <span>Đã duyệt ({counts.approved})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={statusFilter === 'rejected'}
            onClick={() => setStatusFilter('rejected')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === 'rejected'
                ? 'bg-stone-700 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Ban className="h-3 w-3" aria-hidden="true" />
            <span>Từ chối ({counts.rejected})</span>
          </button>
        </div>

        {/* Thanh tìm kiếm */}
        <div className="relative min-w-[240px] sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo họ tên hoặc email..."
            className="w-full rounded-xl border border-stone-200 bg-stone-50 py-1.5 pr-8 pl-9 text-xs text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:bg-white focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              aria-label="Xóa tìm kiếm"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Bảng danh sách học viên */}
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50/75 text-xs font-semibold tracking-wider text-stone-600 uppercase">
              <tr>
                <th scope="col" className="px-5 py-3.5">
                  Học viên
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Vai trò
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Ngày đăng ký
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Trạng thái
                </th>
                <th scope="col" className="px-5 py-3.5 text-right">
                  Thao tác xét duyệt
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-xs text-stone-500">
                    <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-stone-300 border-t-stone-800" />
                    <span className="mt-2 block">Đang tải danh sách học viên...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-xs text-stone-500">
                    Không tìm thấy học viên nào phù hợp với điều kiện tìm kiếm hoặc bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isProcessing = processingId === user.id;

                  return (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-stone-50/60"
                      data-testid={`user-row-${user.id}`}
                    >
                      {/* Cột Học viên */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt=""
                              className="h-9 w-9 rounded-full border border-stone-200 object-cover"
                            />
                          ) : (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-stone-100 text-xs font-semibold text-stone-700">
                              {getInitials(user.fullName, user.email)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="truncate font-medium text-stone-900">
                              {user.fullName || 'Chưa đặt tên'}
                            </div>
                            <div className="truncate text-xs text-stone-500">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Cột Vai trò */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {user.role === 'admin' ? (
                          <Badge
                            variant="subject"
                            className="border-purple-200 bg-purple-50 text-[11px] text-purple-800"
                          >
                            Quản trị viên
                          </Badge>
                        ) : (
                          <Badge
                            variant="neutral"
                            className="border-stone-200 bg-stone-100 text-[11px] text-stone-700"
                          >
                            Học viên
                          </Badge>
                        )}
                      </td>

                      {/* Cột Ngày đăng ký */}
                      <td className="px-5 py-4 text-xs whitespace-nowrap text-stone-600">
                        {formatDate(user.createdAt)}
                      </td>

                      {/* Cột Trạng thái */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {user.status === 'approved' && (
                          <Badge
                            variant="approved"
                            className="border-emerald-300 bg-emerald-50 font-medium text-emerald-800"
                          >
                            Đã duyệt
                          </Badge>
                        )}
                        {user.status === 'pending' && (
                          <Badge
                            variant="draft"
                            className="border-amber-300 bg-amber-50 font-medium text-amber-800"
                          >
                            Chờ duyệt
                          </Badge>
                        )}
                        {user.status === 'rejected' && (
                          <Badge
                            variant="neutral"
                            className="border-stone-300 bg-stone-100 font-medium text-stone-600"
                          >
                            Từ chối
                          </Badge>
                        )}
                      </td>

                      {/* Cột Thao tác */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {user.status !== 'approved' && (
                            <Button
                              variant="subject"
                              size="sm"
                              disabled={isProcessing}
                              onClick={() => handleStatusChange(user.id, 'approved')}
                              className="h-8 gap-1 text-xs"
                            >
                              <Check className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>{user.status === 'rejected' ? 'Duyệt lại' : 'Duyệt'}</span>
                            </Button>
                          )}

                          {user.status !== 'rejected' && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isProcessing}
                              onClick={() => handleStatusChange(user.id, 'rejected')}
                              className="h-8 gap-1 text-xs text-rose-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-800"
                            >
                              <Ban className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>{user.status === 'approved' ? 'Khóa / Hủy' : 'Từ chối'}</span>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
