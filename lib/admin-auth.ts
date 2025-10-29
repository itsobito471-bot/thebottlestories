import { supabase } from './supabase';

export async function signInAdmin(email: string, password: string) {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    throw authError;
  }

  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', authData.user.id)
    .maybeSingle();

  if (adminError || !adminUser) {
    await supabase.auth.signOut();
    throw new Error('Not authorized as admin');
  }

  return { user: authData.user, adminUser };
}

export async function signOutAdmin() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentAdmin() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  return adminUser;
}

export async function checkAdminAuth() {
  const adminUser = await getCurrentAdmin();
  return !!adminUser;
}
