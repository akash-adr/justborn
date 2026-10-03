import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return null;
  }
  return user;
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    return null;
  }

  return profile;
}

export async function requireUser(redirectUrl: string = '/login') {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`${redirectUrl}?redirect=${encodeURIComponent(redirectUrl)}`);
  }
  return user;
}

/**
 * Route protection for Page Components (redirects to / if not admin)
 * Verifies authenticated session + database profiles.role = 'admin'
 */
export async function requireAdmin() {
  const user = await requireUser();
  const adminClient: any = createAdminClient();
  const { data: profile } = await adminClient
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single();

  // Admin access MUST be determined strictly from the database profile, never from client metadata
  if (!profile || profile.role !== 'admin') {
    redirect('/'); // Unauthorized users are sent to the home page
  }

  return { user, profile };
}

/**
 * Endpoint protection for Server Actions & API routes (throws error if not admin)
 * Verifies authenticated session + database profiles.role = 'admin'
 */
export async function assertAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('UNAUTHENTICATED');
  }

  const adminClient: any = createAdminClient();
  const { data: profile, error } = await adminClient
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single();

  if (error || !profile || profile.role !== 'admin') {
    throw new Error('UNAUTHORIZED_ADMIN_ACCESS');
  }

  return { user, profile };
}
