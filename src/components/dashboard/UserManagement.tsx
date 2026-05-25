'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Package,
  Bike,
  Shield,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  Star,
  Car,
  Truck as TruckIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

// ============================================
// Types
// ============================================
interface UserItem {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  role: string;
  avatar: string | null;
  isActive: boolean;
  createdAt: string;
  _count: {
    sentParcels: number;
  };
  captainProfile?: {
    id: string;
    vehicleType: string;
    vehicleBrand: string | null;
    isOnline: boolean;
    rating: number;
    totalDeliveries: number;
  } | null;
}

interface UserDetail extends UserItem {
  captainProfile?: {
    id: string;
    vehicleType: string;
    vehicleBrand: string | null;
    licensePlate: string | null;
    isOnline: boolean;
    isAvailable: boolean;
    rating: number;
    totalDeliveries: number;
    totalRatingCount: number;
    idVerified: boolean;
  } | null;
  recentParcels?: {
    id: string;
    trackingNumber: string;
    status: string;
    receiverName: string;
    deliveryFee: number;
    createdAt: string;
  }[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UserStats {
  total: number;
  customers: number;
  captains: number;
  admins: number;
}

// ============================================
// Constants
// ============================================
const roleMap: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  ADMIN: { label: 'مدير', color: 'text-rose-700', bgColor: 'bg-rose-100', icon: Shield },
  CUSTOMER: { label: 'عميل', color: 'text-blue-700', bgColor: 'bg-blue-100', icon: Package },
  CAPTAIN: { label: 'كابتن', color: 'text-amber-700', bgColor: 'bg-amber-100', icon: Bike },
};

const vehicleTypeMap: Record<string, { label: string; icon: React.ElementType }> = {
  MOTORCYCLE: { label: 'دراجة نارية', icon: Bike },
  CAR: { label: 'سيارة', icon: Car },
  VAN: { label: 'فان', icon: TruckIcon },
  TRUCK: { label: 'شاحنة', icon: TruckIcon },
};

const statusParcelMap: Record<string, { label: string; color: string; bgColor: string }> = {
  PENDING: { label: 'معلق', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  PICKED_UP: { label: 'تم الاستلام', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  IN_TRANSIT: { label: 'قيد التوصيل', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  DELIVERED: { label: 'تم التسليم', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  CANCELLED: { label: 'ملغي', color: 'text-red-700', bgColor: 'bg-red-100' },
  RETURNED: { label: 'مرتجع', color: 'text-violet-700', bgColor: 'bg-violet-100' },
};

// ============================================
// Helper: Star rating component
// ============================================
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= Math.round(rating)
              ? 'fill-emerald-500 text-emerald-500'
              : 'text-muted-foreground/30'
          }`}
        />
      ))}
      <span className="text-xs text-muted-foreground mr-1">
        ({rating.toFixed(1)})
      </span>
    </div>
  );
}

// ============================================
// Main Component
// ============================================
export default function UserManagement() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    customers: 0,
    captains: 0,
    admins: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [creating, setCreating] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Create form
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'CUSTOMER',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // ============================================
  // Fetch users
  // ============================================
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('saree3_token');
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '20',
      });
      if (roleFilter && roleFilter !== 'all') {
        params.set('role', roleFilter);
      }
      if (statusFilter && statusFilter !== 'all') {
        params.set('isActive', statusFilter === 'active' ? 'true' : 'false');
      }
      if (search) {
        params.set('search', search);
      }

      const res = await fetch(`/api/users?${params}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();
      if (json.success) {
        setUsers(json.data);
        setPagination(json.pagination);
        if (json.stats) {
          setStats(json.stats);
        }
      }
    } catch (err) {
      console.error('خطأ في جلب المستخدمين:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, roleFilter, statusFilter, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ============================================
  // Form validation
  // ============================================
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'الاسم مطلوب';
    if (!form.phone.trim()) errors.phone = 'رقم الهاتف مطلوب';
    if (!form.password.trim()) errors.password = 'كلمة المرور مطلوبة';
    if (form.password.trim().length < 6) errors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'البريد الإلكتروني غير صحيح';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ============================================
  // Create user
  // ============================================
  const handleCreate = async () => {
    if (!validateForm()) return;
    setCreating(true);
    try {
      const token = localStorage.getItem('saree3_token');
      const body: Record<string, string> = {
        name: form.name,
        phone: form.phone,
        password: form.password,
        role: form.role,
      };
      if (form.email.trim()) body.email = form.email;

      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('تم إنشاء المستخدم بنجاح');
        setCreateOpen(false);
        resetForm();
        fetchUsers();
      } else {
        toast.error(json.error || 'حدث خطأ أثناء إنشاء المستخدم');
      }
    } catch {
      toast.error('حدث خطأ في الاتصال بالخادم');
    } finally {
      setCreating(false);
    }
  };

  // ============================================
  // Toggle user active status
  // ============================================
  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('saree3_token');
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(currentStatus ? 'تم تعطيل الحساب' : 'تم تفعيل الحساب');
        fetchUsers();
        if (selectedUser?.id === userId) {
          setSelectedUser({ ...selectedUser, isActive: !currentStatus });
        }
      } else {
        toast.error(json.error || 'حدث خطأ');
      }
    } catch {
      toast.error('حدث خطأ في الاتصال بالخادم');
    }
  };

  // ============================================
  // Delete user
  // ============================================
  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      const token = localStorage.getItem('saree3_token');
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();
      if (json.success) {
        toast.success('تم حذف المستخدم بنجاح');
        setDeleteOpen(false);
        setDetailOpen(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        toast.error(json.error || 'حدث خطأ أثناء حذف المستخدم');
      }
    } catch {
      toast.error('حدث خطأ في الاتصال بالخادم');
    }
  };

  // ============================================
  // Open user detail
  // ============================================
  const openDetail = async (user: UserItem) => {
    setDetailLoading(true);
    setDetailOpen(true);
    try {
      const token = localStorage.getItem('saree3_token');
      const res = await fetch(`/api/users/${user.id}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();
      if (json.success) {
        setSelectedUser(json.data);
      } else {
        setSelectedUser(user as UserDetail);
      }
    } catch {
      setSelectedUser(user as UserDetail);
    } finally {
      setDetailLoading(false);
    }
  };

  // ============================================
  // Reset form
  // ============================================
  const resetForm = () => {
    setForm({ name: '', email: '', phone: '', password: '', role: 'CUSTOMER' });
    setFormErrors({});
  };

  // ============================================
  // Format date
  // ============================================
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ============================================
  // Render
  // ============================================
  return (
    <div className="space-y-4">
      {/* ============================================ */}
      {/* Stats Row */}
      {/* ============================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Users */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
                  <p className="text-xl font-bold text-foreground mt-1">
                    {loading ? <Skeleton className="h-7 w-10" /> : stats.total}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Customers */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">العملاء</p>
                  <p className="text-xl font-bold text-emerald-600 mt-1">
                    {loading ? <Skeleton className="h-7 w-10" /> : stats.customers}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Captains */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">الكبائن</p>
                  <p className="text-xl font-bold text-amber-600 mt-1">
                    {loading ? <Skeleton className="h-7 w-10" /> : stats.captains}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Bike className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Admins */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">المدراء</p>
                  <p className="text-xl font-bold text-rose-600 mt-1">
                    {loading ? <Skeleton className="h-7 w-10" /> : stats.admins}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-rose-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ============================================ */}
      {/* Actions Bar */}
      {/* ============================================ */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم، الهاتف أو البريد..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="pr-10 h-9"
              />
            </div>

            {/* Role Filter */}
            <Select
              value={roleFilter}
              onValueChange={(val) => {
                setRoleFilter(val);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            >
              <SelectTrigger className="w-full sm:w-36 h-9">
                <Filter className="h-4 w-4 ml-2" />
                <SelectValue placeholder="جميع الأدوار" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="ADMIN">مدراء</SelectItem>
                <SelectItem value="CUSTOMER">عملاء</SelectItem>
                <SelectItem value="CAPTAIN">كبائن</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            >
              <SelectTrigger className="w-full sm:w-36 h-9">
                <SelectValue placeholder="جميع الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
              </SelectContent>
            </Select>

            {/* Add User Button */}
            <Button
              onClick={() => setCreateOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-9"
            >
              <Plus className="h-4 w-4 ml-1" />
              إضافة مستخدم
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* Users Table (Desktop) */}
      {/* ============================================ */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead>المستخدم</TableHead>
                  <TableHead>الدور</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الطرود</TableHead>
                  <TableHead>تاريخ الانضمام</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-9 w-9 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-14 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-12" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-8" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-8" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                          <Users className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground font-medium">لا يوجد مستخدمين</p>
                        <p className="text-sm text-muted-foreground/70">
                          {search || roleFilter !== 'all' || statusFilter !== 'all'
                            ? 'جرب تغيير معايير البحث'
                            : 'ابدأ بإضافة مستخدم جديد'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user, index) => {
                    const role = roleMap[user.role] || roleMap.CUSTOMER;
                    const RoleIcon = role.icon;

                    return (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-muted/50 border-b transition-colors cursor-pointer"
                        onClick={() => openDetail(user)}
                      >
                        {/* User Info */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                  {user.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              {user.role === 'CAPTAIN' && user.captainProfile?.isOnline && (
                                <div className="absolute -bottom-0.5 -left-0.5 h-3 w-3 rounded-full border-2 border-background bg-emerald-500" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{user.name}</p>
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">{user.phone}</p>
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Role Badge */}
                        <TableCell>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${role.color} ${role.bgColor}`}
                          >
                            <RoleIcon className="h-3 w-3" />
                            {role.label}
                          </span>
                        </TableCell>

                        {/* Status Toggle */}
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={user.isActive}
                              onCheckedChange={() => toggleUserStatus(user.id, user.isActive)}
                            />
                            <span className={`text-xs ${user.isActive ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                              {user.isActive ? 'نشط' : 'غير نشط'}
                            </span>
                          </div>
                        </TableCell>

                        {/* Parcels Count */}
                        <TableCell className="text-sm font-medium">
                          {user._count.sentParcels}
                        </TableCell>

                        {/* Created Date */}
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </TableCell>

                        {/* Actions */}
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openDetail(user)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-8 w-8 ${
                                user.isActive
                                  ? 'text-red-500 hover:text-red-600'
                                  : 'text-emerald-500 hover:text-emerald-600'
                              }`}
                              onClick={() => toggleUserStatus(user.id, user.isActive)}
                            >
                              {user.isActive ? (
                                <UserX className="h-4 w-4" />
                              ) : (
                                <UserCheck className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* Users Cards (Mobile) */}
      {/* ============================================ */}
      <div className="md:hidden space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <Skeleton className="h-6 w-14 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : users.length === 0 ? (
          <Card>
            <CardContent className="py-16">
              <div className="flex flex-col items-center gap-3">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">لا يوجد مستخدمين</p>
                <p className="text-sm text-muted-foreground/70">
                  {search || roleFilter !== 'all' || statusFilter !== 'all'
                    ? 'جرب تغيير معايير البحث'
                    : 'ابدأ بإضافة مستخدم جديد'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          users.map((user, index) => {
            const role = roleMap[user.role] || roleMap.CUSTOMER;
            const RoleIcon = role.icon;

            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => openDetail(user)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {user.role === 'CAPTAIN' && user.captainProfile?.isOnline && (
                            <div className="absolute -bottom-0.5 -left-0.5 h-3 w-3 rounded-full border-2 border-background bg-emerald-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{user.name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{user.phone}</span>
                          </div>
                          {user.email && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{user.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${role.color} ${role.bgColor}`}
                      >
                        <RoleIcon className="h-3 w-3" />
                        {role.label}
                      </span>
                    </div>

                    <Separator className="my-3" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          <span>{user._count.sentParcels} طرد</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(user.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Switch
                          checked={user.isActive}
                          onCheckedChange={() => toggleUserStatus(user.id, user.isActive)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* ============================================ */}
      {/* Pagination */}
      {/* ============================================ */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            عرض {((pagination.page - 1) * pagination.limit) + 1} إلى{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} من{' '}
            {pagination.total} مستخدم
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
            >
              <ChevronRight className="h-4 w-4 ml-1" />
              السابق
            </Button>
            <div className="flex items-center gap-1">
              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  const pageNum = pagination.page <= 3
                    ? i + 1
                    : pagination.page + i - 2;
                  if (pageNum < 1 || pageNum > pagination.totalPages)
                    return null;
                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.page === pageNum ? 'default' : 'outline'}
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() =>
                        setPagination((prev) => ({ ...prev, page: pageNum }))
                      }
                    >
                      {pageNum}
                    </Button>
                  );
                }
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
            >
              التالي
              <ChevronLeft className="h-4 w-4 mr-1" />
            </Button>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* Create User Dialog */}
      {/* ============================================ */}
      <Dialog open={createOpen} onOpenChange={(open) => {
        setCreateOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-right">إضافة مستخدم جديد</DialogTitle>
            <DialogDescription className="text-right">
              أدخل بيانات المستخدم الجديد
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label>
                الاسم <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="أدخل اسم المستخدم"
                value={form.name}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value });
                  if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                }}
                className={formErrors.name ? 'border-red-500' : ''}
              />
              {formErrors.name && (
                <p className="text-xs text-red-500">{formErrors.name}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label>
                رقم الهاتف <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="05XXXXXXXX"
                value={form.phone}
                onChange={(e) => {
                  setForm({ ...form, phone: e.target.value });
                  if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' });
                }}
                className={formErrors.phone ? 'border-red-500' : ''}
                dir="ltr"
              />
              {formErrors.phone && (
                <p className="text-xs text-red-500">{formErrors.phone}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label>البريد الإلكتروني <span className="text-muted-foreground text-xs">(اختياري)</span></Label>
              <Input
                placeholder="email@example.com"
                type="email"
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                }}
                className={formErrors.email ? 'border-red-500' : ''}
                dir="ltr"
              />
              {formErrors.email && (
                <p className="text-xs text-red-500">{formErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label>
                كلمة المرور <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="6 أحرف على الأقل"
                type="password"
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  if (formErrors.password) setFormErrors({ ...formErrors, password: '' });
                }}
                className={formErrors.password ? 'border-red-500' : ''}
                dir="ltr"
              />
              {formErrors.password && (
                <p className="text-xs text-red-500">{formErrors.password}</p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label>
                الدور <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.role}
                onValueChange={(val) => setForm({ ...form, role: val })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUSTOMER">عميل</SelectItem>
                  <SelectItem value="CAPTAIN">كابتن</SelectItem>
                  <SelectItem value="ADMIN">مدير</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex-row-reverse gap-2">
            <Button
              onClick={handleCreate}
              disabled={creating || !form.name || !form.phone || !form.password}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {creating && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
              إضافة المستخدم
            </Button>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================ */}
      {/* User Detail Dialog */}
      {/* ============================================ */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-right">تفاصيل المستخدم</DialogTitle>
            <DialogDescription className="text-right">
              معلومات كاملة عن المستخدم
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          ) : selectedUser ? (
            <div className="space-y-5 py-4">
              {/* Profile Header */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                <div className="relative">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                      {selectedUser.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {selectedUser.role === 'CAPTAIN' && selectedUser.captainProfile?.isOnline && (
                    <div className="absolute -bottom-1 -left-1 h-5 w-5 rounded-full border-3 border-background bg-emerald-500" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground">
                    {selectedUser.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {selectedUser.phone}
                    </span>
                  </div>
                  {selectedUser.email && (
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {selectedUser.email}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {(() => {
                    const role = roleMap[selectedUser.role] || roleMap.CUSTOMER;
                    const RoleIcon = role.icon;
                    return (
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${role.color} ${role.bgColor}`}
                      >
                        <RoleIcon className="h-3 w-3" />
                        {role.label}
                      </span>
                    );
                  })()}
                  <Badge
                    className={
                      selectedUser.isActive
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-red-100 text-red-700 hover:bg-red-100'
                    }
                  >
                    {selectedUser.isActive ? 'نشط' : 'غير نشط'}
                  </Badge>
                </div>
              </div>

              {/* Info Grid */}
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground text-xs">تاريخ الانضمام</p>
                        <p className="font-medium">{formatDate(selectedUser.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground text-xs">الطرود</p>
                        <p className="font-medium">{selectedUser._count.sentParcels} طرد</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Captain Profile */}
              {selectedUser.role === 'CAPTAIN' && selectedUser.captainProfile && (
                <Card className="border-amber-200 bg-amber-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Bike className="h-4 w-4 text-amber-600" />
                      ملف الكابتن
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3 text-center mb-4">
                      <div>
                        <p className="text-2xl font-bold text-foreground">
                          {selectedUser.captainProfile.totalDeliveries}
                        </p>
                        <p className="text-xs text-muted-foreground">توصيلة</p>
                      </div>
                      <div>
                        <StarRating rating={selectedUser.captainProfile.rating} />
                        <p className="text-xs text-muted-foreground mt-1">التقييم</p>
                      </div>
                      <div>
                        <Badge
                          className={
                            selectedUser.captainProfile.isOnline
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-gray-100 text-gray-500'
                          }
                        >
                          {selectedUser.captainProfile.isOnline ? 'متصل' : 'غير متصل'}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">الحالة</p>
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">نوع المركبة</p>
                        <p className="font-medium">
                          {(() => {
                            const v = vehicleTypeMap[selectedUser.captainProfile!.vehicleType];
                            return v ? v.label : selectedUser.captainProfile!.vehicleType;
                          })()}
                        </p>
                      </div>
                      {'vehicleBrand' in selectedUser.captainProfile && (
                        <div>
                          <p className="text-muted-foreground">الماركة</p>
                          <p className="font-medium">
                            {selectedUser.captainProfile.vehicleBrand || 'غير محدد'}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Parcels */}
              {selectedUser.recentParcels && selectedUser.recentParcels.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">آخر الطرود</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedUser.recentParcels.map((parcel) => {
                        const parcelStatus = statusParcelMap[parcel.status] || statusParcelMap.PENDING;
                        return (
                          <div
                            key={parcel.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                          >
                            <div>
                              <p className="text-sm font-mono font-medium">{parcel.trackingNumber}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                إلى {parcel.receiverName} • {formatDate(parcel.createdAt)}
                              </p>
                            </div>
                            <div className="text-left">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${parcelStatus.color} ${parcelStatus.bgColor}`}
                              >
                                {parcelStatus.label}
                              </span>
                              <p className="text-xs text-muted-foreground mt-1">{parcel.deliveryFee} ر.س</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  size="sm"
                  variant={selectedUser.isActive ? 'destructive' : 'default'}
                  className={
                    !selectedUser.isActive
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : ''
                  }
                  onClick={() => toggleUserStatus(selectedUser.id, selectedUser.isActive)}
                >
                  {selectedUser.isActive ? (
                    <>
                      <UserX className="h-4 w-4 ml-1" />
                      تعطيل الحساب
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4 ml-1" />
                      تفعيل الحساب
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="h-4 w-4 ml-1" />
                  حذف المستخدم
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* ============================================ */}
      {/* Delete Confirmation Dialog */}
      {/* ============================================ */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-right">تأكيد الحذف</DialogTitle>
            <DialogDescription className="text-right">
              هل أنت متأكد من حذف المستخدم &quot;{selectedUser?.name}&quot؛؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row-reverse gap-2">
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 ml-1" />
              حذف
            </Button>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
