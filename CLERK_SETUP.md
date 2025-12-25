# Clerk Authentication Integration

This guide will help you set up Clerk authentication in your EduAI application.

## Steps to Set Up Clerk

### 1. Create a Clerk Account
1. Go to [https://dashboard.clerk.com/](https://dashboard.clerk.com/)
2. Sign up for a free account
3. Create a new application

### 2. Get Your API Keys
1. In your Clerk dashboard, go to **API Keys**
2. Copy the **Publishable Key**
3. Update the `.env.local` file in your project root:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
```

### 3. Configure Your Application
1. In the Clerk dashboard, go to **Paths**
2. Set the following paths:
   - Sign-in URL: `/login`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/dashboard`
   - After sign-up URL: `/dashboard`

### 4. Enable Social Login (Optional)
1. In the Clerk dashboard, go to **Social Connections**
2. Enable the providers you want (Google, GitHub, etc.)
3. Configure the OAuth settings for each provider

### 5. Customize Appearance (Optional)
1. In the Clerk dashboard, go to **Customization**
2. Upload your logo and customize colors to match your brand
3. The authentication forms will automatically use your styling

## Features Included

✅ **Sign In** - Users can sign in with email/password or social providers
✅ **Sign Up** - New users can create accounts
✅ **Protected Routes** - Dashboard routes are protected and require authentication
✅ **User Profile** - Access to user information via Clerk hooks
✅ **Sign Out** - Users can sign out securely
✅ **Responsive Design** - Authentication forms work on all devices

## Available Clerk Hooks

You can use these Clerk hooks throughout your application:

- `useUser()` - Get current user information
- `useAuth()` - Get authentication state and methods
- `useClerk()` - Access Clerk instance methods
- `useSession()` - Get current session information

## Example Usage

```tsx
import { useUser, useAuth } from '@clerk/clerk-react';

function MyComponent() {
  const { user, isSignedIn } = useUser();
  const { signOut } = useAuth();

  if (!isSignedIn) {
    return <div>Please sign in</div>;
  }

  return (
    <div>
      <p>Welcome, {user.firstName}!</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

## Testing

1. Start your development server: `npm run dev`
2. Visit `http://localhost:5173`
3. Try signing up for a new account
4. Test the sign-in process
5. Verify that protected routes redirect to login when not authenticated

## Deployment

When deploying to production:

1. Create a production application in Clerk
2. Update your environment variables with production keys
3. Update the allowed origins in your Clerk dashboard
4. Test the authentication flow in production

## Support

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Community](https://discord.com/invite/b5rXHjAg7A)
- [Clerk Support](https://clerk.com/support)
