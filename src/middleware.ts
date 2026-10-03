import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // Update the session to refresh tokens
  const response = await updateSession(request);

  // Check the path for protected routes: account, admin, and checkout
  const path = request.nextUrl.pathname;
  if (path.startsWith('/account') || path.startsWith('/admin') || path.startsWith('/checkout')) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // If no user, redirect to login for protected routes
    if (!user) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(redirectUrl);
    }

    // Explicit Admin protection
    if (path.startsWith('/admin')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      // Admin access must be determined strictly from the database profile role
      if (!profile || profile.role !== 'admin') {
        const homeUrl = new URL('/', request.url);
        return NextResponse.redirect(homeUrl);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
