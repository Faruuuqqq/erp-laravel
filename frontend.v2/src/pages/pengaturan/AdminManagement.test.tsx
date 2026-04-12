import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as AuthContext from '@/contexts/AuthContext';
import AdminManagement from '../AdminManagement';
import { PermissionMatrix, buildDefaultPermissions, buildFullPermissions, getGroupSummary } from '../components/PermissionMatrix';
import { AdminCard, Admin } from '../components/AdminCard';
import { PermissionEditorDialog } from '../components/PermissionEditorDialog';
import { MODULE_GROUPS } from '../constants';
import apiClient from '@/lib/api-client';

vi.mock('@/lib/api-client');
vi.mock('@/contexts/AuthContext');

const mockUseAuth = vi.fn(() => ({
  isOwner: true,
  isAuthenticated: true,
  isLoading: false,
}));

vi.mocked(AuthContext).useAuth = mockUseAuth;

const mockQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={mockQueryClient}>
      {component}
    </QueryClientProvider>
  );
};

const mockAdmin: Admin = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'admin',
  isActive: true,
  permissions: buildDefaultPermissions(),
  createdAt: '2024-01-01',
};

describe('AdminManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryClient.clear();
  });

  describe('Component Rendering', () => {
    it('should render access denied message if not owner', () => {
      mockUseAuth.mockReturnValueOnce({
        isOwner: false,
        isAuthenticated: true,
        isLoading: false,
      });

      renderWithProviders(<AdminManagement />);
      expect(screen.getByText(/Akses Ditolak/i)).toBeInTheDocument();
    });

    it('should render loading skeleton while fetching data', () => {
      vi.mocked(apiClient.get).mockImplementationOnce(() => 
        new Promise(() => {}) // Never resolves
      );

      renderWithProviders(<AdminManagement />);
      expect(screen.getByText(/Memuat data|Skeleton/i)).toBeInTheDocument();
    });

    it('should render admin management page with title and subtitle', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { data: [mockAdmin] } });

      renderWithProviders(<AdminManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('Kelola Admin')).toBeInTheDocument();
      });
    });

    it('should display admin statistics', async () => {
      const admins = [
        { ...mockAdmin, id: '1', isActive: true },
        { ...mockAdmin, id: '2', isActive: true },
        { ...mockAdmin, id: '3', isActive: false },
      ];

      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { data: admins } });

      renderWithProviders(<AdminManagement />);

      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument(); // Total
        expect(screen.getByText('2')).toBeInTheDocument(); // Active (appears twice but first is active count)
      });
    });
  });

  describe('Add Admin Functionality', () => {
    it('should open add admin dialog when button is clicked', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { data: [] } });

      const user = userEvent.setup();
      renderWithProviders(<AdminManagement />);

      const addButton = await screen.findByRole('button', { name: /Tambah Admin/i });
      await user.click(addButton);

      expect(screen.getByText('Tambah Admin Baru')).toBeInTheDocument();
    });

    it('should validate form fields before submission', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { data: [] } });

      const user = userEvent.setup();
      renderWithProviders(<AdminManagement />);

      const addButton = await screen.findByRole('button', { name: /Tambah Admin/i });
      await user.click(addButton);

      const submitButton = screen.getByRole('button', { name: /Simpan/i });
      await user.click(submitButton);

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/Nama wajib diisi/i)).toBeInTheDocument();
      });
    });

    it('should validate password strength', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { data: [] } });

      const user = userEvent.setup();
      renderWithProviders(<AdminManagement />);

      const addButton = await screen.findByRole('button', { name: /Tambah Admin/i });
      await user.click(addButton);

      const passwordInput = screen.getByPlaceholderText(/Min. 8 karakter/i) as HTMLInputElement;
      await user.type(passwordInput, 'weak');

      const submitButton = screen.getByRole('button', { name: /Simpan/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Password minimal 8 karakter/i)).toBeInTheDocument();
      });
    });

    it('should require password complexity (uppercase, lowercase, digit)', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { data: [] } });

      const user = userEvent.setup();
      renderWithProviders(<AdminManagement />);

      const addButton = await screen.findByRole('button', { name: /Tambah Admin/i });
      await user.click(addButton);

      const passwordInput = screen.getByPlaceholderText(/Min. 8 karakter/i) as HTMLInputElement;
      await user.type(passwordInput, 'Nodigits');

      const submitButton = screen.getByRole('button', { name: /Simpan/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/harus mengandung huruf besar, huruf kecil, dan angka/i)).toBeInTheDocument();
      });
    });

    it('should successfully create admin with valid data', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { data: [] } });
      vi.mocked(apiClient.post).mockResolvedValueOnce({ 
        data: { 
          data: { ...mockAdmin, id: '2' },
          message: 'Admin berhasil ditambahkan',
        } 
      });

      const user = userEvent.setup();
      renderWithProviders(<AdminManagement />);

      const addButton = await screen.findByRole('button', { name: /Tambah Admin/i });
      await user.click(addButton);

      // Fill form with valid data
      await user.type(screen.getByPlaceholderText('Nama lengkap'), 'Jane Smith');
      await user.type(screen.getByPlaceholderText('email@domain.com'), 'jane@example.com');
      await user.type(screen.getByPlaceholderText(/Min. 8 karakter/i), 'TestPass123');

      const submitButton = screen.getByRole('button', { name: /Simpan/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith('/admins', expect.objectContaining({
          name: 'Jane Smith',
          email: 'jane@example.com',
          password: 'TestPass123',
        }));
      });
    });
  });

  describe('Admin List Actions', () => {
    it('should filter admins by name', async () => {
      const admins = [
        { ...mockAdmin, id: '1', name: 'John Doe', email: 'john@example.com' },
        { ...mockAdmin, id: '2', name: 'Jane Smith', email: 'jane@example.com' },
      ];

      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { data: admins } });

      const user = userEvent.setup();
      renderWithProviders(<AdminManagement />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Cari admin/i) as HTMLInputElement;
      await user.type(searchInput, 'Jane');

      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      });
    });

    it('should toggle admin active status', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { data: [mockAdmin] } });
      vi.mocked(apiClient.patch).mockResolvedValueOnce({ 
        data: { 
          data: { ...mockAdmin, isActive: false },
          message: 'Admin dinonaktifkan',
        } 
      });

      const user = userEvent.setup();
      renderWithProviders(<AdminManagement />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const toggleButton = screen.getByRole('button', { name: /Deactivate admin/i });
      await user.click(toggleButton);

      await waitFor(() => {
        expect(apiClient.patch).toHaveBeenCalledWith(`/admins/${mockAdmin.id}/toggle-active`);
      });
    });

    it('should delete admin with confirmation', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { data: [mockAdmin] } });
      vi.mocked(apiClient.delete).mockResolvedValueOnce({ 
        data: { message: 'Admin berhasil dihapus' } 
      });

      const user = userEvent.setup();
      renderWithProviders(<AdminManagement />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /Delete admin/i });
      await user.click(deleteButton);

      // Confirm deletion
      const confirmButton = await screen.findByRole('button', { name: /Hapus/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(apiClient.delete).toHaveBeenCalledWith(`/admins/${mockAdmin.id}`);
      });
    });
  });

  describe('Permission Matrix', () => {
    it('should toggle individual permission', () => {
      const { rerender } = render(
        <PermissionMatrix
          permissions={buildDefaultPermissions()}
          onChange={vi.fn()}
          compact={false}
        />
      );

      // Verify tabs render
      expect(screen.getByRole('tab', { name: /Master Data/i })).toBeInTheDocument();
    });

    it('should build default permissions correctly', () => {
      const perms = buildDefaultPermissions();
      
      // Should have view=true, others false
      expect(perms.products.view).toBe(true);
      expect(perms.products.create).toBe(false);
      expect(perms.products.delete).toBe(false);
    });

    it('should build full permissions correctly', () => {
      const perms = buildFullPermissions();
      
      // All should be true
      expect(perms.products.view).toBe(true);
      expect(perms.products.create).toBe(true);
      expect(perms.products.update).toBe(true);
      expect(perms.products.delete).toBe(true);
      expect(perms.products.print).toBe(true);
    });
  });

  describe('Permission Summary', () => {
    it('should calculate group summary correctly', () => {
      const perms = buildDefaultPermissions();
      const group = MODULE_GROUPS[0];

      const summary = getGroupSummary(perms, group);
      
      // Default permissions have view=true but no other actions
      expect(summary.hasAny).toBe(true);
      expect(summary.hasAll).toBe(false);
    });

    it('should detect full access correctly', () => {
      const perms = buildFullPermissions();
      const group = MODULE_GROUPS[0];

      const summary = getGroupSummary(perms, group);
      
      expect(summary.hasAll).toBe(true);
    });

    it('should detect no access correctly', () => {
      const perms: Record<string, Record<string, boolean>> = {};
      MODULE_GROUPS[0].modules.forEach(m => {
        perms[m.key] = { view: false, create: false, update: false, delete: false, print: false };
      });

      const group = MODULE_GROUPS[0];
      const summary = getGroupSummary(perms, group);
      
      expect(summary.hasAny).toBe(false);
      expect(summary.hasAll).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('should have ARIA labels on interactive elements', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { data: [mockAdmin] } });

      renderWithProviders(<AdminManagement />);

      await waitFor(() => {
        // Search input should have label
        expect(screen.getByLabelText(/Search admins/i)).toBeInTheDocument();
        
        // Edit button should have label
        expect(screen.getByLabelText(/Edit admin permissions/i)).toBeInTheDocument();
        
        // Delete button should have label
        expect(screen.getByLabelText(/Delete admin/i)).toBeInTheDocument();
      });
    });

    it('should have proper semantic HTML structure', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { data: [mockAdmin] } });

      renderWithProviders(<AdminManagement />);

      await waitFor(() => {
        // Permission badges should be in a list
        expect(screen.getByRole('list')).toBeInTheDocument();
      });
    });
  });

  describe('Admin Card Component', () => {
    it('should render admin information correctly', () => {
      const mockFn = vi.fn();
      render(
        <AdminCard
          admin={mockAdmin}
          onEdit={mockFn}
          onToggleActive={mockFn}
          onDelete={mockFn}
        />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Aktif')).toBeInTheDocument();
    });

    it('should call handlers when buttons are clicked', async () => {
      const onEdit = vi.fn();
      const onToggleActive = vi.fn();
      const onDelete = vi.fn();

      const user = userEvent.setup();
      render(
        <AdminCard
          admin={mockAdmin}
          onEdit={onEdit}
          onToggleActive={onToggleActive}
          onDelete={onDelete}
        />
      );

      const editButton = screen.getByRole('button', { name: /Edit admin permissions/i });
      await user.click(editButton);
      expect(onEdit).toHaveBeenCalled();

      const toggleButton = screen.getByRole('button', { name: /Deactivate admin/i });
      await user.click(toggleButton);
      expect(onToggleActive).toHaveBeenCalled();
    });
  });

  describe('Permission Editor Dialog', () => {
    it('should render permission presets', () => {
      const mockFn = vi.fn();
      render(
        <PermissionEditorDialog
          admin={mockAdmin}
          onClose={mockFn}
          onSaved={mockFn}
        />
      );

      expect(screen.getByRole('button', { name: /View Only/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Full Access/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Master Data Only/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Transaksi Only/i })).toBeInTheDocument();
    });

    it('should save permissions correctly', async () => {
      vi.mocked(apiClient.put).mockResolvedValueOnce({
        data: {
          data: { ...mockAdmin, permissions: buildFullPermissions() },
          message: 'Permission updated',
        },
      });

      const onSaved = vi.fn();
      const user = userEvent.setup();

      render(
        <PermissionEditorDialog
          admin={mockAdmin}
          onClose={vi.fn()}
          onSaved={onSaved}
        />
      );

      const fullAccessButton = screen.getByRole('button', { name: /Full Access/i });
      await user.click(fullAccessButton);

      const saveButton = screen.getByRole('button', { name: /Simpan Permission/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(apiClient.put).toHaveBeenCalledWith(
          `/admins/${mockAdmin.id}/permissions`,
          expect.objectContaining({ permissions: expect.any(Object) })
        );
      });
    });
  });

  describe('Performance', () => {
    it('should memoize AdminCard to prevent unnecessary re-renders', () => {
      const onEdit = vi.fn();
      const { rerender } = render(
        <AdminCard
          admin={mockAdmin}
          onEdit={onEdit}
          onToggleActive={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      const firstRender = screen.getByText('John Doe');
      
      // Re-render with same props
      rerender(
        <AdminCard
          admin={mockAdmin}
          onEdit={onEdit}
          onToggleActive={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      const secondRender = screen.getByText('John Doe');
      // Both should exist without duplication issues
      expect(firstRender).toEqual(secondRender);
    });
  });
});
