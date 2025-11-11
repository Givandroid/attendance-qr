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
  X,
  AlertTriangle,
} from 'lucide-react'

function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  type = 'danger' 
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning'
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
          type === 'danger' ? 'bg-red-100' : 'bg-yellow-100'
        }`}>
          <AlertTriangle className={`w-6 h-6 ${
            type === 'danger' ? 'text-red-600' : 'text-yellow-600'
          }`} />
        </div>

        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
          {title}
        </h3>

        <p className="text-gray-600 text-center mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:scale-105 rounded-xl transition-all duration-300"
          >
            {cancelText}
          </Button>
          <Button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`flex-1 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ${
              type === 'danger'
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20 hover:shadow-red-500/30'
                : 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-yellow-500/20 hover:shadow-yellow-500/30'
            }`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
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
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'closed'>('all')
  const [filterType, setFilterType] = useState<'all' | 'employee' | 'external'>('all')

  const [logoutModal, setLogoutModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; sessionId: string; sessionTitle: string }>({
    isOpen: false,
    sessionId: '',
    sessionTitle: ''
  })

  useEffect(() => {
    fetchSessions()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [sessions, searchQuery, filterStatus, filterType])

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          attendances:attendances(count),
          employee_attendances:employee_attendances(count)
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

    if (searchQuery) {
      filtered = filtered.filter(session => 
        session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.location?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (filterStatus === 'active') {
      filtered = filtered.filter(session => session.is_active)
    } else if (filterStatus === 'closed') {
      filtered = filtered.filter(session => !session.is_active)
    }

    if (filterType === 'employee') {
      filtered = filtered.filter(session => session.session_type === 'employee')
    } else if (filterType === 'external') {
      filtered = filtered.filter(session => session.session_type === 'external')
    }

    setFilteredSessions(filtered)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setFilterStatus('all')
    setFilterType('all')
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  const handleDeleteSession = async (sessionId: string, sessionType: string) => {
    setDeleting(sessionId)
    try {
      const attendanceTable = sessionType === 'employee' ? 'employee_attendances' : 'attendances'
      
      const { error: attendanceError } = await supabase
        .from(attendanceTable)
        .delete()
        .eq('session_id', sessionId)

      if (attendanceError) throw attendanceError

      const { error: sessionError } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId)

      if (sessionError) throw sessionError

      await fetchSessions()
    } catch (error) {
      console.error('Error deleting session:', error)
      alert('❌ Gagal menghapus sesi')
    } finally {
      setDeleting(null)
    }
  }

  const getAttendanceCount = (session: any) => {
    if (session.session_type === 'employee') {
      return session.employee_attendances?.[0]?.count || 0
    }
    return session.attendances?.[0]?.count || 0
  }

  const totalAttendances = sessions.reduce((acc, s: any) => acc + getAttendanceCount(s), 0)
  const activeSessions = sessions.filter((s) => s.is_active).length

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
      <ConfirmModal
        isOpen={logoutModal}
        onClose={() => setLogoutModal(false)}
        onConfirm={handleLogout}
        title="Konfirmasi Logout"
        message="Apakah Anda yakin ingin keluar dari dashboard admin?"
        confirmText="Ya, Logout"
        cancelText="Batal"
        type="warning"
      />

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, sessionId: '', sessionTitle: '' })}
        onConfirm={() => {
          const session = sessions.find(s => s.id === deleteModal.sessionId)
          if (session) {
            handleDeleteSession(deleteModal.sessionId, session.session_type || 'external')
          }
        }}
        title="Hapus Sesi Rapat"
        message={`Yakin ingin menghapus sesi "${deleteModal.sessionTitle}"? Semua data absensi akan ikut terhapus dan tidak dapat dikembalikan.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="danger"
      />

      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-white/80 safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">Admin Dashboard</h1>
                <p className="text-xs sm:text-sm text-gray-500 truncate hidden sm:block">Kelola sesi rapat Anda</p>
              </div>
            </div>

            <Button
              onClick={() => setLogoutModal(true)}
              variant="outline"
              size="sm"
              className="border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:scale-105 rounded-xl transition-all duration-300 flex-shrink-0 h-10"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-safe">
        {/* Stats Cards - 3 Cards Only */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="p-5 sm:p-6 border border-gray-200 hover:border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 rounded-2xl group cursor-pointer">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Total Sesi</p>
                <p className="text-3xl sm:text-4xl font-bold text-gray-900">{sessions.length}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 group-hover:text-white transition-colors" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
              <span className="text-gray-600">Semua rapat</span>
            </div>
          </Card>

          <Card className="p-5 sm:p-6 border border-gray-200 hover:border-green-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 rounded-2xl group cursor-pointer">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Sesi Aktif</p>
                <p className="text-3xl sm:text-4xl font-bold text-gray-900">{activeSessions}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-600 group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 group-hover:text-white transition-colors" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-gray-600">Sedang berlangsung</span>
            </div>
          </Card>

          <Card className="p-5 sm:p-6 border border-gray-200 hover:border-purple-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 rounded-2xl group cursor-pointer">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Total Peserta</p>
                <p className="text-3xl sm:text-4xl font-bold text-gray-900">{totalAttendances}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-600 group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 group-hover:text-white transition-colors" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
              <span className="text-gray-600">Total kehadiran</span>
            </div>
          </Card>
        </div>

        <div className="mb-4 sm:mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Daftar Sesi Rapat</h2>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                {filteredSessions.length} dari {sessions.length} sesi
              </p>
            </div>
            <Button
              onClick={() => router.push('/admin/sessions/create')}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300 w-full sm:w-auto h-11"
            >
              <Plus className="w-5 h-5 mr-2" />
              Buat Sesi Baru
            </Button>
          </div>

          <Card className="p-3 sm:p-4 border border-gray-200 rounded-xl">
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <Input
                  placeholder="Cari sesi rapat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 sm:pl-10 border-2 border-gray-200 rounded-xl h-10 sm:h-11 text-sm sm:text-base"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                <Button
                  onClick={() => setFilterStatus('all')}
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  className={`${
                    filterStatus === 'all'
                      ? 'border-2 border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 shadow-lg shadow-blue-500/20'
                      : 'border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300'
                  } rounded-xl hover:scale-105 transition-all duration-300 flex-shrink-0 min-w-[85px] h-9 whitespace-nowrap`}
                >
                  <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                  Semua
                </Button>
                <Button
                  onClick={() => setFilterStatus('active')}
                  variant={filterStatus === 'active' ? 'default' : 'outline'}
                  size="sm"
                  className={`${
                    filterStatus === 'active'
                      ? 'border-2 border-green-600 bg-green-600 text-white hover:bg-green-700 hover:border-green-700 shadow-lg shadow-green-500/20'
                      : 'border-2 border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300'
                  } rounded-xl hover:scale-105 transition-all duration-300 flex-shrink-0 min-w-[85px] h-9 whitespace-nowrap`}
                >
                  Aktif
                </Button>
                <Button
                  onClick={() => setFilterStatus('closed')}
                  variant={filterStatus === 'closed' ? 'default' : 'outline'}
                  size="sm"
                  className={`${
                    filterStatus === 'closed'
                      ? 'border-2 border-red-600 bg-red-600 text-white hover:bg-red-700 hover:border-red-700 shadow-lg shadow-red-500/20'
                      : 'border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300'
                  } rounded-xl hover:scale-105 transition-all duration-300 flex-shrink-0 min-w-[85px] h-9 whitespace-nowrap`}
                >
                  Ditutup
                </Button>
                
                <div className="w-px h-8 bg-gray-200 mx-1 flex-shrink-0" />
                
                <Button
                  onClick={() => setFilterType('employee')}
                  variant={filterType === 'employee' ? 'default' : 'outline'}
                  size="sm"
                  className={`${
                    filterType === 'employee'
                      ? 'border-2 border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 shadow-lg shadow-blue-500/20'
                      : 'border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300'
                  } rounded-xl hover:scale-105 transition-all duration-300 flex-shrink-0 min-w-[100px] h-9 whitespace-nowrap`}
                >
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                  Internal
                </Button>
                <Button
                  onClick={() => setFilterType('external')}
                  variant={filterType === 'external' ? 'default' : 'outline'}
                  size="sm"
                  className={`${
                    filterType === 'external'
                      ? 'border-2 border-amber-600 bg-amber-600 text-white hover:bg-amber-700 hover:border-amber-700 shadow-lg shadow-amber-500/20'
                      : 'border-2 border-amber-200 text-amber-600 hover:bg-amber-50 hover:border-amber-300'
                  } rounded-xl hover:scale-105 transition-all duration-300 flex-shrink-0 min-w-[110px] h-9 whitespace-nowrap`}
                >
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                  Eksternal
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="min-h-[400px]">
          {filteredSessions.length === 0 ? (
            <Card className="p-8 sm:p-16 text-center border-2 border-dashed border-gray-200 rounded-2xl">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                {sessions.length === 0 ? (
                  <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                ) : (
                  <Search className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                )}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                {sessions.length === 0 ? 'Belum ada sesi rapat' : 'Tidak ada hasil'}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto">
                {sessions.length === 0
                  ? 'Mulai dengan membuat sesi rapat pertama Anda dan kelola absensi dengan mudah'
                  : 'Coba ubah kata kunci pencarian atau filter yang digunakan'}
              </p>
              {sessions.length === 0 ? (
                <Button
                  onClick={() => router.push('/admin/sessions/create')}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:scale-105 transition-all duration-300 w-full sm:w-auto h-11"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Buat Sesi Pertama
                </Button>
              ) : (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="border-2 border-gray-200 hover:bg-gray-50 hover:scale-105 rounded-xl transition-all duration-300 w-full sm:w-auto h-11"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session: any) => {
                const isEmployee = session.session_type === 'employee'
                const hoverColor = isEmployee ? 'blue' : 'amber'
                
                return (
                  <Card
                    key={session.id}
                    className={`p-4 sm:p-6 border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 rounded-2xl group ${
                      isEmployee ? 'hover:border-blue-300' : 'hover:border-amber-300'
                    }`}
                  >
                    {/* Desktop Layout */}
                    <div className="hidden sm:flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                            isEmployee 
                              ? 'bg-blue-50 group-hover:bg-blue-100' 
                              : 'bg-amber-50 group-hover:bg-amber-100'
                          }`}>
                            {isEmployee ? (
                              <Calendar className="w-6 h-6 text-blue-600" />
                            ) : (
                              <Calendar className="w-6 h-6 text-amber-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className={`text-xl font-bold text-gray-900 transition-colors ${
                                isEmployee ? 'group-hover:text-blue-600' : 'group-hover:text-amber-600'
                              }`}>
                                {session.title}
                              </h3>
                              <Badge
                                className={`${
                                  isEmployee
                                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                                    : 'bg-amber-100 text-amber-700 border-amber-200'
                                } border px-3 py-1 rounded-lg font-medium`}
                              >
                                {isEmployee ? 'INTERNAL' : 'EKSTERNAL'}
                              </Badge>
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
                                  {new Date(session.session_date).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                               <Clock className="w-4 h-4 text-gray-400" />
                                <span>
                                  {session.start_time.slice(0, 5)}
                                  {session.end_time ? ` - ${session.end_time.slice(0, 5)}` : ' - Selesai'}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span className="font-medium text-gray-900">
                                  {getAttendanceCount(session)} peserta
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => router.push(`/admin/sessions/${session.id}`)}
                          className={`${
                            isEmployee
                              ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 hover:shadow-blue-500/30'
                              : 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20 hover:shadow-amber-500/30'
                          } text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300`}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Monitor
                        </Button>
                        <Button
                          onClick={() => setDeleteModal({ 
                            isOpen: true, 
                            sessionId: session.id, 
                            sessionTitle: session.title 
                          })}
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

                    {/* Mobile Layout */}
                    <div className="sm:hidden flex flex-col gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                          isEmployee 
                            ? 'bg-blue-50 group-hover:bg-blue-100' 
                            : 'bg-amber-50 group-hover:bg-amber-100'
                        }`}>
                          {isEmployee ? (
                            <Calendar className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Calendar className="w-5 h-5 text-amber-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-2">
                            <h3 className={`text-base font-bold text-gray-900 transition-colors break-words flex-1 ${
                              isEmployee ? 'group-hover:text-blue-600' : 'group-hover:text-amber-600'
                            }`}>
                              {session.title}
                            </h3>
                          </div>
                          
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            <Badge
                              className={`${
                                isEmployee
                                  ? 'bg-blue-100 text-blue-700 border-blue-200'
                                  : 'bg-amber-100 text-amber-700 border-amber-200'
                              } border px-2 py-0.5 rounded-lg font-medium text-xs whitespace-nowrap`}
                            >
                              {isEmployee ? 'INTERNAL' : 'EKSTERNAL'}
                            </Badge>
                            <Badge
                              className={`${
                                session.is_active
                                  ? 'bg-green-100 text-green-700 border-green-200'
                                  : 'bg-red-100 text-red-700 border-red-200'
                              } border px-2 py-0.5 rounded-lg font-medium text-xs whitespace-nowrap`}
                            >
                              {session.is_active ? 'Aktif' : 'Ditutup'}
                            </Badge>
                          </div>

                          {session.description && (
                            <p className="text-sm text-gray-600 mb-3 leading-relaxed break-words line-clamp-2">
                              {session.description}
                            </p>
                          )}

                          <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
                            {session.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                <span className="truncate">{session.location}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              <span className="truncate">
                                {new Date(session.session_date).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              <span className="truncate">
                                {session.start_time.slice(0, 5)}
                                {session.end_time ? ` - ${session.end_time.slice(0, 5)}` : ' - Selesai'}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Users className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              <span className="font-medium text-gray-900">
                                {getAttendanceCount(session)} peserta
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-gray-100">
                        <Button
                          onClick={() => router.push(`/admin/sessions/${session.id}`)}
                          className={`${
                            isEmployee
                              ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 hover:shadow-blue-500/30'
                              : 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20 hover:shadow-amber-500/30'
                          } text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex-1 text-sm h-10`}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Monitor
                        </Button>
                        <Button
                          onClick={() => setDeleteModal({ 
                            isOpen: true, 
                            sessionId: session.id, 
                            sessionTitle: session.title 
                          })}
                          disabled={deleting === session.id}
                          variant="outline"
                          className="border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 px-3 h-10"
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
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}