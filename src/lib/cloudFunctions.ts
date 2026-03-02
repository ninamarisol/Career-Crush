import { supabase } from '@/integrations/supabase/client';

export async function getAuthedFunctionHeaders(): Promise<Record<string, string>> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message || 'Failed to read auth session');

  const accessToken = data.session?.access_token;
  if (!accessToken) throw new Error('Please log in first');

  return {
    'Content-Type': 'application/json',
    apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function invokeAuthedFunction<T = unknown>(functionName: string, body?: unknown): Promise<T> {
  const headers = await getAuthedFunctionHeaders();
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body ?? {}),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = (payload && typeof payload === 'object' && 'error' in payload
      ? String((payload as { error?: unknown }).error)
      : '') || `Function call failed (${response.status})`;
    throw new Error(message);
  }

  return payload as T;
}
