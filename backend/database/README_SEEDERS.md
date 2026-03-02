# StoreMate ERP - Database Seeders Documentation

## Overview

This directory contains comprehensive seeders to populate your StoreMate ERP database with realistic test data covering the last 7 days of operations (Feb 22-28, 2025).

## Quick Start

### Using Laravel Artisan (Recommended)

```bash
# Seed all tables
php artisan db:seed

# Seed specific table
php artisan db:seed --class=ProductSeeder
php artisan db:seed --class=TransactionSeeder
```

### Using SQL File

```bash
# Import via MySQL command line
mysql -u root -p tokosync < database/seed_dataset.sql

# Or via phpMyAdmin
# 1. Open phpMyAdmin
# 2. Select database
# 3. Click "Import"
# 4. Choose `seed_dataset.sql`
# 5. Click "Go"
```

---

## Available Seeders

### Base Data

| Seeder | Description | Records |
|---------|-------------|---------|
| **UserSeeder** | Creates 2 users (owner & admin) | 2 users |
| **CategorySeeder** | 8 product categories | 8 categories |
| **WarehouseSeeder** | 3 warehouses | 3 warehouses |

### Parties Data

| Seeder | Description | Records |
|---------|-------------|---------|
| **SupplierSeeder** | Indonesian suppliers with balances | 15 suppliers |
| **CustomerSeeder** | Indonesian customers with AR balances | 15 customers |
| **SalesRepSeeder** | Sales representatives | 8 sales reps |

### Product Data

| Seeder | Description | Records |
|---------|-------------|---------|
| **ProductSeeder** | 28 products across all categories | 28 products |

- Product codes: PRD001-PRD028
- Realistic pricing with 15-40% margin
- Mix of stock levels (healthy, low, out-of-stock)
- Units: pcs, kg, liter, box, pack, roll, set, strip, botol

### Transaction Data (Most Important for Dashboard!)

| Seeder | Description | Records |
|---------|-------------|---------|
| **TransactionSeeder** | Generates 7 days of transactions | 80-100 transactions |

Transaction Types Distribution:
- **Penjualan Tunai** (35-40%): 30-40 transactions
- **Penjualan Kredit** (25-30%): 20-30 transactions
- **Pembelian** (20-25%): 16-25 transactions
- **Retur Penjualan** (3-5%): 3-5 transactions
- **Retur Pembelian** (2-3%): 2-3 transactions

Transaction Features:
- Date range: Feb 22-28, 2025 (last 7 days)
- 10-15 transactions per day
- Status mix: mostly 'completed', some 'cancelled'
- Payment status: 'lunas', 'pending', 'sebagian'
- Realistic amounts: 50,000 - 5,000,000 IDR

### Financial & Stock Data

| Seeder | Description | Records |
|---------|-------------|---------|
| **FinancialLedgerSeeder** | Auto-creates ledger entries for each transaction | 80-100 entries |
| **StockMutationSeeder** | Auto-creates stock mutations for each transaction detail | 200-300 entries |

### Returns & Delivery Data

| Seeder | Description | Records |
|---------|-------------|---------|
| **ReturnSaleSeeder** | Sales returns with items | 4-6 returns |
| **ReturnPurchaseSeeder** | Purchase returns with items | 3-5 returns |
| **DeliveryNoteSeeder** | Delivery notes for credit sales | 4-6 notes |

---

## Default Credentials

After seeding, you can login with:

| Role | Email | Password | Access Level |
|-------|--------|----------|--------------|
| Owner | `owner@tokosync.local` | `password123` | Full access + reports |
| Admin | `admin@tokosync.local` | `password123` | Operational access |

---

## Data Quality Standards

### Realistic Pricing

- **Buy prices**: 5,000 - 100,000 IDR (typical retail items)
- **Sell prices**: Buy price + 15-40% margin
- **Discounts**: 0-15% (random)
- **Transaction totals**: 50,000 - 5,000,000 IDR

### Indonesian Context

- **Names**: Indonesian format (e.g., "Budi Santoso", "PT. Distributor Jaya")
- **Phone**: +62 or 08xx format
- **Currency**: All in IDR
- **Language**: Notes and labels in Indonesian

### Data Relationships

- All foreign keys properly referenced
- Transactions linked to correct supplier/customer/sales_rep
- Transaction details reference real products
- Financial ledgers match transaction totals
- Stock mutations match actual quantities

### Time Distribution

- Transactions spread over 7 days (Feb 22-28, 2025)
- 10-15 transactions per day
- Weekend vs weekday variations (higher on weekdays)
- Payment statuses reflect realistic payment cycles

---

## Testing Scenarios

### Dashboard Features

✅ **View today's stats**: 8-12 sales, 3-5 purchases
✅ **View weekly stats**: Sales trend for last 7 days
✅ **Recent transactions**: 5 most recent transactions
✅ **Low stock alerts**: 5-8 products below min_stock
✅ **Stock value**: Total inventory worth
✅ **Receivables/Payables**: Customers/suppliers with balances

### Products Management

✅ **Create products**: Add new products with auto code generation
✅ **Update products**: Edit product details, update stock
✅ **Delete products**: Remove products (with soft delete)
✅ **Search products**: Filter by name, code, or category
✅ **Low stock indicators**: Visual alerts for products below min_stock

### Transactions

✅ **Create sales**: Cash sales (penjualan_tunai) with multiple items
✅ **Create credit sales**: Installment sales (penjualan_kredit) linked to customers
✅ **Create purchases**: Stock purchases (pembelian) from suppliers
✅ **Apply discounts**: Item-level and transaction-level discounts
✅ **Process payments**: Partial and full payments tracking
✅ **View transaction details**: Complete item breakdown

### Returns

✅ **Process sales returns**: Return damaged/wrong items from credit sales
✅ **Process purchase returns**: Return damaged items to suppliers
✅ **Reason tracking**: Capture reasons for each return
✅ **Approval workflow**: Return status management

### Reports & Financials

✅ **Financial ledger**: Complete transaction history with balances
✅ **Stock history**: Track all stock movements
✅ **AR/AP balances**: View outstanding customer/supplier balances
✅ **Multi-user**: Test owner vs admin permissions

---

## Reset Database

To clear all data and reseed:

```bash
# Option 1: Via Laravel
php artisan migrate:fresh --seed

# Option 2: Via SQL with cleanup
mysql -u root -p tokosync < database/seed_dataset_with_reset.sql
```

**⚠️ WARNING**: Both options will delete ALL existing data!

---

## Troubleshooting

### Seeder Not Running

```bash
# Check if seeder is registered in DatabaseSeeder.php
php artisan db:seed --list

# Check for errors
php artisan db:seed --class=ProductSeeder
```

### Duplicate Records

```bash
# Truncate specific table
php artisan tinker
>>> Product::truncate();
>>> exit
```

### Foreign Key Errors

```sql
-- Disable FK checks before seeding
SET FOREIGN_KEY_CHECKS = 0;

-- Re-enable after seeding
SET FOREIGN_KEY_CHECKS = 1;
```

---

## Additional Resources

- **Laravel Docs**: https://laravel.com/docs/10.x/seeding
- **Database Schema**: Check `database/migrations/` for table structures
- **Model Definitions**: Check `app/Models/` for relationships
- **Frontend Types**: Check `frontend/src/types/index.ts` for TypeScript interfaces

---

## Support

For issues or questions about seeders:

1. Check this README for common issues
2. Review seeder code for data generation logic
3. Test with small datasets first (1-2 seeders)
4. Verify data relationships in database

**Last Updated**: 2025-03-01
**Version**: 1.0.0
