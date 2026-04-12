import { createContext, ReactNode } from 'react';

export interface PrintContextType {
  printDocument: (content: ReactNode) => void;
}

export const PrintContext = createContext<PrintContextType | undefined>(undefined);
