# CustConnect - Three Portal System Documentation

## Overview

CustConnect implements a three-portal system with role-based access control (RBAC):

1. **Student Portal** - Full access to social features, view-only access to services
2. **Vendor Portal** - Limited access to manage own listings (cafés/buses)
3. **Super Admin Portal** - Full CRUD on all data, user management, analytics

---

## Portal Architecture

### 1. Student Portal

**Access:** Students (default role)

**Features:**
- Dashboard with quick stats
- Social Feed (create posts, comments, likes)
- Bus Service (view schedules, subscribe, real-time alerts)
- Cafés (view menus, deals, best-sellers)
- Resources (upload/download study materials)
- GPA Calculator
- Events (view and RSVP)
- Notifications
- Settings

**UI Color:** Gray (`bg-gray-800`)

**Navigation:**
- Dashboard
- Social Feed
- Bus Service
- Cafés
- Resources
- GPA Calculator
- Events
- Notifications
- Settings

---

### 2. Vendor Portal

**Access:** Cafe Owners, Bus Operators

**Features:**

#### Cafe Owner:
- Dashboard with café stats
- Manage Cafés (CRUD for menus, prices, deals, photos, hours, inventory)
- Analytics (views, popular items)
- Settings

#### Bus Operator:
- Dashboard with route stats
- Manage Bus Routes (CRUD for routes, schedules, driver info, fleet details)
- Send notifications/alerts
- Analytics (subscribers, route popularity)
- Settings

**UI Color:** Indigo (`bg-indigo-900`)

**Navigation:**
- Dashboard
- My Cafés (Cafe Owner only)
- My Bus Routes (Bus Operator only)
- Analytics
- Settings

**Access Control:**
- Vendors can ONLY manage their own listings
- Cannot access student private data
- Cannot access other vendors' data
- Super Admin can access all vendor data

---

### 3. Super Admin Portal

**Access:** Super Admin only

**Features:**
- Dashboard with platform-wide stats
- User Management (view, edit, activate/deactivate, assign roles)
- Vendor Management (approve vendors, assign portal access)
- Cafés Management (full CRUD on all cafés)
- Bus Routes Management (full CRUD on all routes)
- Analytics (traffic, top-selling foods, busiest buses, post engagement)
- Audit Logs (all admin actions tracked)
- Global Settings

**UI Color:** Purple (`bg-purple-900`)

**Navigation:**
- Dashboard
- Users
- Vendors
- Cafés
- Bus Routes
- Analytics
- Audit Logs
- Settings

**Key Features:**
- Assign vendor roles to users (CAFE_OWNER, BUS_OPERATOR)
- Approve/revoke vendor access
- View all audit logs
- Platform-wide analytics

---

## RBAC Permission Table

| Resource | Action | Student | Cafe Owner | Bus Operator | Super Admin |
|----------|--------|---------|------------|--------------|-------------|
| **Posts** | Create | ✅ | ❌ | ❌ | ✅ |
| | View | ✅ | ❌ | ❌ | ✅ |
| | Delete | Own only | ❌ | ❌ | ✅ |
| **Cafés** | View | ✅ | Own only | ✅ | ✅ |
| | Create | ❌ | ❌ | ❌ | ✅ |
| | Update | ❌ | Own only | ❌ | ✅ |
| | Delete | ❌ | ❌ | ❌ | ✅ |
| **Cafe Menus** | View | ✅ | Own only | ✅ | ✅ |
| | Create/Update | ❌ | Own only | ❌ | ✅ |
| | Delete | ❌ | Own only | ❌ | ✅ |
| **Cafe Deals** | View | ✅ | Own only | ✅ | ✅ |
| | Create/Update | ❌ | Own only | ❌ | ✅ |
| | Delete | ❌ | Own only | ❌ | ✅ |
| **Bus Routes** | View | ✅ | ✅ | Own only | ✅ |
| | Create | ❌ | ❌ | ❌ | ✅ |
| | Update | ❌ | ❌ | Own only | ✅ |
| | Delete | ❌ | ❌ | ❌ | ✅ |
| **Bus Schedules** | View | ✅ | ✅ | Own only | ✅ |
| | Create/Update | ❌ | ❌ | Own only | ✅ |
| | Delete | ❌ | ❌ | Own only | ✅ |
| **Bus Notifications** | View | ✅ | ✅ | Own only | ✅ |
| | Send | ❌ | ❌ | Own only | ✅ |
| **Users** | View | Own only | ❌ | ❌ | ✅ |
| | Create | ❌ | ❌ | ❌ | ✅ |
| | Update | Own only | ❌ | ❌ | ✅ |
| | Delete | ❌ | ❌ | ❌ | ✅ |
| | Assign Roles | ❌ | ❌ | ❌ | ✅ |
| **Vendors** | View | ❌ | ❌ | ❌ | ✅ |
| | Approve | ❌ | ❌ | ❌ | ✅ |
| | Revoke Access | ❌ | ❌ | ❌ | ✅ |
| **Analytics** | View | Own only | Own only | Own only | ✅ (All) |
| **Audit Logs** | View | ❌ | ❌ | ❌ | ✅ |

---

## Wireframes

### Student Portal Dashboard
```
┌─────────────────────────────────────────────────┐
│ [Logo] CustConnect                    [User] [⚙]│
├─────────────────────────────────────────────────┤
│                                                 │
│  Welcome back, [Name]! 👋                      │
│                                                 │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐         │
│  │Posts │ │Buses │ │Cafés │ │Events│         │
│  │ 1,234│ │  5   │ │  11  │ │  23  │         │
│  └──────┘ └──────┘ └──────┘ └──────┘         │
│                                                 │
│  Quick Actions:                                 │
│  ┌─────────────┐ ┌─────────────┐              │
│  │Create Post  │ │Check Bus    │              │
│  └─────────────┘ └─────────────┘              │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Vendor Portal (Cafe Owner)
```
┌─────────────────────────────────────────────────┐
│ [Logo] Vendor Portal                  [User] [⚙]│
├─────────────────────────────────────────────────┤
│                                                 │
│  Welcome to Vendor Portal, [Name]! 👋          │
│                                                 │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐         │
│  │Cafés │ │Deals │ │Views │ │Stats │         │
│  │  2   │ │  5   │ │ 1.2K │ │  ... │         │
│  └──────┘ └──────┘ └──────┘ └──────┘         │
│                                                 │
│  My Cafés:                                      │
│  ┌─────────────────────────────────────┐       │
│  │ Campus Coffee Corner        [Active]│       │
│  │ Location: Main Campus               │       │
│  │ Menu Items: 15  Active Deals: 3     │       │
│  │ [Manage Menu] [Manage Deals]        │       │
│  └─────────────────────────────────────┘       │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Super Admin Portal
```
┌─────────────────────────────────────────────────┐
│ [Logo] Admin Portal                   [User] [⚙]│
├─────────────────────────────────────────────────┤
│                                                 │
│  Super Admin Dashboard, [Name]! 👋             │
│                                                 │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐         │
│  │Users │ │Vendors│ │Cafés │ │Routes│         │
│  │ 1,234│ │  12  │ │  45  │ │  23  │         │
│  └──────┘ └──────┘ └──────┘ └──────┘         │
│                                                 │
│  Quick Actions:                                 │
│  ┌─────────────┐ ┌─────────────┐              │
│  │Manage Users │ │Manage Vendors│              │
│  └─────────────┘ └─────────────┘              │
│  ┌─────────────┐ ┌─────────────┐              │
│  │Analytics    │ │Audit Logs  │              │
│  └─────────────┘ └─────────────┘              │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## API Endpoints

### Vendor APIs

#### Cafe Management
- `GET /api/vendor/cafes` - Get vendor's cafes
- `PUT /api/vendor/cafes/:id/menu` - Update cafe menu
- `PUT /api/vendor/cafes/:id/deals` - Update cafe deals

#### Bus Management
- `GET /api/vendor/buses` - Get vendor's bus routes
- `PUT /api/vendor/buses/:id/schedule` - Update bus schedule
- `POST /api/vendor/buses/:id/notify` - Send bus notification

### Admin APIs

#### User Management
- `GET /api/admin/users` - List all users
- `POST /api/admin/users/:id/roles` - Assign role to user
- `PUT /api/admin/users/:id/toggle-active` - Activate/deactivate user

#### Vendor Management
- `GET /api/admin/vendors` - List all vendors
- `POST /api/admin/vendors/:id/approve` - Approve vendor

#### Analytics
- `GET /api/admin/analytics` - Get platform analytics

#### Audit Logs
- `GET /api/admin/audit` - Get audit logs (filterable)

---

## Audit Logging

All admin actions are automatically logged:

- **Action Types:** CREATE, UPDATE, DELETE, ROLE_ASSIGN
- **Entity Types:** USER, CAFE, BUS_ROUTE, ROLE
- **Details:** JSON string with action details
- **User Tracking:** userId and userEmail

Audit logs are accessible only to Super Admins.

---

## Role Assignment Flow

1. User registers as Student (default)
2. Super Admin assigns vendor role (CAFE_OWNER or BUS_OPERATOR)
3. Super Admin assigns cafe/bus route to vendor
4. Vendor can now access Vendor Portal
5. Vendor can manage their assigned listings

**Important:** Only Super Admin can assign roles. Vendors cannot assign roles to themselves or others.

---

## Security Features

1. **JWT Authentication** - All routes protected
2. **Role-Based Access Control** - Middleware checks user roles
3. **Resource Scoping** - Vendors can only access their own resources
4. **Audit Trail** - All admin actions logged
5. **Input Validation** - All inputs validated and sanitized

---

## Database Schema Updates

### AuditLog Model
```prisma
model AuditLog {
  id         String   @id @default(cuid())
  action     String
  entityType String
  entityId   String
  userId     String
  userEmail  String
  details    String
  createdAt  DateTime @default(now())

  @@map("audit_logs")
  @@index([userId])
  @@index([entityType, entityId])
  @@index([createdAt])
}
```

---

## Implementation Status

✅ Role-based sidebar components
✅ Student Portal (existing)
✅ Vendor Portal - Cafe Management
✅ Vendor Portal - Bus Management
✅ Super Admin Portal - User Management
✅ Super Admin Portal - Vendor Management
✅ Super Admin Portal - Analytics
✅ Super Admin Portal - Audit Logs
✅ Backend APIs for vendor CRUD
✅ Audit logging middleware
✅ RBAC permission table
✅ Documentation

---

## Next Steps

1. Implement API integrations in frontend
2. Add file upload for cafe photos
3. Add real-time notifications via Socket.io
4. Implement analytics charts/graphs
5. Add pagination for large lists
6. Add search and filtering
7. Add export functionality for audit logs

---

## Notes

- All vendor operations are scoped to their own entities
- Super Admin has full access to all resources
- Audit logs track all admin actions automatically
- Role assignment is only possible through Super Admin portal
- UI colors differentiate portals (Gray/Indigo/Purple)

