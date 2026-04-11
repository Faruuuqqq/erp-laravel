import { useCallback, useRef } from 'react';
import { useToast } from './use-toast';

interface RetryConfig {
  maxRetries?: number;
  delayMs?: number;
  backoffMultiplier?: number;
}

interface RetryableActionOptions {
  title: string;
  description?: string;
  errorTitle?: string;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export const useRetryableAction = (config: RetryConfig = {}) => {
  const { toast } = useToast();
  const retriesRef = useRef<Map<string, number>>(new Map());

  const {
    maxRetries = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
  } = config;

  const execute = useCallback(
    async (
      action: () => Promise<any>,
      options: RetryableActionOptions
    ) => {
      const actionId = Math.random().toString(36);
      let lastError: unknown;
      let currentDelay = delayMs;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const result = await action();
          retriesRef.current.delete(actionId);

          toast({
            title: options.title,
            description: options.description,
            variant: 'default',
          });

          options.onSuccess?.();
          return result;
        } catch (error) {
          lastError = error;
          const retriesLeft = maxRetries - attempt;

          if (retriesLeft === 0) {
            // No more retries - show final error
            const errorMsg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
              ?? (error instanceof Error ? error.message : 'Terjadi kesalahan');

            toast({
              title: options.errorTitle ?? 'Error',
              description: errorMsg,
              variant: 'destructive',
              action: {
                label: 'Retry',
                onClick: () => execute(action, options),
              },
            });

            options.onError?.(error);
            return;
          }

          // Retry with exponential backoff
          retriesRef.current.set(actionId, attempt + 1);

          toast({
            title: 'Retrying...',
            description: `Attempt ${attempt + 1} of ${maxRetries}. Will retry in ${currentDelay / 1000}s...`,
            variant: 'default',
            action: {
              label: 'Cancel',
              onClick: () => retriesRef.current.delete(actionId),
            },
          });

          await new Promise(resolve => setTimeout(resolve, currentDelay));
          currentDelay *= backoffMultiplier;
        }
      }

      // Should not reach here, but just in case
      options.onError?.(lastError);
    },
    [toast, maxRetries, delayMs, backoffMultiplier]
  );

  return { execute };
};
