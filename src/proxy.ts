import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let supabaseResponse = NextResponse.next({ request });

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 1. Check admin cookies & tokens
  const hasAdminCookie = request.cookies.get('aura_admin_session')?.value === 'true';
  const hasAdminRoleCookie = request.cookies.get('aura_user_role')?.value === 'admin';

  let isAdmin = hasAdminCookie || hasAdminRoleCookie;
  let user: any = null;

  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user || null;
    if (user) {
      if (
        user.email === 'admin@auraoutlet.com' ||
        user.user_metadata?.role === 'admin' ||
        user.app_metadata?.role === 'admin'
      ) {
        isAdmin = true;
      }
    }
  } catch (e) {
    // If network or auth fails, rely on cookie
  }

  // 2. Handling for ADMIN users:
  // If user is an admin: ONLY show admin screens! Redirect any public route to /admin
  if (isAdmin) {
    if (pathname.startsWith('/admin')) {
      return supabaseResponse;
    }
    // Admin trying to view public screens (e.g. /, /shop, /login, /account)
    // Redirect immediately to admin dashboard
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    url.search = '';
    return NextResponse.redirect(url);
  }

  // 3. Handling for NON-ADMIN users (Customers & Guests):
  // Never allow non-admins into /admin
  if (pathname.startsWith('/admin')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Protect customer account routes
  if (pathname.startsWith('/account') && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Redirect logged-in customers away from /login or /register
  const authRoutes = ['/login', '/register'];
  if (authRoutes.includes(pathname) && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/account';
    return NextResponse.redirect(url);
  }

  // All other public routes (home /, shop, product pages, etc.) show normally
  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
