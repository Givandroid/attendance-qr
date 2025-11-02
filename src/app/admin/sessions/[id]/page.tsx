'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Session, Attendance } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import QRCodeDisplay from '@/components/shared/QRCodeDisplay'
import { exportToPDF, exportToCSV } from '@/lib/export-utils'
import { Edit } from 'lucide-react'
import {
  ArrowLeft,
  Users,
  Download,
  FileText,
  Calendar,
  MapPin,
  Clock,
  XCircle,
  CheckCircle,
  FileSpreadsheet,
  Activity
} from 'lucide-react'

export default function SessionMonitorPage() {
  const params = useParams()
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let channel: any = null

    const init = async () => {
      // Fetch data first (parallel queries)
      await fetchSessionData()
      
      channel = supabase
        .channel('attendances-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'attendances',
            filter: `session_id=eq.${params.id}`
          },
          (payload) => {
            setAttendances(prev => [...prev, payload.new as Attendance])
          }
        )
        .subscribe()
    }

    init()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [params.id])

  const fetchSessionData = async () => {
    try {
      const [sessionResult, attendanceResult] = await Promise.all([
        supabase
          .from('sessions')
          .select('*')
          .eq('id', params.id)
          .single(),
        supabase
          .from('attendances')
          .select('*')
          .eq('session_id', params.id)
          .order('checked_in_at', { ascending: true })
      ])

      if (sessionResult.error) throw sessionResult.error
      if (attendanceResult.error) throw attendanceResult.error

      setSession(sessionResult.data)
      setAttendances(attendanceResult.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      alert('❌ Gagal memuat data sesi')
    } finally {
      setLoading(false)
    }
  }

  const toggleSessionStatus = async () => {
    if (!session) return

    const confirmed = confirm(
      session.is_active 
        ? 'Yakin ingin menutup sesi ini?' 
        : 'Yakin ingin membuka kembali sesi ini?'
    )

    if (!confirmed) return

    try {
      const { error } = await supabase
        .from('sessions')
        .update({ is_active: !session.is_active })
        .eq('id', session.id)

      if (error) throw error

      setSession({ ...session, is_active: !session.is_active })
      alert(session.is_active ? '🔴 Sesi ditutup' : '✅ Sesi dibuka kembali')
    } catch (error) {
      alert('❌ Gagal mengubah status sesi')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Memuat data sesi...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="p-12 text-center border-0 shadow-xl rounded-3xl max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Sesi tidak ditemukan</h2>
          <p className="text-gray-600 mb-6">Sesi yang Anda cari tidak ada atau telah dihapus</p>
          <Button
            onClick={() => router.push('/admin')}
            className="bg-blue-600 hover:bg-blue-700 rounded-xl"
          >
            Kembali ke Dashboard
          </Button>
        </Card>
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
              <Button
                variant="ghost"
                onClick={() => router.push('/admin')}
                className="hover:bg-gray-100 rounded-lg transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Kembali
              </Button>
              <div className="h-8 w-px bg-gray-200" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Monitor Sesi</h1>
                <p className="text-sm text-gray-500">Real-time attendance tracking</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => router.push(`/admin/sessions/${params.id}/edit`)}
                variant="outline"
                className="border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-blue-300 rounded-xl hover:scale-105 transition-all duration-300"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Sesi
              </Button>
              
              <Button
                onClick={toggleSessionStatus}
                className={`${
                  session.is_active
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white rounded-xl hover:scale-105 transition-all duration-300`}
              >
                {session.is_active ? (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Tutup Sesi
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Buka Sesi
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="space-y-6">
            {/* Session Info Card */}
            <Card className="p-6 border border-gray-200 rounded-2xl hover:border-blue-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900">Informasi Sesi</h3>
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
                </div>
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {session.title}
              </h2>

              <div className="space-y-3">
                {session.description && (
                  <div className="pb-3 border-b border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Deskripsi</p>
                    <p className="text-gray-700 leading-relaxed">{session.description}</p>
                  </div>
                )}

                {session.location && (
                  <div className="flex items-start gap-3 py-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Lokasi</p>
                      <p className="text-gray-900 font-medium">{session.location}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 py-2">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Tanggal & Waktu</p>
                    <p className="text-gray-900 font-medium">
                      {new Date(session.start_time).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {session.end_time && (
                  <div className="flex items-start gap-3 py-2">
                    <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Selesai</p>
                      <p className="text-gray-900 font-medium">
                        {new Date(session.end_time).toLocaleString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Stats Card */}
            <Card className="p-6 border border-gray-200 rounded-2xl bg-white hover:border-blue-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">Total Peserta</p>
                  <p className="text-4xl font-bold text-gray-900">{attendances.length}</p>
                </div>
              </div>
              {attendances.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                  <Activity className="w-4 h-4 text-green-600 animate-pulse" />
                  <span className="text-sm font-medium text-green-700">Real-time updates aktif</span>
                </div>
              )}
            </Card>

            {/* QR Code */}
            {session.is_active && (
              <QRCodeDisplay url={session.qr_code} title={session.title} />
            )}

            {/* Export Card */}
            <Card className="p-6 border border-gray-200 rounded-2xl hover:border-blue-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Download className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900">Export Laporan</h3>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={() => exportToPDF(session, attendances)}
                  disabled={attendances.length === 0}
                  className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
                <Button
                  onClick={() => exportToCSV(session, attendances)}
                  disabled={attendances.length === 0}
                  variant="outline"
                  className="w-full border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-green-300 rounded-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
              
              {attendances.length === 0 && (
                <p className="text-xs text-gray-500 text-center mt-3">
                  Belum ada data untuk di-export
                </p>
              )}
            </Card>
          </div>

          {/* Main Content - Attendance List */}
          <div className="lg:col-span-2">
            <Card className="p-6 border border-gray-200 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Daftar Hadir</h3>
                    <p className="text-sm text-gray-500">{attendances.length} peserta terdaftar</p>
                  </div>
                </div>
                {attendances.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-green-700">Live</span>
                  </div>
                )}
              </div>

              {attendances.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Belum ada peserta
                  </h3>
                  <p className="text-gray-600 max-w-sm mx-auto">
                    Peserta yang melakukan absensi akan muncul di sini secara real-time
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2">
                  {attendances.map((att, index) => (
                    <Card
                      key={att.id}
                      className="p-5 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 rounded-xl group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-colors">
                          <span className="font-bold text-blue-600 group-hover:text-white transition-colors">
                            {index + 1}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-lg mb-3 group-hover:text-blue-600 transition-colors">
                            {att.full_name}
                          </h4>

                          <div className="grid sm:grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500">Instansi:</span>
                              <p className="text-gray-900 font-medium">{att.institution}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Jabatan:</span>
                              <p className="text-gray-900 font-medium">{att.position}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">No. Telepon:</span>
                              <p className="text-gray-900 font-medium">{att.phone_number}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Waktu Absen:</span>
                              <p className="text-gray-900 font-medium">
                                {new Date(att.checked_in_at).toLocaleTimeString('id-ID', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>

                        {att.signature && (
                          <div className="flex-shrink-0">
                            <p className="text-xs text-gray-500 mb-2 text-center">Tanda Tangan</p>
                            <img
                              src={att.signature}
                              alt="Signature"
                              className="w-32 h-20 object-contain border-2 border-gray-200 rounded-lg bg-gray-50 hover:border-blue-300 transition-colors"
                            />
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}