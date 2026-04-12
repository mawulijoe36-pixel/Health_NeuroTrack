import { AuthProvider } from '@/hooks/use-auth'
import { AppLayout } from '@/components/app-layout'
import { Providers } from '@/components/providers'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <AuthProvider>
        <AppLayout>{children}</AppLayout>
      </AuthProvider>
    </Providers>
  )
}
