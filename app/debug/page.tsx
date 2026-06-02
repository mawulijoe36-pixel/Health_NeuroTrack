'use client'

export default function DebugPage() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Debug Info</h1>
      
      <div className="space-y-4 bg-muted p-4 rounded-lg font-mono text-sm">
        <div>
          <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>
          <p className="text-muted-foreground">{process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
        </div>
        
        <div>
          <strong>Current Origin:</strong>
          <p className="text-muted-foreground">{typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
        </div>
        
        <div>
          <strong>Expected Redirect URL:</strong>
          <p className="text-muted-foreground">
            {typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : 'N/A'}
          </p>
        </div>

        <div>
          <strong>Should be:</strong>
          <p className="text-success">https://cokourhksfqkwtszstsh.supabase.co/auth/v1/callback</p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-warning/10 border border-warning rounded-lg">
        <p className="text-sm">
          If NEXT_PUBLIC_SUPABASE_URL contains "v0.app" or "vercel.com", the env vars are wrong in your Vercel deployment.
        </p>
      </div>
    </div>
  )
}
