'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ChevronDown, MapPin, Sparkles, Info, CalendarCheck, Type, FileEdit, AlertCircle, Users } from 'lucide-react'

// Utility functions to replace date-fns
const formatDate = (date: Date | undefined) => {
  if (!date) return '-'
  return date.toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  })
}

const formatDateForDB = (date: Date | undefined) => {
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatTime = (time: string) => {
  if (!time) return '-'
  return time
}

function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  sessionData
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  sessionData?: {
    title: string
    description: string
    location: string
    startDate?: Date
    endDate?: Date
    start_time: string
    end_time: string
  }
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-blue-100">
          <AlertCircle className="w-6 h-6 text-blue-600" />
        </div>

        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
          {title}
        </h3>

        <p className="text-gray-600 text-center mb-4 leading-relaxed">
          {message}
        </p>

        {sessionData && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3 text-sm">
            <div className="border-b border-gray-200 pb-3">
              <p className="text-xs text-gray-500 font-medium mb-1">Judul Rapat</p>
              <p className="font-semibold text-gray-900 text-base">{sessionData.title}</p>
            </div>
            
            {sessionData.description && (
              <div className="border-b border-gray-200 pb-3">
                <p className="text-xs text-gray-500 font-medium mb-1">Deskripsi</p>
                <p className="font-medium text-gray-900">{sessionData.description}</p>
              </div>
            )}
            
            <div className="border-b border-gray-200 pb-3">
              <p className="text-xs text-gray-500 font-medium mb-1">Lokasi</p>
              <p className="font-medium text-gray-900">{sessionData.location}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-blue-700 font-medium mb-1">Waktu Mulai</p>
                <p className="font-semibold text-blue-900 text-sm">{formatDate(sessionData.startDate)}</p>
                <p className="font-medium text-blue-800 text-sm">{formatTime(sessionData.start_time)}</p>
              </div>
              
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <p className="text-xs text-red-700 font-medium mb-1">Waktu Selesai</p>
                <p className="font-semibold text-red-900 text-sm">{formatDate(sessionData.endDate)}</p>
                <p className="font-medium text-red-800 text-sm">{formatTime(sessionData.end_time)}</p>
              </div>
            </div>
          </div>
        )}

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
            className="flex-1 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-white bg-blue-600 hover:bg-blue-700"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function EmployeeSessionForm({ onSuccess }: { onSuccess?: (id: string) => void }) {
  const [loading, setLoading] = useState(false)
  const [startDateOpen, setStartDateOpen] = useState(false)
  const [endDateOpen, setEndDateOpen] = useState(false)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    start_time: '',
    end_time: ''
  })

  const handleSubmitClick = () => {
    if (!form.title || !form.location || !startDate || !form.start_time) {
      alert('❌ Mohon lengkapi semua field yang wajib diisi')
      return
    }

    setShowConfirmModal(true)
  }

  const handleConfirmSubmit = async () => {
    setLoading(true)

    try {
      const tempId = crypto.randomUUID()
      const qrUrl = `${window.location.origin}/employee-attendance/${tempId}`

      const sessionPayload = {
        id: tempId,
        title: form.title,
        description: form.description,
        location: form.location,
        session_date: formatDateForDB(startDate),
        start_time: form.start_time,
        end_time: form.end_time || null,
        qr_code: qrUrl,
        is_active: true,
        session_type: 'employee'
      }

      const { data, error } = await supabase
        .from('sessions')
        .insert([sessionPayload])
        .select()
        .single()

      if (error) throw error
      
      alert('✅ Sesi Rapat Pegawai berhasil dibuat!')
      onSuccess?.(data.id)
      
      setForm({ 
        title: '', 
        description: '', 
        location: '', 
        start_time: '',
        end_time: ''
      })
      setStartDate(undefined)
      setEndDate(undefined)
    } catch (error) {
      alert('❌ Gagal membuat sesi')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
        title="Konfirmasi Pembuatan Sesi Pegawai"
        message="Pastikan semua informasi sesi sudah benar. Setelah dibuat, QR code untuk pegawai akan langsung tersedia."
        confirmText="Ya, Buat Sesi"
        cancelText="Periksa Kembali"
        sessionData={{
          title: form.title,
          description: form.description,
          location: form.location,
          startDate: startDate,
          endDate: endDate,
          start_time: form.start_time,
          end_time: form.end_time
        }}
      />

      <Card className="p-4 sm:p-8 border border-slate-200 rounded-2xl bg-white shadow-sm">
        <div className="space-y-4 sm:space-y-6">
          {/* Header with Badge */}
          <div className="flex items-start gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-200">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
              <CalendarCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">Sesi Rapat Pegawai</h2>
                <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg">
                  INTERNAL
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">Untuk rapat internal dengan pegawai</p>
            </div>
          </div>

          {/* Judul Rapat */}
          <div className="space-y-2 sm:space-y-3">
            <Label className="text-sm sm:text-base text-slate-900 font-medium flex items-center gap-2">
              <Type className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
              Judul Rapat
              <span className="text-red-500">*</span>
            </Label>
            <Input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Masukkan judul rapat"
              className="h-10 sm:h-11 text-sm sm:text-base border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg"
            />
          </div>

          {/* Deskripsi */}
          <div className="space-y-2 sm:space-y-3">
            <Label className="text-sm sm:text-base text-slate-900 font-medium flex items-center gap-2">
              <FileEdit className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
              Deskripsi
              <span className="text-slate-400 text-xs sm:text-sm font-normal">(Opsional)</span>
            </Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Tambahkan deskripsi atau agenda rapat"
              className="min-h-20 sm:min-h-24 text-sm sm:text-base border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg resize-none"
            />
          </div>

          {/* Lokasi */}
          <div className="space-y-2 sm:space-y-3">
            <Label className="text-sm sm:text-base text-slate-900 font-medium flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
              Lokasi
              <span className="text-red-500">*</span>
            </Label>
            <Input
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Masukkan lokasi rapat"
              className="h-10 sm:h-11 text-sm sm:text-base border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg"
            />
          </div>

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs sm:text-sm font-medium text-slate-500">Jadwal Rapat</span>
            </div>
          </div>

          {/* Waktu Mulai */}
          <div className="space-y-3 sm:space-y-4 p-4 sm:p-5 rounded-xl bg-blue-50 border-2 border-blue-200">
            <Label className="text-sm sm:text-base text-blue-900 font-medium flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              Waktu Mulai
              <span className="text-red-500 ml-1">*</span>
            </Label>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex flex-col gap-2 sm:gap-3 flex-1">
                <Label htmlFor="start-date" className="text-xs sm:text-sm text-blue-700 font-medium px-1">
                  Tanggal
                </Label>
                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      id="start-date"
                      className="justify-between font-normal bg-white border-2 border-blue-300 hover:border-blue-400 hover:bg-blue-50/70 h-10 sm:h-11 rounded-lg transition-all"
                    >
                      <span className={`text-sm sm:text-base ${startDate ? "text-blue-900" : "text-slate-500"}`}>
                        {startDate ? formatDate(startDate) : "Pilih tanggal"}
                      </span>
                      <ChevronDown className="w-4 h-4 text-blue-600" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto overflow-hidden p-0 bg-white border-blue-200 shadow-lg" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date)
                        setStartDateOpen(false)
                      }}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col gap-2 sm:gap-3 flex-1">
                <Label htmlFor="start-time" className="text-xs sm:text-sm text-blue-700 font-medium px-1">
                  Waktu
                </Label>
                <Input
                  type="time"
                  id="start-time"
                  required
                  value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                  className="w-full h-10 sm:h-11 text-xs sm:text-base bg-white border-2 border-blue-300 hover:border-blue-400 hover:bg-blue-50/70 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg transition-all px-3"
                  style={{ colorScheme: 'light', color: '#1e3a8a' }}
                />
              </div>
            </div>
          </div>

          {/* Waktu Selesai */}
          <div className="space-y-3 sm:space-y-4 p-4 sm:p-5 rounded-xl bg-red-50 border-2 border-red-200">
            <Label className="text-sm sm:text-base text-red-900 font-medium flex items-center gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              Waktu Selesai
              <span className="text-slate-400">(Opsional)</span>
            </Label>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex flex-col gap-2 sm:gap-3 flex-1">
                <Label htmlFor="end-date" className="text-xs sm:text-sm text-red-700 font-medium px-1">
                  Tanggal
                </Label>
                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      id="end-date"
                      className="justify-between font-normal bg-white border-2 border-red-300 hover:border-red-400 hover:bg-red-50/70 h-10 sm:h-11 rounded-lg transition-all"
                    >
                      <span className={`text-sm sm:text-base ${endDate ? "text-red-900" : "text-slate-500"}`}>
                        {endDate ? formatDate(endDate) : "Pilih tanggal"}
                      </span>
                      <ChevronDown className="w-4 h-4 text-red-600" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto overflow-hidden p-0 bg-white border-red-200 shadow-lg" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        setEndDate(date)
                        setEndDateOpen(false)
                      }}
                      disabled={(date) => {
                        const today = new Date(new Date().setHours(0, 0, 0, 0))
                        if (date < today) return true
                        if (startDate && date < startDate) return true
                        return false
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col gap-2 sm:gap-3 flex-1">
                <Label htmlFor="end-time" className="text-xs sm:text-sm text-red-700 font-medium px-1">
                  Waktu
                </Label>
                <Input
                  type="time"
                  id="end-time"
                  value={form.end_time}
                  onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                  className="w-full h-10 sm:h-11 text-sm sm:text-base bg-white border-2 border-red-300 hover:border-red-400 hover:bg-red-50/70 focus:border-red-500 focus:ring-red-500/20 rounded-lg transition-all px-3"
                  style={{ colorScheme: 'light', color: '#7f1d1d' }}
                />
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="flex gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-500 flex-shrink-0">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-medium text-emerald-900 mb-0.5 sm:mb-1">
                QR Code Otomatis
              </p>
              <p className="text-xs sm:text-sm text-emerald-700">
                Setelah sesi dibuat, QR code akan langsung tersedia dan siap dibagikan kepada peserta
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmitClick}
            disabled={loading}
            className="w-full h-11 sm:h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 disabled:opacity-50 text-sm sm:text-base"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Membuat sesi...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>Buat Sesi Pegawai & Generate QR</span>
              </div>
            )}
          </Button>
        </div>
      </Card>
    </>
  )
}