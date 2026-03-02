/**
 * TokoSync ERP – POS (Point of Sale) Hook
 *
 * Custom hook untuk halaman Kasir/POS.
 * Menangani: cart state, add/remove/update qty, kalkulasi real-time,
 * submit transaksi ke Laravel, dan barcode scanner focus.
 */
import { useState, useCallback, useRef, useMemo } from 'react';
import { useCreateTransaction } from '@/hooks/api/useTransactions';
import type { Product, Transaction, TransactionType } from '@/types';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CartItem {
    productId: string;
    productName: string;
    sku: string;         // untuk referensi barcode
    price: number;       // harga jual saat ditambahkan ke cart
    quantity: number;
    discount: number;    // diskon per item (%)
    subtotal: number;    // dihitung otomatis: qty * price * (1 - discount/100)
}

interface PosOptions {
    transactionType?: TransactionType;
    onTransactionSuccess?: (invoiceNumber: string) => void;
}

// ─── usePos Hook ──────────────────────────────────────────────────────────────
export function usePos(options: PosOptions = {}) {
    const { transactionType = 'penjualan_tunai', onTransactionSuccess } = options;

    const [cart, setCart] = useState<CartItem[]>([]);
    const [globalDiscount, setGlobalDiscount] = useState(0); // diskon total transaksi (rupiah)
    const [tax, setTax] = useState(0);                       // pajak (rupiah)

    // Ref untuk focus barcode scanner input
    const scannerInputRef = useRef<HTMLInputElement>(null);

    const createTransactionMutation = useCreateTransaction();

    // ── Kalkulasi Real-Time ───────────────────────────────────────────────────
    const subtotal = useMemo(
        () => cart.reduce((sum, item) => sum + item.subtotal, 0),
        [cart],
    );

    const total = useMemo(
        () => subtotal - globalDiscount + tax,
        [subtotal, globalDiscount, tax],
    );

    const totalItems = useMemo(
        () => cart.reduce((sum, item) => sum + item.quantity, 0),
        [cart],
    );

    // ── Add to Cart ──────────────────────────────────────────────────────────
    const addToCart = useCallback((product: Product, quantity: number = 1) => {
        if (product.stock <= 0) {
            toast.error(`Stok ${product.name} habis!`);
            return;
        }

        setCart((prev) => {
            const existing = prev.find((item) => item.productId === product.id);

            if (existing) {
                // Sudah ada → tambah qty
                const newQty = existing.quantity + quantity;
                if (newQty > product.stock) {
                    toast.warning(`Stok ${product.name} hanya tersedia ${product.stock} unit.`);
                    return prev;
                }
                return prev.map((item) =>
                    item.productId === product.id
                        ? {
                            ...item,
                            quantity: newQty,
                            subtotal: newQty * item.price * (1 - item.discount / 100),
                        }
                        : item,
                );
            }

            // Produk baru → tambah ke cart
            const subtotal = quantity * product.sellPrice * 1; // discount 0% default
            return [
                ...prev,
                {
                    productId: product.id,
                    productName: product.name,
                    sku: product.code,
                    price: product.sellPrice,
                    quantity,
                    discount: 0,
                    subtotal,
                },
            ];
        });

        // Kembalikan fokus ke scanner input setelah produk ditambahkan
        setTimeout(() => scannerInputRef.current?.focus(), 50);
    }, []);

    // ── Update Quantity ─────────────────────────────────────────────────────
    const updateQty = useCallback((productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart((prev) =>
            prev.map((item) =>
                item.productId === productId
                    ? {
                        ...item,
                        quantity,
                        subtotal: quantity * item.price * (1 - item.discount / 100),
                    }
                    : item,
            ),
        );
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Update Discount Per Item ─────────────────────────────────────────────
    const updateItemDiscount = useCallback((productId: string, discount: number) => {
        setCart((prev) =>
            prev.map((item) =>
                item.productId === productId
                    ? {
                        ...item,
                        discount,
                        subtotal: item.quantity * item.price * (1 - discount / 100),
                    }
                    : item,
            ),
        );
    }, []);

    // ── Remove from Cart ────────────────────────────────────────────────────
    const removeFromCart = useCallback((productId: string) => {
        setCart((prev) => prev.filter((item) => item.productId !== productId));
    }, []);

    // ── Clear Cart ──────────────────────────────────────────────────────────
    const clearCart = useCallback(() => {
        setCart([]);
        setGlobalDiscount(0);
        setTax(0);
    }, []);

    // ── Focus Scanner ────────────────────────────────────────────────────────
    const focusScanner = useCallback(() => {
        scannerInputRef.current?.focus();
    }, []);

    // ── Submit Transaksi ke Laravel ──────────────────────────────────────────
    const submitTransaction = useCallback(
        async (options: {
            customerId?: string;
            salesId?: string;
            paid: number;
            notes?: string;
        }) => {
            if (cart.length === 0) {
                toast.error('Keranjang belanja kosong!');
                return;
            }

            // invoiceNumber sengaja tidak diisi – Laravel auto-generate di TransactionController
            const transactionData = {
                date: new Date().toISOString().split('T')[0],
                type: transactionType,
                customerId: options.customerId,
                salesId: options.salesId,
                items: cart.map((item) => ({
                    productId: item.productId,
                    productName: item.productName,
                    quantity: item.quantity,
                    price: item.price,
                    discount: item.discount,
                })),
                discount: globalDiscount,
                tax,
                paid: options.paid,
                notes: options.notes,
            };

            try {
                const result = await createTransactionMutation.mutateAsync(
                    transactionData as Parameters<typeof createTransactionMutation.mutateAsync>[0],
                ) as Transaction;
                clearCart();

                if (onTransactionSuccess) {
                    onTransactionSuccess(result.invoiceNumber ?? '');
                }
                return result;
            } catch {
                // Error sudah ditangani oleh useApiMutation
            }
        },
        [cart, globalDiscount, tax, transactionType, createTransactionMutation, clearCart, onTransactionSuccess],
    );

    return {
        // State
        cart,
        globalDiscount,
        tax,

        // Computed
        subtotal,
        total,
        totalItems,
        isEmpty: cart.length === 0,
        isSubmitting: createTransactionMutation.isPending,

        // Actions
        addToCart,
        updateQty,
        updateItemDiscount,
        removeFromCart,
        clearCart,
        submitTransaction,
        setGlobalDiscount,
        setTax,
        focusScanner,

        // Barcode scanner ref (pasang ke <input ref={scannerInputRef} />)
        scannerInputRef,
    };
}
