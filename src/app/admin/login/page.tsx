'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Shield } from 'lucide-react'

const ADMIN_PASSWORD = 'admin123' // Ganti ini!

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password === ADMIN_PASSWORD) {
      // Set cookie via API route
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      if (res.ok) {
        router.push('/admin')
      }
    } else {
      setError('Password salah!')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-[#3b82f6]" />
          </div>
          <h1 className="text-2xl font-bold text-[#0f172a] mb-2">
            Admin Access
          </h1>
          <p className="text-[#64748b]">
            Masukkan password untuk mengakses dashboard
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="password"
            placeholder="Password admin"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-[#e2e8f0]"
            autoFocus
          />
          {error && <p className="text-[#ef4444] text-sm">{error}</p>}

          <Button type="submit" className="w-full bg-[#3b82f6] hover:bg-[#2563eb]">
            Login
          </Button>
        </form>

        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="w-full mt-4 text-[#64748b]"
        >
          Kembali ke Home
        </Button>
      </Card>
    </div>
  )
}