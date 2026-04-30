# Role-Based Authentication Setup Guide

Your Electricity Demand Prediction app now has complete role-based authentication with NextAuth.js v5, Prisma, and PostgreSQL.

## 📋 What Was Added

✅ **NextAuth.js v5** - Credentials-based authentication with JWT sessions
✅ **Prisma ORM** - Database management with PostgreSQL
✅ **Three User Roles**:
   - **VIEWER**: Can access `/dashboard`, `/analytics` (read-only)
   - **ANALYST**: Can access `/dashboard`, `/analytics`, `/predict`
   - **ADMIN**: Full access including `/admin` (user management)

✅ **Route Protection** - Middleware that protects all routes
✅ **Session-Aware Navigation** - Nav links show/hide based on user role
✅ **Demo Users** - Pre-configured test accounts

---

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
cd electricity-demand-prediction-app
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Copy the example
cp .env.example .env.local
```

Then edit `.env.local` with your actual values:

```env
# 🔗 Database URL (using Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@region.neon.tech/dbname?sslmode=require"

# 🔐 NEXTAUTH Secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-generated-secret-here"

# 🌐 Application URL
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Set Up Database

```bash
# Create tables in your PostgreSQL database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed the database with demo users
npx tsx prisma/seed.ts
```

### 4. Run the Development Server

```bash
npm run dev
```

Visit **http://localhost:3000** → You'll be redirected to `/login`

---

## 👥 Demo Credentials

Use these to test different roles:

| Role    | Email              | Password    | Access                        |
|---------|-------------------|-------------|-------------------------------|
| Admin   | admin@demo.com    | admin123    | All routes + `/admin`         |
| Analyst | analyst@demo.com  | analyst123  | `/predict` + analytics/dashboard |
| Viewer  | viewer@demo.com   | viewer123   | `/analytics` + `/dashboard`   |

---

## 📁 New Files Created

### Core Authentication
- **auth.ts** - NextAuth configuration with JWT strategy
- **types/next-auth.d.ts** - TypeScript types for session
- **app/api/auth/[...nextauth]/route.ts** - NextAuth route handler
- **app/providers.tsx** - SessionProvider wrapper

### Auth Routes
- **app/api/register/route.ts** - User registration with bcrypt
- **app/api/admin/users/route.ts** - Admin user management
- **middleware.ts** - Route protection & role-based access

### Auth Pages
- **app/login/page.tsx** - Login form
- **app/register/page.tsx** - Registration form
- **app/unauthorized/page.tsx** - 403 Unauthorized page

### Database
- **prisma/schema.prisma** - User, Account, Session models
- **lib/prisma.ts** - Singleton PrismaClient
- **lib/permissions.ts** - `can()` helper for role checks
- **prisma/seed.ts** - Database seeding script

### Configuration
- **.env.example** - Environment variables template

---

## 🔐 How It Works

### Authentication Flow
1. User visits `/login` and enters credentials
2. NextAuth validates against bcrypt-hashed passwords in DB
3. JWT token is created and stored in secure cookie
4. User session includes `id`, `email`, and `role`
5. Navigation links show/hide based on `session.user.role`

### Route Protection
The **middleware.ts** enforces:
- Unauthenticated users → redirect to `/login`
- Users accessing routes they can't access → redirect to `/unauthorized`
- Navigation links only show for allowed routes

### Example: Check Permissions
```typescript
import { auth } from "@/auth"
import { can } from "@/lib/permissions"

const session = await auth()
if (!can(session?.user?.role, "/predict")) {
  // User can't access prediction
}
```

---

## 📦 Modified Files

These existing files were updated to support auth:

- **package.json** - Added dependencies & prisma scripts
- **app/layout.tsx** - Wrapped with AuthProvider (SessionProvider)
- **components/navigation.tsx** - Made auth-aware with role-based visibility

### Preserved Components (Untouched)
✅ All Zustand store logic remains unchanged
✅ demand-chart.tsx, metric-card.tsx, data-table.tsx - untouched
✅ prediction-form.tsx validation logic - untouched
✅ All existing routes work exactly as before

---

## 🛠️ Common Tasks

### Create a New Admin
```bash
npx tsx prisma/seed.ts  # Re-run seed to add demo users
```

Or manually via API:
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "neoadmin@example.com",
    "password": "SecurePassword123",
    "name": "New Admin"
  }'

# Then use admin endpoint to upgrade role (requires existing admin session)
```

### Change a User's Role (Admin Only)
```javascript
// From admin panel or API call
fetch('/api/admin/users', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-id',
    role: 'ANALYST'  // or 'VIEWER', 'ADMIN'
  })
})
```

### View All Users (Admin Only)
```bash
curl http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Reset Database
```bash
npx prisma db push --force-reset
npx tsx prisma/seed.ts
```

---

## 🔗 PostgreSQL Setup (Neon Guide)

1. Go to [neon.tech](https://neon.tech) → Create free account
2. Create a new project
3. Copy connection string from dashboard
4. Paste into `DATABASE_URL` in `.env.local`
5. Run `npx prisma db push`

---

## ⚙️ Important Notes

- **JWT Strategy**: Sessions are JWT-based (not database sessions) for Neon free tier compatibility
- **Password Hashing**: Uses bcryptjs (v10 rounds) for security
- **Session Duration**: 30 days (configurable in auth.ts)
- **HTTPS Required**: In production, ensure HTTPS (NEXTAUTH_URL uses https://)

---

## 🐛 Troubleshooting

### "Unauthorized" errors after setup?
- Run `npx prisma db push` to create tables
- Run `npx tsx prisma/seed.ts` to add demo users

### Login fails with "No user found"?
- Verify users exist: `npx prisma studio` (GUI database browser)
- Check DATABASE_URL is correct

### Middleware not working?
- Ensure `auth.ts` and `middleware.ts` are in project root (not inside `app/`)
- Restart dev server: `npm run dev`

### Navigation not showing signin/signout buttons?
- Clear browser cache (Ctrl+Shift+Delete)
- Check that SessionProvider wraps the app in layout.tsx

---

## 📚 File Structure

```
electricity-demand-prediction-app/
├── auth.ts                          ← NextAuth config
├── middleware.ts                     ← Route protection
├── prisma/
│   ├── schema.prisma               ← Database schema
│   └── seed.ts                     ← Seed demo data
├── lib/
│   ├── prisma.ts                   ← PrismaClient singleton
│   └── permissions.ts              ← can() helper
├── types/
│   └── next-auth.d.ts              ← Session TypeScript types
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── register/route.ts
│   │   └── admin/users/route.ts
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── unauthorized/page.tsx
│   ├── layout.tsx                  ← UPDATED with AuthProvider
│   └── providers.tsx               ← SessionProvider wrapper
├── components/
│   └── navigation.tsx              ← UPDATED with auth-aware nav
├── .env.local                      ← ⚠️ Create this file with your secrets
└── .env.example                    ← Reference template
```

---

## 🎉 Next Steps

1. ✅ Run setup commands above
2. ✅ Test login with demo credentials
3. ✅ Try switching between VIEWER/ANALYST/ADMIN accounts
4. ✅ Check that /predict link only shows for ANALYST+ADMIN
5. ✅ Test /unauthorized when accessing restricted routes
6. ✅ Replace demo users with real ones for production

---

## 📖 Documentation Links

- [NextAuth.js Docs](https://authjs.dev)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Neon PostgreSQL](https://neon.tech/docs)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

---

**Your app is now fully secured with role-based authentication! 🔒⚡**
