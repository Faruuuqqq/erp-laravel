import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodSchema, z } from 'zod';
import type { UseMutationResult } from '@tanstack/react-query';

interface UseEntityFormOptions<T, TData, TError> {
  schema: ZodSchema<T>;
  defaultValues: Partial<T>;
  createMutation: UseMutationResult<T, TError, TData, unknown>;
  updateMutation?: UseMutationResult<T, TError, { id: string; data: Partial<TData> }, unknown>;
  entityId?: string;
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
  transformCreateData?: (data: T) => TData;
  transformUpdateData?: (data: T) => Partial<TData>;
}

export function useEntityForm<T extends z.ZodTypeAny, TData, TError>({
  schema,
  defaultValues,
  createMutation,
  updateMutation,
  entityId,
  onCreateSuccess,
  onUpdateSuccess,
  transformCreateData = (data: T) => data as TData,
  transformUpdateData = (data: T) => data as Partial<TData>,
}: UseEntityFormOptions<z.infer<T>, TData, TError>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues: entityId ? undefined : defaultValues,
  });

  const onSubmit = (data: z.infer<T>) => {
    if (entityId && updateMutation) {
      const updateData = transformUpdateData(data);
      updateMutation.mutate({ id: entityId, data: updateData }, {
        onSuccess: onUpdateSuccess,
      });
    } else {
      const createData = transformCreateData(data);
      createMutation.mutate(createData, {
        onSuccess: onCreateSuccess,
      });
    }

    setIsDialogOpen(false);
    form.reset();
  };

  return {
    form,
    isDialogOpen,
    setIsDialogOpen,
    onSubmit,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation?.isPending,
    isPending: createMutation.isPending || updateMutation?.isPending,
  };
}
