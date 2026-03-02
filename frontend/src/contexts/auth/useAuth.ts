/**
 * useAuth hook – dipisah dari AuthContext.tsx agar Vite Fast Refresh bekerja.
 * File ini HANYA boleh export hooks/values (bukan komponen React).
 */
import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export type { UserRole, User, AuthContextType } from './AuthContext';

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
