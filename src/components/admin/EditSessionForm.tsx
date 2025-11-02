'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ChevronDownIcon, MapPin, Save, CalendarCheck, Type, FileEdit } from 'lucide-react'
import { Session } from '@/types'
import { format, parse } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

interface EditSessionFormProps {
  session: Session
  onSuccess?: () => void
  onCancel?: () => void
}

export default function EditSessionForm({ session, onSuccess, onCancel }: EditSessionFormProps) {
  const [loading, setLoading] = useState(false)
  const [startDateOpen, setStartDateOpen] = useState(false)
  const [endDateOpen, setEndDateOpen] = useState(false)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    start_time: '',
    end_time: ''
  })

  useEffect(() => {
    // Parse session data
    setForm({
      title: session.title,
      description: session.description || '',
      location: session.location || '',
      start_time: session.start_time,
      end_time: session.end_time || ''
    })

    // Parse date
    if (session.session_date) {
      try {
        const parsedDate = parse(session.session_date, 'yyyy-MM-dd', new Date())
        setStartDate(parsedDate)
        setEndDate(parsedDate)
      } catch (error) {
        console.error('Error parsing date:', error)
      }
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('sessions')
        .update({
          title: form.title,
          description: form.description,
          location: form.location,
          session_date: startDate ? format(startDate, 'yyyy-MM-dd') : session.session_date,
          start_time: form.start_time,
          end_time: form.end_time || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.id)

      if (error) throw error
      
      alert('✅ Sesi berhasil diupdate!')
      onSuccess?.()
    } catch (error) {
      alert('❌ Gagal mengupdate sesi')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-4 sm:p-8 border border-slate-200 rounded-2xl bg-white shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-start gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-200">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
            <CalendarCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">Edit Sesi Rapat</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">Update informasi sesi rapat</p>
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

        {/* Waktu Mulai - BLUE */}
        <div className="space-y-3 sm:space-y-4 p-4 sm:p-5 rounded-xl bg-blue-50 border-2 border-blue-200">
          <Label className="text-sm sm:text-base text-blue-900 font-medium flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            Waktu Mulai
            <span className="text-red-500 ml-1">*</span>
          </Label>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Date Picker */}
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
                      {startDate ? format(startDate, 'dd MMM yyyy', { locale: localeId }) : "Pilih tanggal"}
                    </span>
                    <ChevronDownIcon className="w-4 h-4 text-blue-600" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0 bg-white border-blue-200 shadow-lg" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      setStartDate(date)
                      setStartDateOpen(false)
                    }}
                    locale={localeId}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    fromYear={2024}
                    toYear={2030}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Picker - Blue Section */}
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
                className="w-full h-10 sm:h-11 text-xs sm:text-base bg-white border-2 border-blue-300 hover:border-blue-400 hover:bg-blue-50/70 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg transition-all px-3 [color-scheme:light]"
                style={{ color: '#1e3a8a' }}
              />
            </div>
          </div>
        </div>

        {/* Waktu Selesai - RED */}
        <div className="space-y-3 sm:space-y-4 p-4 sm:p-5 rounded-xl bg-red-50 border-2 border-red-200">
          <Label className="text-sm sm:text-base text-red-900 font-medium flex items-center gap-2">
            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
            Waktu Selesai
            <span className="text-red-500">*</span>
          </Label>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Date Picker */}
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
                      {endDate ? format(endDate, 'dd MMM yyyy', { locale: localeId }) : "Pilih tanggal"}
                    </span>
                    <ChevronDownIcon className="w-4 h-4 text-red-600" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0 bg-white border-red-200 shadow-lg" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      setEndDate(date)
                      setEndDateOpen(false)
                    }}
                    locale={localeId}
                    disabled={(date) => {
                      const today = new Date(new Date().setHours(0, 0, 0, 0))
                      if (date < today) return true
                      if (startDate && date < startDate) return true
                      return false
                    }}
                    fromYear={2024}
                    toYear={2030}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Picker - Red Section */}
            <div className="flex flex-col gap-2 sm:gap-3 flex-1">
              <Label htmlFor="end-time" className="text-xs sm:text-sm text-red-700 font-medium px-1">
                Waktu
              </Label>
              <Input
                type="time"
                id="end-time"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                className="w-full h-10 sm:h-11 text-sm sm:text-base bg-white border-2 border-red-300 hover:border-red-400 hover:bg-red-50/70 focus:border-red-500 focus:ring-red-500/20 rounded-lg transition-all px-3 [color-scheme:light]"
                style={{ color: '#7f1d1d' }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-2">
          {onCancel && (
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="flex-1 border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 rounded-xl h-11 sm:h-12 font-medium transition-all duration-300 text-sm sm:text-base"
            >
              Batal
            </Button>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white h-11 sm:h-12 rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 disabled:opacity-50 text-sm sm:text-base"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Menyimpan...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Simpan Perubahan</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}