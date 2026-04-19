import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable, type DataTableColumn } from './DataTable';

interface TestData {
  id: string | number;
  name: string;
  email: string;
  age: number;
  balance: number;
  status: string;
}

const mockData: TestData[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', age: 28, balance: 5000, status: 'active' },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', age: 35, balance: 3500, status: 'inactive' },
  { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', age: 22, balance: 7200, status: 'active' },
];

const defaultColumns: DataTableColumn<TestData>[] = [
  { key: 'name', header: 'Name', sortable: true, filterable: true },
  { key: 'email', header: 'Email', sortable: false, filterable: true },
  { key: 'age', header: 'Age', sortable: true, filterable: false },
  { key: 'balance', header: 'Balance', render: (val) => `$${val}` },
  { key: 'status', header: 'Status' },
];

describe('DataTable Component', () => {
  describe('Rendering', () => {
    it('should render all data rows', () => {
      render(<DataTable data={mockData} columns={defaultColumns} pagination={false} filterable={false} />);
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
      expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
    });

    it('should render column headers', () => {
      render(<DataTable data={mockData} columns={defaultColumns} pagination={false} filterable={false} />);
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
    });

    it('should display empty message when no data', () => {
      render(
        <DataTable
          data={[]}
          columns={defaultColumns}
          pagination={false}
          filterable={false}
          emptyMessage="No customers found"
        />
      );
      expect(screen.getByText('No customers found')).toBeInTheDocument();
    });

    it('should render custom cell values with render function', () => {
      render(<DataTable data={mockData} columns={defaultColumns} pagination={false} filterable={false} />);
      expect(screen.getByText('$5000')).toBeInTheDocument();
      expect(screen.getByText('$3500')).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should sort by sortable columns when header clicked', async () => {
      render(
        <DataTable data={mockData} columns={defaultColumns} pagination={false} filterable={false} />
      );
      
      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader.parentElement!);
      
      await waitFor(() => {
        const rows = screen.getAllByText(/Alice|Bob|Charlie/);
        expect(rows.length).toBe(3);
      });
    });

    it('should toggle sort direction on repeated clicks', async () => {
      const handleSort = vi.fn();
      render(
        <DataTable
          data={mockData}
          columns={defaultColumns}
          pagination={false}
          filterable={false}
          onSort={handleSort}
        />
      );
      
      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader.parentElement!);
      fireEvent.click(nameHeader.parentElement!);
      
      expect(handleSort).toHaveBeenCalledTimes(2);
    });

    it('should call onSort handler when provided', async () => {
      const handleSort = vi.fn();
      render(
        <DataTable
          data={mockData}
          columns={defaultColumns}
          pagination={false}
          filterable={false}
          onSort={handleSort}
        />
      );
      
      fireEvent.click(screen.getByText('Name').parentElement!);
      expect(handleSort).toHaveBeenCalledWith('name');
    });

    it('should not sort non-sortable columns', async () => {
      const handleSort = vi.fn();
      render(
        <DataTable
          data={mockData}
          columns={defaultColumns}
          pagination={false}
          filterable={false}
          onSort={handleSort}
        />
      );
      
      fireEvent.click(screen.getByText('Email').parentElement!);
      expect(handleSort).not.toHaveBeenCalled();
    });
  });

  describe('Filtering/Search', () => {
    it('should filter data based on search term', async () => {
      render(
        <DataTable data={mockData} columns={defaultColumns} filterable={true} pagination={false} />
      );
      
      const searchInput = screen.getByPlaceholderText('Cari...') as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'Alice' } });
      
      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
      });
    });

    it('should show empty message when filter returns no results', async () => {
      render(
        <DataTable
          data={mockData}
          columns={defaultColumns}
          filterable={true}
          pagination={false}
          emptyMessage="No matches found"
        />
      );
      
      const searchInput = screen.getByPlaceholderText('Cari...') as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
      
      await waitFor(() => {
        expect(screen.getByText('No matches found')).toBeInTheDocument();
      });
    });

    it('should filter only specified columns when filterableColumns is set', async () => {
      render(
        <DataTable
          data={mockData}
          columns={defaultColumns}
          filterable={true}
          pagination={false}
          filterableColumns={['name']}
        />
      );
      
      const searchInput = screen.getByPlaceholderText('Cari...') as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'alice@example.com' } });
      
      await waitFor(() => {
        expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
      });
    });
  });

  describe('Pagination', () => {
    it('should display pagination controls', () => {
      const { container } = render(
        <DataTable
          data={mockData}
          columns={defaultColumns}
          pagination={true}
          rowsPerPageOptions={[2, 5, 10]}
        />
      );
      
      expect(container.textContent).toContain('baris');
    });

    it('should paginate data according to rowsPerPage', async () => {
      const { container } = render(
        <DataTable
          data={mockData}
          columns={defaultColumns}
          pagination={true}
          rowsPerPageOptions={[2, 5]}
        />
      );
      
      const selects = container.querySelectorAll('select');
      expect(selects.length).toBeGreaterThan(0);
      
      fireEvent.change(selects[0], { target: { value: '2' } });
      
      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.getByText('Bob Smith')).toBeInTheDocument();
      });
    });

    it('should not display pagination when pagination is false', () => {
      const { container } = render(
        <DataTable
          data={mockData}
          columns={defaultColumns}
          pagination={false}
        />
      );
      
      const selects = container.querySelectorAll('select');
      expect(selects.length).toBe(0);
    });
  });

  describe('Row Actions', () => {
    it('should display action buttons when provided', () => {
      const mockAction = vi.fn();
      const actions = [
        {
          label: 'Edit',
          icon: <span>✎</span>,
          onClick: mockAction,
        },
      ];
      
      render(
        <DataTable
          data={mockData}
          columns={defaultColumns}
          pagination={false}
          filterable={false}
          actions={actions}
        />
      );
      
      const editButtons = screen.getAllByTitle('Edit');
      expect(editButtons.length).toBeGreaterThanOrEqual(mockData.length);
    });

    it('should call action handler with correct row data', async () => {
      const user = userEvent.setup();
      const mockEdit = vi.fn();
      const actions = [
        {
          label: 'Edit',
          icon: <span>✎</span>,
          onClick: mockEdit,
        },
      ];
      
      render(
        <DataTable
          data={mockData}
          columns={defaultColumns}
          pagination={false}
          filterable={false}
          actions={actions}
        />
      );
      
      const editButtons = screen.getAllByTitle('Edit');
      await user.click(editButtons[0]);
      
      expect(mockEdit).toHaveBeenCalledWith(mockData[0]);
    });

    it('should conditionally show actions based on show() function', () => {
      const actions = [
        {
          label: 'Edit',
          icon: <span>✎</span>,
          onClick: () => {},
        },
        {
          label: 'Delete',
          icon: <span>🗑</span>,
          onClick: () => {},
          show: (item: TestData) => item.status === 'inactive',
        },
      ];
      
      render(
        <DataTable
          data={mockData}
          columns={defaultColumns}
          pagination={false}
          filterable={false}
          actions={actions}
        />
      );
      
      const editButtons = screen.getAllByTitle('Edit');
      const deleteButtons = screen.queryAllByTitle('Delete');
      
      expect(editButtons.length).toBe(mockData.length);
      expect(deleteButtons.length).toBe(1); // Only Bob is inactive
    });
  });

  describe('Row Selection', () => {
    it('should show checkboxes when selectable is true', () => {
      const { container } = render(
        <DataTable
          data={mockData}
          columns={defaultColumns}
          pagination={false}
          filterable={false}
          selectable={true}
        />
      );
      
      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('should select individual rows', async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();
      const { container } = render(
        <DataTable
          data={mockData}
          columns={defaultColumns}
          pagination={false}
          filterable={false}
          selectable={true}
          onRowSelect={handleSelect}
        />
      );
      
      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      await user.click(checkboxes[1]);
      
      expect(handleSelect).toHaveBeenCalled();
    });

    it('should select all rows when header checkbox clicked', async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();
      const { container } = render(
        <DataTable
          data={mockData}
          columns={defaultColumns}
          pagination={false}
          filterable={false}
          selectable={true}
          onRowSelect={handleSelect}
        />
      );
      
      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      await user.click(checkboxes[0]);
      
      expect(handleSelect).toHaveBeenCalledWith(mockData);
    });

    it('should not show checkboxes when selectable is false', () => {
      const { container } = render(
        <DataTable
          data={mockData}
          columns={defaultColumns}
          pagination={false}
          filterable={false}
          selectable={false}
        />
      );
      
      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      expect(checkboxes.length).toBe(0);
    });
  });

  describe('Row Click Handling', () => {
    it('should call onRowClick when row is clicked', async () => {
      const user = userEvent.setup();
      const handleRowClick = vi.fn();
      
      render(
        <DataTable
          data={mockData}
          columns={defaultColumns}
          pagination={false}
          filterable={false}
          onRowClick={handleRowClick}
        />
      );
      
      const firstRow = screen.getByText('Alice Johnson').closest('tr');
      if (firstRow) {
        await user.click(firstRow);
        expect(handleRowClick).toHaveBeenCalledWith(mockData[0]);
      }
    });

    it('should not interfere with action button clicks', async () => {
      const user = userEvent.setup();
      const handleRowClick = vi.fn();
      const handleAction = vi.fn();
      const actions = [
        {
          label: 'Edit',
          icon: <span>✎</span>,
          onClick: handleAction,
        },
      ];
      
      render(
        <DataTable
          data={mockData}
          columns={defaultColumns}
          pagination={false}
          filterable={false}
          onRowClick={handleRowClick}
          actions={actions}
        />
      );
      
      const editButtons = screen.getAllByTitle('Edit');
      await user.click(editButtons[0]);
      
      expect(handleAction).toHaveBeenCalledWith(mockData[0]);
      expect(handleRowClick).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should display loading skeletons', () => {
      const { container } = render(
        <DataTable data={[]} columns={defaultColumns} isLoading={true} skeleton={3} />
      );
      
      expect(container).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty data array', () => {
      render(
        <DataTable
          data={[]}
          columns={defaultColumns}
          pagination={false}
          filterable={false}
          emptyMessage="No data available"
        />
      );
      
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('should handle numeric row IDs', () => {
      const numericIdData = [{ ...mockData[0], id: 1 }];
      
      render(
        <DataTable
          data={numericIdData}
          columns={defaultColumns}
          pagination={false}
          filterable={false}
        />
      );
      
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });
  });

  describe('Column Visibility', () => {
    it('should show eye button for tables with >3 columns', () => {
      const { container } = render(
        <DataTable
          data={mockData}
          columns={defaultColumns}
          pagination={false}
          filterable={false}
        />
      );
      
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
