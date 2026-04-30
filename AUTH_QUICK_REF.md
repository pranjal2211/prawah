# 🔐 Authentication Quick Reference

## Commands

```bash
# Install dependencies
npm install

# Set up database
npx prisma db push

# Seed demo users
npx tsx prisma/seed.ts

# View/edit database (GUI)
npx prisma studio

# Generate Prisma client (after schema changes)
npx prisma generate

# Start dev server
npm run dev
```

---

## Demo Credentials

```
👑 ADMIN
  email: admin@demo.com
  password: admin123
  access: ALL (including /admin)

📊 ANALYST  
  email: analyst@demo.com
  password: analyst123
  access: /dashboard, /analytics, /predict

👁️ VIEWER
  email: viewer@demo.com
  password: viewer123
  access: /dashboard, /analytics (read-only)
```

---

## Key Files

| File | Purpose |
|------|---------|
| `auth.ts` | NextAuth config (root) |
| `middleware.ts` | Route protection (root) |
| `app/login/page.tsx` | Login form |
| `app/register/page.tsx` | Registration |
| `app/admin/page.tsx` | Admin dashboard |
| `lib/permissions.ts` | Role checker |
| `prisma/schema.prisma` | Database schema |

---

## Code Examples

### Check User Permission
```typescript
import { auth } from "@/auth"
import { can } from "@/lib/permissions"

const session = await auth()
if (!can(session?.user?.role, "/predict")) {
  return <div>Access Denied</div>
}
```

### Get Session in Component
```typescript
"use client"
import { useSession } from "next-auth/react"

export default function Component() {
  const { data: session } = useSession()
  
  return <div>{session?.user?.email}</div>
}
```

### Create New User
```typescript
const response = await fetch("/api/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "user@example.com",
    password: "securepass123",
    name: "John Doe"
  })
})
```

### Update User Role (Admin)
```typescript
const response = await fetch("/api/admin/users", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    userId: "user-id",
    role: "ANALYST"
  })
})
```

### Sign Out User
```typescript
"use client"
import { signOut } from "next-auth/react"

<button onClick={() => signOut({ redirect: false })}>
  Sign Out
</button>
```

---

## Role-Based Routes

```
PUBLIC:
  /login
  /register
  /unauthorized

VIEWER & ABOVE:
  /dashboard
  /analytics

ANALYST & ABOVE:
  /predict

ADMIN ONLY:
  /admin
```

---

## Environment Setup

### Create `.env.local`
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

### For Neon PostgreSQL
1. Create project on neon.tech
2. Copy connection string
3. Add to `DATABASE_URL`
4. Run `npx prisma db push`

---

## Testing Checklist

- [ ] Can login with admin@demo.com
- [ ] Redirects to /login when not authenticated
- [ ] VIEWER only sees /dashboard & /analytics
- [ ] ANALYST sees /predict link too
- [ ] ADMIN sees /admin link
- [ ] /unauthorized shows for restricted routes
- [ ] Sign out clears session and redirects
- [ ] Can register new users
- [ ] Admin can change user roles
- [ ] Navigation updates based on role

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Unauthorized" after setup | Run `npx prisma db push && npx tsx prisma/seed.ts` |
| Login fails | Check DATABASE_URL is correct and database is running |
| Middleware not working | Restart `npm run dev` |
| Session not available | Clear cache and check SessionProvider in layout.tsx |
| "No user found" error | Verify users exist with `npx prisma studio` |

---

## Prisma Quick Tips

```bash
# Open database GUI
npx prisma studio

# Reset database (⚠️ deletes all data)
npx prisma db push --force-reset

# View schema
cat prisma/schema.prisma

# Generate types after schema change
npx prisma generate
```

---

## Security Checklist

- ✅ Passwords hashed with bcryptjs (10 rounds)
- ✅ Sessions stored in httpOnly cookies
- ✅ CSRF tokens built into NextAuth
- ✅ Middleware validates every request
- ✅ .env.local in .gitignore
- ✅ JWT secret generated and stored securely
- ✅ Type-safe session data

---

**Need help? See AUTHENTICATION_SETUP.md for full documentation**
