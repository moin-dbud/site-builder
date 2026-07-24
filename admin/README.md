# Buildo Admin Panel

Internal management console for the Buildo platform. Separate frontend application from `client/`.

## Setup

### Prerequisites
- The main `server/` backend must be running
- You need an existing Buildo account to grant admin access to

### Running the Admin Panel

```bash
cd admin
npm install   # only needed first time
npm run dev   # starts at http://localhost:5174
```

### Making a User an Admin

There is **no self-serve way to become an admin**. Admin access must be granted manually via a direct database update.

After running the server migrations, execute the following SQL in your Neon database (via the Neon console, `psql`, or a DB client like TablePlus):

```sql
UPDATE "user"
SET "isAdmin" = true
WHERE email = 'your-email@example.com';
```

Then sign in at `http://localhost:5174` with that account. The panel will verify admin access before allowing entry.

## Architecture

### Authentication Flow
1. User signs in via Better Auth (same session system as main `client/`)
2. After sign-in, the admin panel calls `GET /api/admin/me`
3. The `requireAdmin` middleware checks:
   - Valid Better Auth session
   - `user.isAdmin === true` in the database
4. If either check fails: 403 Forbidden

### Admin-only API Routes
All routes under `/api/admin/*` are protected by the `requireAdmin` middleware in `server/middlewares/auth.ts`.

### Audit Logging
Every destructive or state-changing action is logged to the `AdminAuditLog` table.

## Database Tables Added

| Table | Purpose |
|-------|---------|
| `user.isAdmin` | Boolean flag to identify admin accounts |
| `WebsiteProject.featured` | Flag to pin community projects |
| `AdminAuditLog` | Immutable log of all admin actions |
| `SystemSetting` | Key-value store for runtime config |
| `DesignSystem` | Design preset library (migrated from static file) |

## Environment Variables

```env
# admin/.env
VITE_BASEURL=http://localhost:3000   # points to the server
```
