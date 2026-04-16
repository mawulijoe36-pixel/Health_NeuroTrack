import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  console.log('[v0] Creating Supabase client with URL:', url)
  
  if (!url || !key) {
    console.error('[v0] Missing Supabase credentials:', { url: !!url, key: !!key })
  }
  
  return createBrowserClient<Database>(url, key)
}
