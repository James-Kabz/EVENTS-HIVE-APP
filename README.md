Thought for 3 seconds### Next.js Authentication System

A complete authentication and authorization system built with Next.js, NextAuth.js, Prisma, MySQL, and shadcn/ui components. This application provides a secure, role-based authentication system with a responsive dashboard interface.




## Features

- **Authentication Methods**

- Email/Password authentication
- Google OAuth integration
- Session management with JWT



- **Authorization**

- Role-based access control (RBAC)
- Permission-based component rendering
- Protected routes and API endpoints



- **User Management**

- User registration and login
- Profile management
- Password security with bcrypt



- **UI/UX**

- Responsive dashboard layout
- Collapsible sidebar navigation
- Dark/light mode support
- Breadcrumb navigation
- Toast notifications



- **Database**

- MySQL integration with Prisma ORM
- Relational data model for users and roles
- Secure credential storage





## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: MySQL, Prisma ORM
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Form Handling**: React Hook Form, Zod validation


## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18.x or later
- MySQL database
- Git


You'll also need accounts for any OAuth providers you want to use:

- Google Cloud Platform account (for Google OAuth)


## Installation and Setup

### 1. Clone the repository

```shellscript
git clone https://github.com/yourusername/nextjs-auth-system.git
cd nextjs-auth-system
```

### 2. Install dependencies

```shellscript
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory with the following variables:

```plaintext
# Database
DATABASE_URL="mysql://username:password@localhost:3306/auth_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key" # Generate with: openssl rand -base64 32

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 4. Set up the database

```shellscript
# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma db push

# Seed the database with initial data (optional)
npx prisma db seed
```

### 5. Run the development server

```shellscript
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Database Setup

This project uses Prisma ORM with a MySQL database. The schema is defined in `prisma/schema.prisma`.

### Database Schema

The database includes the following models:

- **User**: Stores user information and authentication details
- **Account**: Manages OAuth provider connections
- **Session**: Handles user sessions
- **Role**: Defines user roles and permissions
- **VerificationToken**: Manages email verification


### Initial Setup

The application automatically creates default roles when the first user registers:

- **Admin**: Full access to all features
- **User**: Limited access to basic features


You can modify the default roles and permissions in `app/api/auth/register/route.ts`.

## Authentication Configuration

### NextAuth.js Setup

The NextAuth.js configuration is in `lib/auth.ts`. It includes:

- Session strategy (JWT)
- Custom pages
- Authentication providers
- Callbacks for JWT and session handling


### Adding Custom Providers

To add a new authentication provider:

1. Install the provider package:

```shellscript
npm install @auth/prisma-adapter next-auth
npm install @auth/core
```


2. Add the provider to `lib/auth.ts`:

```typescript
import NewProvider from "next-auth/providers/new-provider"

// Add to providers array
providers: [
  // Existing providers
  NewProvider({
    clientId: process.env.NEW_PROVIDER_CLIENT_ID!,
    clientSecret: process.env.NEW_PROVIDER_CLIENT_SECRET!,
  }),
]
```


3. Add the required environment variables to `.env.local`


### Custom Credentials Provider

The application includes a custom credentials provider for email/password authentication. The authentication logic is in `lib/auth.ts`:

```typescript
CredentialsProvider({
  name: "Credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    // Authentication logic
  }
})
```

## Role-Based Access Control

### Permission System

The permission system is defined in `lib/permissions.ts`. It includes:

- Permission types
- Role interface
- Helper functions for checking permissions


```typescript
// Example permission check
import { hasPermission } from "@/lib/permissions"

if (hasPermission(user.permissions, "manage_users")) {
  // Allow user management
}
```

### PermissionGate Component

The `PermissionGate` component in `components/auth/permission-gate.tsx` provides a declarative way to conditionally render UI elements based on user permissions:

```typescriptreact
<PermissionGate permission="manage_users">
  <UserManagementPanel />
</PermissionGate>

// Or with multiple permissions
<PermissionGate 
  permissions={["manage_users", "manage_roles"]} 
  requireAll={true}
>
  <AdminPanel />
</PermissionGate>
```

## Project Structure

```plaintext
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   ├── dashboard/            # Dashboard pages
│   ├── login/                # Login page
│   ├── register/             # Registration page
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── components/               # React components
│   ├── auth/                 # Authentication components
│   ├── dashboard/            # Dashboard components
│   ├── landing/              # Landing page components
│   ├── ui/                   # UI components (shadcn/ui)
│   └── theme-provider.tsx    # Theme provider
├── hooks/                    # Custom React hooks
├── lib/                      # Utility functions
│   ├── auth.ts               # NextAuth configuration
│   ├── db.ts                 # Database client
│   ├── permissions.ts        # Permission utilities
│   └── utils.ts              # General utilities
├── prisma/                   # Prisma ORM
│   └── schema.prisma         # Database schema
├── public/                   # Static assets
├── .env.example              # Example environment variables
├── next.config.js            # Next.js configuration
├── package.json              # Project dependencies
├── tailwind.config.js        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

## Key Components

### Authentication Components

- **AuthProvider**: Wraps the application with NextAuth's SessionProvider
- **LoginForm**: Handles user login with email/password or Google
- **RegisterForm**: Manages user registration
- **PermissionGate**: Conditionally renders content based on user permissions


### Dashboard Components

- **DashboardSidebar**: Main navigation sidebar with collapsible functionality
- **DashboardHeader**: Top navigation bar with user menu and notifications
- **DashboardBreadcrumb**: Breadcrumb navigation for dashboard pages
- **UserNav**: User dropdown menu with profile and logout options


### UI Components

The application uses shadcn/ui components, which are built on top of Radix UI and styled with Tailwind CSS. Key components include:

- **Sidebar**: Collapsible sidebar with icon-only mode
- **Button**: Versatile button component with multiple variants
- **Card**: Container for dashboard content
- **Form**: Form components with validation
- **Toast**: Notification system


## API Routes

### Authentication API

- **POST /api/auth/register**: Creates a new user account

```typescript
// Request body
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}

// Success response (201)
{
  "message": "User created successfully"
}
```




### Protected API Routes

To create a protected API route, use the `getServerSession` function:

```typescript
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    })
  }
  
  // Handle authorized request
}
```

## Dashboard Layout

The dashboard uses a responsive layout with a collapsible sidebar:

### Sidebar States

- **Expanded**: Full sidebar with text and icons
- **Collapsed**: Icon-only sidebar for more screen space
- **Mobile**: Off-canvas sidebar that slides in from the side


### Sidebar Configuration

The sidebar can be configured in `components/dashboard/sidebar.tsx`:

```typescript
// Add or modify navigation items
const routes = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  // Add more routes here
]
```

### Collapsible Behavior

The sidebar collapse state is managed by the `SidebarProvider` and persisted in cookies. To toggle the sidebar:

```typescript
import { useSidebar } from "@/components/ui/sidebar"

function MyComponent() {
  const { toggleSidebar } = useSidebar()
  
  return (
    <button onClick={toggleSidebar}>
      Toggle Sidebar
    </button>
  )
}
```

## Deployment

### Vercel Deployment

The easiest way to deploy this application is with Vercel:

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Configure the environment variables
4. Deploy


### Database Deployment

For the database, you can use:

- [PlanetScale](https://planetscale.com/) for MySQL
- [Supabase](https://supabase.com/) for PostgreSQL (requires schema adjustments)
- [Railway](https://railway.app/) for various database options


Update your `DATABASE_URL` environment variable with the production database connection string.

## Troubleshooting

### Common Issues

#### Authentication Errors

- **Issue**: "Error: PKCE not supported"

- **Solution**: Ensure your `NEXTAUTH_SECRET` is set correctly



- **Issue**: OAuth provider not working

- **Solution**: Verify your OAuth credentials and authorized redirect URIs





#### Database Errors

- **Issue**: "Error: P1001: Can't reach database server"

- **Solution**: Check your `DATABASE_URL` and database server status



- **Issue**: "Error: P1017: Server has closed the connection"

- **Solution**: Check database connection limits and timeouts





#### Deployment Issues

- **Issue**: Environment variables not working in production

- **Solution**: Ensure all environment variables are set in your deployment platform





## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a pull request


## License

This project is licensed under the MIT License - see the LICENSE file for details.
