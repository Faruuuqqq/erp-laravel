# PRD: TokoSync ERP - Hybrid Retail & Wholesale/Distribution System

## 1. Executive Summary

**Problem Statement**: Small retail-wholesale businesses struggle with fragmented data across manual spreadsheets, disconnected inventory systems, and unreliable cash/debt tracking, leading to stockouts, billing errors, and poor cash flow visibility.

**Proposed Solution**: A LAN-based ERP system that centralizes inventory, sales, purchasing, and financial data with real-time visibility, supporting both B2C cash POS operations and B2B credit transactions with automated debt tracking.

**Success Criteria**:
- Reduce sales transaction entry time by 60% (from ~3 minutes to <1 minute per transaction)
- Reduce inventory discrepancy rate from >5% to <1% monthly
- Reduce AR collection time by 40% (from average 45 days to 27 days)
- Achieve 95% user adoption within 3 months of deployment (14 of 15 users active)
- Reduce manual data entry errors by 90% (from ~15 errors/day to <2/day)

## 2. User Experience & Functionality

### User Personas

- **Cashier** - Frontline POS operator handling daily walk-in sales (B2C cash transactions)
- **Sales Admin** - Manages B2B credit sales, creates quotes, issues Surat Jalan, handles Kontra Bon billing
- **Warehouse Manager** - Monitors multi-location stock, handles stock transfers, receiving, and returns
- **Purchasing Staff** - Creates POs, manages supplier relationships, tracks procurement
- **Finance Staff** - Records payments, reconciles accounts, manages AR/AP, handles returns
- **Owner/Manager** - Views reports, makes decisions, monitors cash flow and profitability
- **Admin** - Manages users, permissions, and system configuration

### User Stories & Acceptance Criteria

#### Module 1: Inventory Management

**Story 1.1**: As a Warehouse Manager, I want to view real-time stock levels across all warehouses so that I can prevent stockouts and optimize stock distribution.

**Acceptance Criteria**:
- Stock count updates within 2 seconds after any transaction (sale, purchase, transfer, return)
- Dashboard shows current stock, reserved stock, and available stock per warehouse
- Low stock alerts trigger when quantity falls below minimum threshold (configurable per product)
- Supports 5+ warehouses with accurate stock aggregation
- Stock history log records all movements with timestamp, user, and reference document

**Story 1.2**: As a Warehouse Manager, I want to transfer stock between warehouses so that I can balance inventory across locations.

**Acceptance Criteria**:
- Create stock transfer request with source/destination warehouse and quantities
- Approval workflow for transfers (optional based on user permissions)
- Stock deducted from source on approval, added to destination upon confirmation
- Transfer history searchable by date, warehouse, product, and status
- Prevents negative stock transfer (source must have sufficient quantity)

**Story 1.3**: As a Warehouse Manager, I want to receive goods from suppliers with PO matching so that I can verify quantities and update stock accurately.

**Acceptance Criteria**:
- Select open PO to receive goods from
- Match received quantity vs ordered quantity with variance highlighting
- Auto-create quality inspection record (optional) before final receipt
- Update stock only after final confirmation (not just partial receipt)
- Generate receiving report with supplier signature capability

#### Module 2: Sales & Invoicing

**Story 2.1**: As a Cashier, I want to process cash sales quickly through a POS interface so that I can serve walk-in customers efficiently.

**Acceptance Criteria**:
- Add products to cart via barcode scan or product search (<500ms response time)
- Auto-calculate subtotal, tax (if applicable), and total
- Handle multiple payment methods: cash, e-wallet, bank transfer (record payment details)
- Generate and print thermal receipt in <3 seconds
- Stock deduction occurs immediately upon payment confirmation
- Supports product modifiers (size, color) with variant pricing

**Story 2.2**: As a Sales Admin, I want to create credit sales for B2B customers so that I can send goods first and collect payment later.

**Acceptance Criteria**:
- Create sales order with customer selection, delivery date, and credit terms (e.g., Net 30)
- Check customer credit limit before creating order (block if exceeded)
- Generate Surat Jalan (delivery note) without prices for delivery confirmation
- Stock reserved upon order creation, deducted upon delivery confirmation
- Support partial deliveries and backorders
- AR automatically created for the total amount

**Story 2.3**: As a Sales Admin, I want to perform mass billing (Kontra Bon) for multiple unpaid invoices so that I can efficiently collect payments from regular customers.

**Acceptance Criteria**:
- Select customer and view all unpaid invoices with aging (current, 1-30 days, 31-60 days, 60+ days)
- Select multiple invoices to include in billing statement
- Auto-calculate total amount due with interest (if applicable)
- Generate billing statement PDF with invoice details and payment instructions
- Mark selected invoices as "billed" to prevent double-billing

**Story 2.4**: As a Finance Staff, I want to record customer payments and allocate them to specific invoices so that I can reduce AR accurately.

**Acceptance Criteria**:
- Select customer and view all unpaid invoices
- Enter payment amount with payment method and reference
- Auto-allocate payment to oldest invoices first (FIFO) or allow manual allocation
- Handle partial payments and apply to multiple invoices
- Update AR balance and invoice status (fully/partially paid)
- Generate payment receipt with allocation details

#### Module 3: Purchase & Procurement

**Story 3.1**: As a Purchasing Staff, I want to create purchase orders for suppliers so that I can replenish stock.

**Acceptance Criteria**:
- Create PO with supplier, products, quantities, expected delivery date
- Check current stock and auto-suggest reorder quantity (based on min/max settings)
- Support multiple delivery dates for same PO
- PO status workflow: Draft → Sent → Partially Received → Received → Cancelled
- Email PO to supplier with PDF attachment (optional: direct integration)

**Story 3.2**: As a Purchasing Staff, I want to track supplier returns so that I can manage defective goods and credits.

**Acceptance Criteria**:
- Create return request with supplier, products, quantities, and reason
- Link to original purchase order or receipt
- Auto-create credit note from supplier for return value
- Stock deducted only after supplier approves return
- Track return status: Requested → Approved → In Transit → Received/Credited

#### Module 4: Financial/Accounting

**Story 4.1**: As a Finance Staff, I want to view AR/AP aging reports so that I can prioritize collections and payments.

**Acceptance Criteria**:
- AR aging: Group customer debts by 0-30, 31-60, 61-90, 90+ days
- AP aging: Group supplier debts by same buckets
- Click on any bucket to view detailed invoice list
- Export to Excel/CSV for analysis
- Dashboard shows total AR/AP with overdue amounts highlighted

**Story 4.2**: As a Finance Staff, I want to reconcile sales and purchases to ensure data accuracy.

**Acceptance Criteria**:
- Daily sales summary: total transactions, cash sales, credit sales, average transaction value
- Purchase summary: POs created, received, pending
- Inventory summary: beginning stock, purchases, sales, ending stock (with variance alert)
- Auto-flag discrepancies >5% for review
- Generate reconciliation report for accounting export

### Non-Goals

- Multi-branch/chain store support with centralized data synchronization (single location only)
- E-commerce integration (no online store, no marketplace sync)
- Mobile apps (LAN-based desktop/browser only)
- Advanced accounting features: multi-currency, tax filing, payroll, fixed assets
- POS hardware integration (no barcode scanners, receipt printers, cash drawers)
- Manufacturing/production planning (no BOM, work orders, production scheduling)
- AI-powered features (no demand forecasting, smart recommendations)

## 3. Technical Specifications

### Architecture Overview

**Frontend Stack**:
- React 18+ with TypeScript
- Vite as build tool
- Shadcn UI components
- React Query for data fetching and caching
- React Router for navigation

**Backend Stack**:
- Laravel 11+ (PHP 8.2+)
- RESTful API
- Sanctum for authentication (session-based for LAN)
- MySQL 8.0+ database

**Data Flow**:
```
Browser (React) → Vite Dev Server (localhost:5173) → API Proxy → Laravel Backend (localhost:8000) → MySQL
```

**Component Interaction**:
- Frontend components use React Query hooks for API calls
- Laravel controllers handle business logic and database operations
- Database triggers/observers maintain data integrity (stock updates, AR/AP calculations)
- Real-time updates via polling (5-second interval) or optional WebSocket (future)

### Integration Points

**API Endpoints** (core modules):
- `/api/inventory/*` - Product management, stock levels, transfers
- `/api/sales/*` - POS transactions, sales orders, invoices, AR
- `/api/purchase/*` - Purchase orders, receipts, returns, AP
- `/api/finance/*` - Payments, aging reports, reconciliation
- `/api/auth/*` - Login, logout, user permissions

**Database Schema** (simplified):
- `products`, `product_variants`, `categories`, `brands`
- `warehouses`, `stock`, `stock_movements`, `stock_transfers`
- `customers`, `suppliers`, `users`, `roles`, `permissions`
- `sales_orders`, `sales_order_items`, `sales_invoices`, `delivery_notes`
- `purchase_orders`, `purchase_order_items`, `receipts`
- `payments`, `accounts_receivable`, `accounts_payable`
- `returns_customer`, `returns_supplier`

### Security & Privacy

**Authentication**:
- Laravel Sanctum session-based auth (suitable for LAN)
- Password hashing with bcrypt
- Session timeout configurable (default: 8 hours)

**Authorization**:
- Role-based access control (RBAC) with granular permissions
- Roles: Admin, Manager, Cashier, Sales Admin, Warehouse Manager, Purchasing Staff, Finance Staff
- Permission checks on every API endpoint

**Data Protection**:
- All sensitive data stored in MySQL with TLS encryption (optional for LAN)
- Input validation and sanitization on all API inputs
- SQL injection prevention via Laravel Eloquent ORM
- XSS prevention via React's automatic escaping

**Audit Logging**:
- All stock movements logged with user ID, timestamp, and action
- All financial transactions logged with complete details
- Logs retained for 1 year minimum (configurable)

## 4. Risks & Roadmap

### Phased Rollout

**Phase 1: MVP (Current - 70-90% complete)**
- Core inventory management (products, stock, warehouses, transfers)
- POS cash sales with thermal receipts
- Basic sales orders and invoices
- Purchase orders and receipts
- Basic payments and AR/AP tracking
- User authentication and RBAC

**Phase 2: v1.1 (3 months post-MVP)**
- Kontra Bon mass billing
- Surat Jalan delivery workflow
- Customer/supplier returns with credits
- AR/AP aging reports
- Dashboard with key metrics
- Export to Excel/CSV

**Phase 3: v2.0 (6-12 months post-MVP)**
- Advanced reporting (sales by product, customer profitability, inventory turnover)
- Payment reminders (auto-generate via email)
- Stock forecasting based on sales history
- Backup/restore functionality
- System configuration settings (tax rates, payment terms, etc.)

### Technical Risks

**Risk 1: LAN Performance Degradation**
- **Impact**: Slow API response times, especially during peak hours
- **Mitigation**: Implement database indexing, query optimization, React Query caching, consider read replicas if scale increases beyond 20 users

**Risk 2: Database Corruption**
- **Impact**: Loss of critical inventory and financial data
- **Mitigation**: Automated daily backups to external drive, implement database transactions for all multi-step operations, enable binary logging for point-in-time recovery

**Risk 3: User Adoption Resistance**
- **Impact**: Low adoption, continued use of manual processes
- **Mitigation**: Conduct user training sessions, provide quick reference guides, assign internal champions for each module, gather user feedback and iterate rapidly

**Risk 4: Stock Discrepancies**
- **Impact**: Inaccurate inventory leading to stockouts or overstock
- **Mitigation**: Implement stock reconciliation workflow, variance alerts for >5% difference, mandatory physical count audits monthly

**Risk 5: AR/AP Mismatches**
- **Impact**: Financial reporting errors, incorrect debt tracking
- **Mitigation**: Payment allocation validation, auto-reconciliation checks before closing periods, audit trail for all modifications

## 5. Testing Strategy

### Unit Testing
- Laravel test suite for all business logic (PHPUnit)
- Minimum 80% code coverage for critical paths (inventory, sales, finance)
- Mock external dependencies (email, file storage)

### Integration Testing
- End-to-end API tests for complete workflows (POS → stock update → AR creation)
- Database transaction rollback after each test

### User Acceptance Testing (UAT)
- 3-week beta testing with 5 pilot users
- Test scenarios: daily sales, stock transfer, PO creation, payment recording
- Document and fix critical bugs before full rollout

### Performance Testing
- Simulate 15 concurrent users performing typical operations
- Target API response time <500ms for 95% of requests
- Load test with 1000+ products in database

---

**Document Version**: 1.0  
**Last Updated**: March 1, 2026  
**Next Review**: April 1, 2026