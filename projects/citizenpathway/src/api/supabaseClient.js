// Supabase client for the frontend.
//
// IMPORTANT:
//  - This file uses ONLY the publishable (anon) key. RLS policies on the
//    database enforce per-user access.
//  - The service-role / secret key must NEVER be imported here. Server-side
//    operations that need the secret live in a Supabase Edge Function
//    (see /supabase/functions/secure-proxy).
//
// Env vars (Vite):
//   VITE_SUPABASE_URL
//   VITE_SUPABASE_PUBLISHABLE_KEY
//
// Defaults fall back to the Citizen Pathway project so local dev works
// out of the box.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://bhanfrzahltcgwvvfzye.supabase.co';

const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_d0vu6xcub2hTa7PgvDvsrA_UccSKpz0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

// --- Thin entity helpers -----------------------------------------------------
// These mimic the Base44 SDK shape (`base44.entities.X.list/create/update`) so
// the rest of the codebase can be ported incrementally with minimal churn.
// ---------------------------------------------------------------------------

const normaliseOrder = (orderField) => {
  // Base44 accepts '-created_date' for descending. Supabase stores the column
  // as `created_at`; normalise both naming styles here.
  if (!orderField) return { column: 'created_at', ascending: false };
  const ascending = !orderField.startsWith('-');
  let column = ascending ? orderField : orderField.slice(1);
  if (column === 'created_date') column = 'created_at';
  return { column, ascending };
};

// Adds Base44-style aliases (`created_date`, `updated_date`) on every row so
// existing UI that reads `row.created_date` keeps working without edits.
const withAliases = (row) => {
  if (!row || typeof row !== 'object') return row;
  return {
    ...row,
    created_date: row.created_at ?? row.created_date,
    updated_date: row.updated_at ?? row.updated_date,
  };
};
const mapRows = (data) => (Array.isArray(data) ? data.map(withAliases) : withAliases(data));

const makeEntity = (table) => ({
  async list(order = '-created_at', limit = 50) {
    const { column, ascending } = normaliseOrder(order);
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order(column, { ascending })
      .limit(limit);
    if (error) throw error;
    return mapRows(data || []);
  },
  async get(id) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return mapRows(data);
  },
  async create(row) {
    const { data, error } = await supabase
      .from(table)
      .insert(row)
      .select()
      .single();
    if (error) throw error;
    return mapRows(data);
  },
  async update(id, patch) {
    const { data, error } = await supabase
      .from(table)
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapRows(data);
  },
  async delete(id) {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
    return { ok: true };
  },
  async filter(match, order = '-created_at', limit = 50) {
    const { column, ascending } = normaliseOrder(order);
    let q = supabase.from(table).select('*');
    for (const [k, v] of Object.entries(match || {})) q = q.eq(k, v);
    const { data, error } = await q
      .order(column, { ascending })
      .limit(limit);
    if (error) throw error;
    return mapRows(data || []);
  },
});

export const entities = {
  CommunityStory: makeEntity('community_stories'),
  N400Form: makeEntity('n400_forms'),
  Question: makeEntity('questions'),
  UserProgress: makeEntity('user_progress'),
  UserStreak: makeEntity('user_streaks'),
  Profile: makeEntity('profiles'),
};

// --- Auth helpers ------------------------------------------------------------
export const auth = {
  async me() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    if (!user) return null;
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    return { ...user, ...(profile || {}) };
  },
  async updateMe(patch) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('profiles')
      .update(patch)
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async logout(redirectTo) {
    await supabase.auth.signOut();
    if (redirectTo && typeof window !== 'undefined') {
      window.location.href = redirectTo;
    }
  },
  redirectToLogin(next) {
    if (typeof window === 'undefined') return;
    const url = new URL('/login', window.location.origin);
    if (next) url.searchParams.set('next', next);
    window.location.href = url.toString();
  },
};

// --- Server-proxy invocation -------------------------------------------------
// Anything that requires the secret key goes through the `secure-proxy`
// Edge Function. Never expose the service-role key in the bundle.
export const invokeProxy = async (action, payload = {}) => {
  const { data, error } = await supabase.functions.invoke('secure-proxy', {
    body: { action, payload },
  });
  if (error) throw error;
  return data;
};

// --- Storage upload ----------------------------------------------------------
export const uploadFile = async ({ file, bucket = 'uploads', path }) => {
  const ext = file.name?.split('.').pop() || 'bin';
  const storagePath = path || `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  return { file_url: data.publicUrl };
};
