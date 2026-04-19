import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormBuilder, type FormFieldSchema, type FormSchema } from './FormBuilder';

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe('FormBuilder Component', () => {
  const mockOnSubmit = vi.fn();
  const mockOnChange = vi.fn();

  const basicSchema: FormSchema = {
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'age', label: 'Age', type: 'number' },
    ],
  };

  const initialValues = { name: '', email: '', age: '' };

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnChange.mockClear();
  });

  describe('Field Rendering', () => {
    it('should render text input field', () => {
      const { container } = render(
        <FormBuilder
          schema={basicSchema}
          values={initialValues}
          onSubmit={mockOnSubmit}
        />
      );
      const nameInput = container.querySelector('#name') as HTMLInputElement;
      expect(nameInput).toBeInTheDocument();
      expect(nameInput.type).toBe('text');
    });

    it('should render email input field', () => {
      render(
        <FormBuilder
          schema={basicSchema}
          values={initialValues}
          onSubmit={mockOnSubmit}
        />
      );
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('should render number input field', () => {
      render(
        <FormBuilder
          schema={basicSchema}
          values={initialValues}
          onSubmit={mockOnSubmit}
        />
      );
      expect(screen.getByText('Age')).toBeInTheDocument();
    });

    it('should render select field with options', () => {
      const schemaWithSelect: FormSchema = {
        fields: [
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: [
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ],
          },
        ],
      };

      render(
        <FormBuilder
          schema={schemaWithSelect}
          values={{ status: '' }}
          onSubmit={mockOnSubmit}
        />
      );
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('should render textarea field', () => {
      const schemaWithTextarea: FormSchema = {
        fields: [
          { name: 'description', label: 'Description', type: 'textarea' },
        ],
      };

      render(
        <FormBuilder
          schema={schemaWithTextarea}
          values={{ description: '' }}
          onSubmit={mockOnSubmit}
        />
      );
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('should render checkbox field', () => {
      const schemaWithCheckbox: FormSchema = {
        fields: [
          { name: 'subscribe', label: 'Subscribe to newsletter', type: 'checkbox' },
        ],
      };

      render(
        <FormBuilder
          schema={schemaWithCheckbox}
          values={{ subscribe: false }}
          onSubmit={mockOnSubmit}
        />
      );
      expect(screen.getByText('Subscribe to newsletter')).toBeInTheDocument();
    });

    it('should render date field', () => {
      const schemaWithDate: FormSchema = {
        fields: [
          { name: 'birthDate', label: 'Birth Date', type: 'date' },
        ],
      };

      render(
        <FormBuilder
          schema={schemaWithDate}
          values={{ birthDate: '' }}
          onSubmit={mockOnSubmit}
        />
      );
      expect(screen.getByText('Birth Date')).toBeInTheDocument();
    });

    it('should render password field', () => {
      const schemaWithPassword: FormSchema = {
        fields: [
          { name: 'password', label: 'Password', type: 'password', required: true },
        ],
      };

      render(
        <FormBuilder
          schema={schemaWithPassword}
          values={{ password: '' }}
          onSubmit={mockOnSubmit}
        />
      );
      expect(screen.getByText('Password')).toBeInTheDocument();
    });
  });

  describe('Form Sections', () => {
    it('should render form sections with grouped fields', () => {
      const schemaWithSections: FormSchema = {
        fields: [
          { name: 'firstName', label: 'First Name', type: 'text' },
          { name: 'email', label: 'Email', type: 'email' },
        ],
        sections: [
          { title: 'Personal Info', fieldNames: ['firstName', 'email'] },
        ],
      };

      render(
        <FormBuilder
          schema={schemaWithSections}
          values={{ firstName: '', email: '' }}
          onSubmit={mockOnSubmit}
        />
      );
      expect(screen.getByText('Personal Info')).toBeInTheDocument();
    });

    it('should render section description', () => {
      const schemaWithSectionDesc: FormSchema = {
        fields: [
          { name: 'name', label: 'Name', type: 'text' },
        ],
        sections: [
          { title: 'Contact', description: 'Enter your contact details', fieldNames: ['name'] },
        ],
      };

      render(
        <FormBuilder
          schema={schemaWithSectionDesc}
          values={{ name: '' }}
          onSubmit={mockOnSubmit}
        />
      );
      expect(screen.getByText('Contact')).toBeInTheDocument();
      expect(screen.getByText('Enter your contact details')).toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    it('should validate required fields', async () => {
      const user = userEvent.setup();
      render(
        <FormBuilder
          schema={basicSchema}
          values={initialValues}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByRole('button', { name: /simpan/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it('should validate email format', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <FormBuilder
          schema={basicSchema}
          values={{ name: 'John', email: 'invalid', age: '' }}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByRole('button', { name: /simpan/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it('should validate phone format', async () => {
      const schemaWithPhone: FormSchema = {
        fields: [
          { name: 'phone', label: 'Phone', type: 'phone', required: true },
        ],
      };

      const user = userEvent.setup();
      render(
        <FormBuilder
          schema={schemaWithPhone}
          values={{ phone: 'invalid' }}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByRole('button', { name: /simpan/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it('should validate URL format', async () => {
      const schemaWithUrl: FormSchema = {
        fields: [
          { name: 'website', label: 'Website', type: 'url' },
        ],
      };

      const user = userEvent.setup();
      render(
        <FormBuilder
          schema={schemaWithUrl}
          values={{ website: 'not a url' }}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByRole('button', { name: /simpan/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it('should validate minLength', async () => {
      const schemaWithMinLength: FormSchema = {
        fields: [
          { name: 'username', label: 'Username', type: 'text', minLength: 3 },
        ],
      };

      const user = userEvent.setup();
      const { container } = render(
        <FormBuilder
          schema={schemaWithMinLength}
          values={{ username: 'ab' }}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByRole('button', { name: /simpan/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it('should validate maxLength', async () => {
      const schemaWithMaxLength: FormSchema = {
        fields: [
          { name: 'code', label: 'Code', type: 'text', maxLength: 5 },
        ],
      };

      const user = userEvent.setup();
      render(
        <FormBuilder
          schema={schemaWithMaxLength}
          values={{ code: 'toolongcode' }}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByRole('button', { name: /simpan/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it('should validate custom validator', async () => {
      const customValidator = (value: string) => {
        return value === 'admin' ? undefined : 'Must be "admin"';
      };

      const schemaWithCustom: FormSchema = {
        fields: [
          { name: 'role', label: 'Role', type: 'text', validate: customValidator },
        ],
      };

      const user = userEvent.setup();
      render(
        <FormBuilder
          schema={schemaWithCustom}
          values={{ role: 'user' }}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByRole('button', { name: /simpan/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      const validValues = { name: 'John Doe', email: 'john@example.com', age: '30' };

      render(
        <FormBuilder
          schema={basicSchema}
          values={validValues}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByRole('button', { name: /simpan/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });

    it('should not submit form with invalid data', async () => {
      const user = userEvent.setup();
      render(
        <FormBuilder
          schema={basicSchema}
          values={{ name: '', email: '', age: '' }}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByRole('button', { name: /simpan/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it('should show loading state during submission', () => {
      render(
        <FormBuilder
          schema={basicSchema}
          values={initialValues}
          onSubmit={mockOnSubmit}
          isSubmitting={true}
        />
      );

      const submitButton = screen.getByRole('button', { name: /menyimpan/i });
      expect(submitButton).toBeDisabled();
    });

    it('should show loading state', () => {
      render(
        <FormBuilder
          schema={basicSchema}
          values={initialValues}
          onSubmit={mockOnSubmit}
          isLoading={true}
        />
      );

      const nameLabel = screen.getByText('Name');
      expect(nameLabel).toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    it('should update form values on field change', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      const { container } = render(
        <FormBuilder
          schema={basicSchema}
          values={initialValues}
          onSubmit={mockOnSubmit}
          onChange={onChange}
        />
      );

      const inputs = container.querySelectorAll('input[type="text"]');
      const nameInput = inputs[0] as HTMLInputElement;

      fireEvent.change(nameInput, { target: { value: 'John' } });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    });

    it('should disable fields based on schema', () => {
      const schemaWithDisabled: FormSchema = {
        fields: [
          { name: 'name', label: 'Name', type: 'text', disabled: true },
        ],
      };

      const { container } = render(
        <FormBuilder
          schema={schemaWithDisabled}
          values={{ name: '' }}
          onSubmit={mockOnSubmit}
        />
      );

      const inputs = container.querySelectorAll('input');
      const nameInput = inputs[0] as HTMLInputElement;
      expect(nameInput.disabled).toBe(true);
    });

    it('should show field placeholder', () => {
      const schemaWithPlaceholder: FormSchema = {
        fields: [
          { name: 'name', label: 'Name', type: 'text', placeholder: 'Enter your name' },
        ],
      };

      render(
        <FormBuilder
          schema={schemaWithPlaceholder}
          values={{ name: '' }}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    });

    it('should show field description', () => {
      const schemaWithDescription: FormSchema = {
        fields: [
          {
            name: 'email',
            label: 'Email',
            type: 'email',
            description: 'We will never share your email',
          },
        ],
      };

      render(
        <FormBuilder
          schema={schemaWithDescription}
          values={{ email: '' }}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText('We will never share your email')).toBeInTheDocument();
    });
  });

  describe('Conditional Fields', () => {
    it('should show field based on showIf condition', () => {
      const schemaWithConditional: FormSchema = {
        fields: [
          { name: 'type', label: 'Type', type: 'select', options: [
            { label: 'Personal', value: 'personal' },
            { label: 'Business', value: 'business' },
          ]},
          {
            name: 'companyName',
            label: 'Company Name',
            type: 'text',
            showIf: (values) => values.type === 'business',
          },
        ],
      };

      render(
        <FormBuilder
          schema={schemaWithConditional}
          values={{ type: 'business', companyName: '' }}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText('Company Name')).toBeInTheDocument();
    });

    it('should hide field based on showIf condition', () => {
      const schemaWithConditional: FormSchema = {
        fields: [
          { name: 'type', label: 'Type', type: 'select', options: [
            { label: 'Personal', value: 'personal' },
            { label: 'Business', value: 'business' },
          ]},
          {
            name: 'companyName',
            label: 'Company Name',
            type: 'text',
            showIf: (values) => values.type === 'business',
          },
        ],
      };

      render(
        <FormBuilder
          schema={schemaWithConditional}
          values={{ type: 'personal', companyName: '' }}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.queryByText('Company Name')).not.toBeInTheDocument();
    });
  });

  describe('Error Display', () => {
    it('should display field errors', () => {
      const errors = { name: 'Name is required' };

      render(
        <FormBuilder
          schema={basicSchema}
          values={initialValues}
          onSubmit={mockOnSubmit}
          errors={errors}
          touched={{ name: true }}
        />
      );

      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    it('should display error only if field is touched', () => {
      const errors = { email: 'Invalid email' };

      render(
        <FormBuilder
          schema={basicSchema}
          values={initialValues}
          onSubmit={mockOnSubmit}
          errors={errors}
          touched={{ email: false }}
        />
      );

      expect(screen.queryByText('Invalid email')).not.toBeInTheDocument();
    });

    it('should show error message after validation', async () => {
      const user = userEvent.setup();
      render(
        <FormBuilder
          schema={basicSchema}
          values={{ name: '', email: '', age: '' }}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByRole('button', { name: /simpan/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });
  });

  describe('Button States', () => {
    it('should render submit button', () => {
      render(
        <FormBuilder
          schema={basicSchema}
          values={initialValues}
          onSubmit={mockOnSubmit}
          submitLabel="Create"
        />
      );

      expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
    });

    it('should render reset button when showReset is true', () => {
      render(
        <FormBuilder
          schema={basicSchema}
          values={initialValues}
          onSubmit={mockOnSubmit}
          showReset={true}
        />
      );

      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    });

    it('should not render reset button when showReset is false', () => {
      render(
        <FormBuilder
          schema={basicSchema}
          values={initialValues}
          onSubmit={mockOnSubmit}
          showReset={false}
        />
      );

      expect(screen.queryByRole('button', { name: /reset/i })).not.toBeInTheDocument();
    });

    it('should disable submit button when isSubmitting is true', () => {
      render(
        <FormBuilder
          schema={basicSchema}
          values={initialValues}
          onSubmit={mockOnSubmit}
          isSubmitting={true}
        />
      );

      const submitButton = screen.getByRole('button', { name: /menyimpan/i });
      expect(submitButton).toBeDisabled();
    });
  });
});
