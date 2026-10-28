# Waste Wise REST API Documentation

All endpoints are versioned under `/api/v1`.

## Common Headers
- `Content-Type: application/json`
- `Authorization: Bearer <SUPABASE_JWT_ACCESS_TOKEN>` (for protected endpoints)

## Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-10-28T15:30:00.000Z"
  }
}
```

### Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please check your input.",
    "details": [ ... ]
  }
}
```

---

## Public Endpoints

### 1. Health Check
`GET /api/v1/health`
- **Response**: `{ status: "healthy", service: "Waste Wise API", uptime: 124.5 }`

### 2. Categories
`GET /api/v1/categories`
- Returns all 6 active waste categories with color codes and disposal guidance.

`GET /api/v1/categories/:idOrSlug`
- Returns a specific category by UUID or slug (e.g. `wet-biodegradable`).

### 3. Waste Catalog Items
`GET /api/v1/items?search=&category=&page=1&limit=20`
- Returns searchable catalog items with aliases.

### 4. Classification
`POST /api/v1/classifications`
- **Body**: `{ "text": "plastic milk pouch", "saveRecord": false }`
- **Response**: Returns matched category, disposal instructions, precautions, rule confidence.

---

## Authenticated Resident Endpoints

### 5. Current Identity
`GET /api/v1/me`
- Requires Bearer token. Returns authenticated user profile and role.

### 6. User Classification History
`GET /api/v1/classifications`
- Returns logged classifications for the authenticated resident.

### 7. Learning Modules
`GET /api/v1/learning`
- Returns published modules and `isCompleted` flag for the user.

`POST /api/v1/learning/:id/complete`
- Marks module as completed and awards 25 points idempotently.

### 8. Rewards & Balance
`GET /api/v1/rewards/balance`
- Returns total balance, current tier rank, and points required for next level.

`GET /api/v1/rewards/ledger`
- Returns audit ledger of all point credits.

`GET /api/v1/rewards/rules`
- Returns active point award rules.

### 9. Dashboard
`GET /api/v1/dashboard/summary`
- Aggregated user statistics, category breakdown for chart, and recent activity.

---

## Administrator Endpoints (Admin Role Required)

- `GET /api/v1/admin/overview`: Platform counts (users, classifications, items, points).
- `GET /api/v1/admin/users`: Registered user listing.
- `GET /api/v1/admin/audit-logs`: Immutable log of admin modifications.
- `POST /api/v1/admin/categories`: Create category.
- `PUT /api/v1/admin/categories/:id`: Update category.
- `DELETE /api/v1/admin/categories/:id`: Delete category.
- `POST /api/v1/admin/items`: Create catalog item with aliases and rules.
- `PUT /api/v1/admin/items/:id`: Update item.
- `DELETE /api/v1/admin/items/:id`: Delete item.
- `PUT /api/v1/admin/reward-rules/:id`: Update points delta for an event rule.

