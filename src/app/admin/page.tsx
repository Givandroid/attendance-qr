'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Session } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Calendar,
  MapPin,
  Users,
  Eye,
  Clock,
  LogOut,
  LayoutDashboard,
  TrendingUp,
  Trash2,
  Search,
  Filter,
  X
} from 'lucide-react'

export default function AdminDashboard() {
  // Force scrollbar to always show
  useEffect(() => {
    document.documentElement.style.overflowY = 'scroll'
    return () => {
      document.documentElement.style.overflowY = ''
    }
  }, [])
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'closed'>('all')

  useEffect(() => {
    fetchSessions()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [sessions, searchQuery, filterStatus])

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          attendances:attendances(count)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSessions(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...sessions]

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(session => 
        session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.location?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by status
    if (filterStatus === 'active') {
      filtered = filtered.filter(session => session.is_active)
    } else if (filterStatus === 'closed') {
      filtered = filtered.filter(session => !session.is_active)
    }

    setFilteredSessions(filtered)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setFilterStatus('all')
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  const handleDeleteSession = async (sessionId: string, sessionTitle: string) => {
    const confirmed = confirm(
      `Yakin ingin menghapus sesi "${sessionTitle}"?\n\nSemua data absensi akan ikut terhapus dan tidak dapat dikembalikan.`
    )

    if (!confirmed) return

    setDeleting(sessionId)
    try {
      const { error: attendanceError } = await supabase
        .from('attendances')
        .delete()
        .eq('session_id', sessionId)

      if (attendanceError) throw attendanceError

      const { error: sessionError } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId)

      if (sessionError) throw sessionError

      alert('✅ Sesi berhasil dihapus!')
      await fetchSessions()
    } catch (error) {
      console.error('Error deleting session:', error)
      alert('❌ Gagal menghapus sesi')
    } finally {
      setDeleting(null)
    }
  }

  const totalAttendances = sessions.reduce(
    (acc, s: any) => acc + (s.attendances?.[0]?.count || 0),
    0
  )
  const activeSessions = sessions.filter((s) => s.is_active).length

  const hasActiveFilters = searchQuery !== '' || filterStatus !== 'all'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-white/80">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Kelola sesi rapat Anda</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300 rounded-lg transition-all duration-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 border border-gray-200 hover:border-blue-200 hover:shadow-xl transition-all duration-500 rounded-2xl group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Sesi</p>
                <p className="text-4xl font-bold text-gray-900">{sessions.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-300">
                <Calendar className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-gray-600">Semua rapat</span>
            </div>
          </Card>

          <Card className="p-6 border border-gray-200 hover:border-green-200 hover:shadow-xl transition-all duration-500 rounded-2xl group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Sesi Aktif</p>
                <p className="text-4xl font-bold text-gray-900">{activeSessions}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-600 group-hover:scale-110 transition-all duration-300">
                <Clock className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-gray-600">Sedang berlangsung</span>
            </div>
          </Card>

          <Card className="p-6 border border-gray-200 hover:border-purple-200 hover:shadow-xl transition-all duration-500 rounded-2xl group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Peserta</p>
                <p className="text-4xl font-bold text-gray-900">{totalAttendances}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-600 group-hover:scale-110 transition-all duration-300">
                <Users className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-gray-600">Total kehadiran</span>
            </div>
          </Card>
        </div>

        {/* Header Section with Search & Filter */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Daftar Sesi Rapat</h2>
              <p className="text-gray-600 mt-1">
                {filteredSessions.length} dari {sessions.length} sesi
              </p>
            </div>
            <Button
              onClick={() => router.push('/admin/sessions/create')}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300"
            >
              <Plus className="w-5 h-5 mr-2" />
              Buat Sesi Baru
            </Button>
          </div>

          {/* Search & Filter Bar */}
          <Card className="p-4 border border-gray-200 rounded-xl">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Cari berdasarkan judul, deskripsi, atau lokasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-2 border-gray-200 rounded-xl h-11"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setFilterStatus('all')}
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  className={`${
                    filterStatus === 'all'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'border-2 border-gray-200 text-gray-700 hover:bg-gray-50'
                  } rounded-xl transition-all duration-300 w-[100px] justify-center`}
                >
                  <Filter className="w-4 h-4 mr-2 flex-shrink-0" />
                  Semua
                </Button>
                <Button
                  onClick={() => setFilterStatus('active')}
                  variant={filterStatus === 'active' ? 'default' : 'outline'}
                  className={`${
                    filterStatus === 'active'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'border-2 border-gray-200 text-gray-700 hover:bg-gray-50'
                  } rounded-xl transition-all duration-300 w-[100px] justify-center`}
                >
                  Aktif
                </Button>
                <Button
                  onClick={() => setFilterStatus('closed')}
                  variant={filterStatus === 'closed' ? 'default' : 'outline'}
                  className={`${
                    filterStatus === 'closed'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'border-2 border-gray-200 text-gray-700 hover:bg-gray-50'
                  } rounded-xl transition-all duration-300 w-[100px] justify-center`}
                >
                  Ditutup
                </Button>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl transition-all duration-300"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Sessions List */}
        <div className="min-h-[400px]">
          {filteredSessions.length === 0 ? (
            <Card className="p-16 text-center border-2 border-dashed border-gray-200 rounded-2xl">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                {sessions.length === 0 ? (
                  <Calendar className="w-10 h-10 text-gray-400" />
                ) : (
                  <Search className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {sessions.length === 0 ? 'Belum ada sesi rapat' : 'Tidak ada hasil'}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {sessions.length === 0
                  ? 'Mulai dengan membuat sesi rapat pertama Anda dan kelola absensi dengan mudah'
                  : 'Coba ubah kata kunci pencarian atau filter yang digunakan'}
              </p>
              {sessions.length === 0 ? (
                <Button
                  onClick={() => router.push('/admin/sessions/create')}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Buat Sesi Pertama
                </Button>
              ) : (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="border-2 border-gray-200 hover:bg-gray-50 rounded-xl"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session: any) => (
                <Card
                  key={session.id}
                  className="p-6 border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-500 rounded-2xl group"
                >
                  <div className="flex items-start justify-between gap-6">
                    {/* Left Content */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                          <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {session.title}
                            </h3>
                            <Badge
                              className={`${
                                session.is_active
                                  ? 'bg-green-100 text-green-700 border-green-200'
                                  : 'bg-red-100 text-red-700 border-red-200'
                              } border px-3 py-1 rounded-lg font-medium`}
                            >
                              {session.is_active ? 'Aktif' : 'Ditutup'}
                            </Badge>
                          </div>

                          {session.description && (
                            <p className="text-gray-600 mb-4 leading-relaxed">
                              {session.description}
                            </p>
                          )}

                          {/* Meta Info */}
                          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                            {session.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span>{session.location}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span>
                                {new Date(session.start_time).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-gray-900">
                                {session.attendances?.[0]?.count || 0} peserta
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => router.push(`/admin/sessions/${session.id}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl hover:scale-105 transition-all duration-300"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Monitor
                      </Button>
                      <Button
                        onClick={() => handleDeleteSession(session.id, session.title)}
                        disabled={deleting === session.id}
                        variant="outline"
                        className="border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {deleting === session.id ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}