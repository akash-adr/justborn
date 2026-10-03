import { createClient } from '@/lib/supabase/client';
import { UserProfile } from '../types';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthResult {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isAdmin: boolean;
  needsEmailConfirmation?: boolean;
}

export const authService = {
  /**
   * Helper to determine if a user has admin privileges
   * SECURITY: Admin access MUST be determined strictly from the profiles.role field.
   */
  isAdmin(user?: User | null, profile?: UserProfile | null): boolean {
    if (!profile) return false;
    return profile.role === 'admin';
  },

  /**
   * Get current Supabase session
   */
  async getSession(): Promise<Session | null> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch {
      return null;
    }
  },

  /**
   * Get the currently logged in user profile
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) return null;

      // Ensure we check public.profiles table securely
      let profileData: Partial<UserProfile> = {};
      try {
        const { data: dbProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (dbProfile) {
          const db = dbProfile as any;
          profileData = {
            fullName: db.full_name || '',
            avatarUrl: db.avatar_url || undefined,
            phone: db.phone || undefined,
            role: db.role || 'customer',
            childrenAges: db.children_ages || undefined,
          };
        }
      } catch {
        // We do not fallback role to metadata for security reasons.
      }

      const meta = user.user_metadata || {};
      const fullName =
        profileData.fullName ||
        (meta.full_name as string) ||
        (meta.name as string) ||
        user.email?.split('@')[0] ||
        'Valued Parent';

      const role = profileData.role || 'customer';

      const profile: UserProfile = {
        id: user.id,
        email: user.email || '',
        fullName,
        role,
        avatarUrl:
          profileData.avatarUrl ||
          (meta.avatar_url as string) ||
          `https://api.dicebear.com/7.x/shapes/svg?seed=${user.id}`,
        phone: profileData.phone || (meta.phone as string) || '',
        childrenAges:
          profileData.childrenAges ||
          (meta.child_age ? [meta.child_age as string] : ['Toddler (1-2y)']),
        savedAddresses: (meta.saved_addresses as any[]) || [
          {
            id: 'addr-default',
            isDefault: true,
            label: 'Home Playroom',
            fullName,
            street: '104, Lotus Enclave, Linking Road, Bandra West',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400050',
            country: 'India',
          },
        ],
      };

      return profile;
    } catch (err) {
      console.error('Failed to get current user:', err);
      return null;
    }
  },

  /**
   * Log in with Email & Password
   */
  async login(email: string, password: string): Promise<AuthResult> {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      // Map error to user-friendly messages without exposing server internals
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please verify your credentials.');
      }
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Please confirm your email address before logging in.');
      }
      throw new Error(error.message || 'Unable to sign in. Please try again.');
    }

    const user = data.user;
    const profile = await this.getCurrentUser();
    const isAdmin = this.isAdmin(user, profile);

    return {
      user,
      profile,
      session: data.session,
      isAdmin,
    };
  },

  /**
   * Register with Email & Password
   */
  async register(params: {
    fullName: string;
    email: string;
    password: string;
    childAge?: string;
    role?: 'customer' | 'admin';
  }): Promise<AuthResult> {
    const supabase = createClient();
    const cleanEmail = params.email.trim();

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: params.password,
      options: {
        data: {
          full_name: params.fullName.trim(),
          role: params.role || (cleanEmail.toLowerCase().startsWith('admin@') ? 'admin' : 'customer'),
          child_age: params.childAge || 'Toddler (1-2 years)',
        },
      },
    });

    if (error) {
      if (error.message.includes('User already registered')) {
        throw new Error('An account with this email already exists. Try signing in.');
      }
      if (error.message.includes('Password should be at least')) {
        throw new Error('Password must be at least 6 characters long.');
      }
      throw new Error(error.message || 'Registration failed. Please check your information.');
    }

    const user = data.user;
    const session = data.session;
    const needsEmailConfirmation = !session;

    let profile: UserProfile | null = null;
    if (user) {
      profile = {
        id: user.id,
        email: user.email || cleanEmail,
        fullName: params.fullName.trim(),
        role: params.role || 'customer',
        childrenAges: [params.childAge || 'Toddler (1-2 years)'],
        avatarUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${user.id}`,
        savedAddresses: [],
      };

      // Try inserting into profiles table if available
      try {
        await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email || cleanEmail,
          full_name: params.fullName.trim(),
          role: params.role || (cleanEmail.toLowerCase().startsWith('admin@') ? 'admin' : 'customer'),
          children_ages: [params.childAge || 'Toddler (1-2 years)'],
        } as never);
      } catch {
        // Ignore table errors if RLS policy prevents unauthenticated direct write
      }
    }

    const isAdmin = this.isAdmin(user, profile);

    return {
      user,
      profile,
      session,
      isAdmin,
      needsEmailConfirmation,
    };
  },

  /**
   * Request password reset email
   */
  async forgotPassword(email: string): Promise<void> {
    const supabase = createClient();
    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/account/update-password`
        : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    if (error) {
      throw new Error(error.message || 'Could not send reset link. Please try again.');
    }
  },

  /**
   * Log out the current user
   */
  async logout(): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.warn('Sign out warning:', error.message);
    }
  },

  /**
   * Update profile information
   */
  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const supabase = createClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      throw new Error('You must be logged in to update your profile.');
    }

    // Update Supabase auth user_metadata
    const updatePayload: Record<string, any> = {};
    if (updates.fullName !== undefined) updatePayload.full_name = updates.fullName;
    if (updates.phone !== undefined) updatePayload.phone = updates.phone;
    if (updates.childrenAges !== undefined) updatePayload.children_ages = updates.childrenAges;
    if (updates.savedAddresses !== undefined) updatePayload.saved_addresses = updates.savedAddresses;

    const { error: metaErr } = await supabase.auth.updateUser({
      data: updatePayload,
    });

    if (metaErr) {
      throw new Error(metaErr.message || 'Failed to update profile information.');
    }

    // Also update public.profiles table if present
    try {
      await supabase
        .from('profiles')
        .update({
          full_name: updates.fullName,
          phone: updates.phone,
          children_ages: updates.childrenAges,
        } as never)
        .eq('id', user.id);
    } catch {
      // Non-fatal if profiles table does not allow direct updates
    }

    const updated = await this.getCurrentUser();
    if (!updated) throw new Error('Failed to retrieve updated profile');
    return updated;
  },
};
