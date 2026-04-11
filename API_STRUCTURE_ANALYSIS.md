# Laravel Backend API Structure Analysis

## Project Overview
- **Framework**: Laravel 11
- **API Style**: RESTful with JSON responses
- **State Management**: Models with SoftDeletes, Eloquent scopes, and relationships
- **Response Format**: JSON with pagination support
- **Base URL**: `/api` (all routes prefixed with `/api`)

---

## 1. API ENDPOINTS SUMMARY

### Master Data Endpoints

#### 1.1 Categories
- **Route**: `GET/POST/PUT/DELETE /api/categories`
- **Endpoint**: `CategoryController`
- **Current Features**:
  - No pagination (returns all categories sorted by name)
  - List returns only `id` and `name` fields
  - CRUD operations supported
- **Query Parameters**: None currently
- **Response Structure**:
  ```json
  {
    "data": [
      { "id": "1", "name": "Electronics" },
      { "id": "2", "name": "Clothing" }
    ]
  }
  ```

#### 1.2 Products
- **Route**: `GET/POST/PUT/DELETE /api/products` + `PATCH /api/products/{product}/stock`
- **Endpoint**: `ProductController`
- **Current Features**:
  - Search by name or code (via `search` param)
  - Category filter (by name via `category` param)
  - Warehouse filter (by ID via `warehouseId` param)
  - Pagination (default 50 per page)
  - Includes category and warehouse relationships
  - SoftDelete enabled
- **Query Parameters**:
  - `search`: string - searches in name and code fields
  - `category`: string - filters by category name
  - `warehouseId`: integer - filters by warehouse ID
  - `perPage`: integer - pagination size (default 50)
- **Database Columns**: id, code, name, category_id, buy_price, sell_price, stock, min_stock, unit, warehouse_id
- **Response Structure**:
  ```json
  {
    "data": [
      {
        "id": "1",
        "code": "PROD-001",
        "name": "Product Name",
        "category": "Electronics",
        "categoryId": "1",
        "buyPrice": 100000,
        "sellPrice": 150000,
        "stock": 50,
        "minStock": 10,
        "unit": "pcs",
        "warehouseId": "1",
        "warehouse": "Main Warehouse",
        "createdAt": "2026-04-11T...",
        "updatedAt": "2026-04-11T..."
      }
    ],
    "meta": { "current_page": 1, "total": 100, "per_page": 50 }
  }
  ```

#### 1.3 Customers
- **Route**: `GET/POST/PUT/DELETE /api/customers`
- **Endpoint**: `CustomerController`
- **Current Features**:
  - Search by name or phone (via `search` param)
  - Pagination (default 50 per page)
  - SoftDelete enabled
  - Balance and credit limit tracking
- **Query Parameters**:
  - `search`: string - searches in name and phone
  - `perPage`: integer - pagination size (default 50)
- **Database Columns**: id, name, phone, email, address, balance, credit_limit, price_list, daerah, npwp
- **Response Structure**:
  ```json
  {
    "data": [
      {
        "id": "1",
        "name": "Customer Name",
        "phone": "08123456789",
        "email": "customer@example.com",
        "address": "Jl. Sample",
        "balance": 500000,
        "creditLimit": 1000000,
        "totalTransactions": 15,
        "createdAt": "2026-04-11T...",
        "updatedAt": "2026-04-11T..."
      }
    ],
    "meta": { "current_page": 1, "total": 50, "per_page": 50 }
  }
  ```

#### 1.4 Suppliers
- **Route**: `GET/POST/PUT/DELETE /api/suppliers`
- **Endpoint**: `SupplierController`
- **Current Features**:
  - Search by name or phone (via `search` param)
  - Pagination (default 50 per page)
  - SoftDelete enabled
  - Balance tracking (saldo utang - amount owed by store)
  - Bank account number field
- **Query Parameters**:
  - `search`: string - searches in name and phone
  - `perPage`: integer - pagination size (default 50)
- **Database Columns**: id, name, phone, email, address, balance, no_rekening
- **Response Structure**:
  ```json
  {
    "data": [
      {
        "id": "1",
        "code": "SUP-0001",
        "name": "Supplier Name",
        "phone": "08123456789",
        "email": "supplier@example.com",
        "address": "Jl. Sample",
        "noRekening": "1234567890",
        "balance": 5000000,
        "totalTransactions": 20,
        "createdAt": "2026-04-11T...",
        "updatedAt": "2026-04-11T..."
      }
    ],
    "meta": { "current_page": 1, "total": 30, "per_page": 50 }
  }
  ```

#### 1.5 Warehouses
- **Route**: `GET/POST/PUT/DELETE /api/warehouses`
- **Endpoint**: `WarehouseController`
- **Current Features**:
  - Search by name (via `search` param)
  - Status field (active/inactive)
  - Pagination (default 50 per page)
  - Calculates total products
- **Query Parameters**:
  - `search`: string - searches in name field
  - `perPage`: integer - pagination size (default 50)
- **Database Columns**: id, name, address, status
- **Response Structure**:
  ```json
  {
    "data": [
      {
        "id": "1",
        "name": "Main Warehouse",
        "address": "Jl. Warehouse St",
        "status": "active",
        "totalProducts": 150,
        "createdAt": "2026-04-11T...",
        "updatedAt": "2026-04-11T..."
      }
    ],
    "meta": { "current_page": 1, "total": 5, "per_page": 50 }
  }
  ```

#### 1.6 Sales Representatives
- **Route**: `GET/POST/PUT/DELETE /api/sales`
- **Endpoint**: `SalesRepController`
- **Current Features**:
  - Search by name (via `search` param)
  - Status field (active/inactive)
  - Pagination (default 50 per page)
  - SoftDelete enabled
  - Tracks total sales
- **Query Parameters**:
  - `search`: string - searches in name field
  - `perPage`: integer - pagination size (default 50)
- **Database Columns**: id, name, phone, email, address, status, total_sales
- **Response Structure**:
  ```json
  {
    "data": [
      {
        "id": "1",
        "name": "Sales Rep Name",
        "phone": "08123456789",
        "email": "sales@example.com",
        "address": "Jl. Sample",
        "status": "active",
        "totalSales": 50000000,
        "createdAt": "2026-04-11T...",
        "updatedAt": "2026-04-11T..."
      }
    ],
    "meta": { "current_page": 1, "total": 10, "per_page": 50 }
  }
  ```

### Transaction Endpoints

#### 1.7 Transactions
- **Route**: 
  - `GET/POST /api/transactions`
  - `GET /api/transactions/{transaction}`
  - `PATCH /api/transactions/{transaction}/payment`
  - `PATCH /api/transactions/{transaction}/toggle-hidden`
  - `GET /api/transactions/{transaction}/print/invoice`
  - `GET /api/transactions/{transaction}/print/receipt`
- **Endpoint**: `TransactionController`
- **Current Features**:
  - Search by invoice number (via `search` param)
  - Type filter (pembelian, penjualan_tunai, penjualan_kredit, etc.)
  - Status filter (draft, completed, cancelled)
  - Date range filtering (from/to)
  - Hidden transactions (owner-only visibility)
  - Includes customer and supplier relationships
  - SoftDelete enabled
  - Complex payment tracking
- **Query Parameters**:
  - `search`: string - searches invoice number
  - `type`: string - enum filters (pembelian, penjualan_tunai, penjualan_kredit, retur_pembelian, retur_penjualan, pembayaran_utang, pembayaran_piutang, surat_jalan, kontra_bon)
  - `status`: string - enum (draft, completed, cancelled)
  - `from`: date - start date filter
  - `to`: date - end date filter
  - `perPage`: integer - pagination size (default 25)
- **Response Structure**:
  ```json
  {
    "data": [
      {
        "id": "1",
        "invoiceNumber": "INV/2026/001",
        "date": "2026-04-11",
        "type": "penjualan_tunai",
        "supplierId": null,
        "supplier": null,
        "customerId": "1",
        "customer": "Customer Name",
        "salesId": "1",
        "subtotal": 100000,
        "discount": 10000,
        "tax": 9000,
        "total": 99000,
        "paid": 99000,
        "remaining": 0,
        "status": "completed",
        "paymentStatus": "lunas",
        "isHidden": false,
        "notes": "Sample note",
        "items": [
          {
            "id": "1",
            "productId": "1",
            "productName": "Product",
            "quantity": 10,
            "price": 10000,
            "discount": 0,
            "subtotal": 100000
          }
        ],
        "createdAt": "2026-04-11T...",
        "updatedAt": "202
