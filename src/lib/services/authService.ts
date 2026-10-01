import { UserProfile } from '../types';
import { MOCK_USER } from '../mock-data';

let currentUser: UserProfile | null = MOCK_USER;

export const authService = {
  async getCurrentUser(): Promise<UserProfile | null> {
    await new Promise((r) => setTimeout(r, 50));
    return currentUser;
  },

  async login(email: string): Promise<UserProfile> {
    await new Promise((r) => setTimeout(r, 120));
    currentUser = {
      ...MOCK_USER,
      email,
    };
    return currentUser;
  },

  async register(fullName: string, email: string): Promise<UserProfile> {
    await new Promise((r) => setTimeout(r, 120));
    currentUser = {
      id: `usr-${Date.now()}`,
      fullName,
      email,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      childrenAges: ['Newborn'],
      savedAddresses: [],
    };
    return currentUser;
  },

  async logout(): Promise<void> {
    await new Promise((r) => setTimeout(r, 50));
    currentUser = null;
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    await new Promise((r) => setTimeout(r, 80));
    if (!currentUser) throw new Error('Not logged in');
    currentUser = { ...currentUser, ...updates };
    return currentUser;
  },
};
