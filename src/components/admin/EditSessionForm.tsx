'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Calendar, Clock, MapPin, FileText, Save } from 'lucide-react'
import { Session } from '@/types'

interface EditSessionFormProps {
  session: Session
  onSuccess?: () => void
  onCancel?: () => void
}

export default function EditSessionForm({ session, onSuccess, onCancel }: EditSessionFormProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: ''
  })

  useEffect(() => {
    // Parse existing session data
    const startDate = new Date(session.start_time)
    const startDateStr = startDate.toISOString().split('T')[0]
    const startTimeStr = startDate.toTimeString().slice(0, 5)

    let endDateStr = ''
    let endTimeStr = ''
    if (session.end_time) {
      const endDate = new Date(session.end_time)
      endDateStr = endDate.toISOString().split('T')[0]
      endTimeStr = endDate.toTimeString().slice(0, 5)
    }

    setForm({
      title: session.title,
      description: session.description || '',
      location: session.location || '',
      start_date: startDateStr,
      start_time: startTimeStr,
      end_date: endDateStr,
      end_time: endTimeStr
    })
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const start_time = form.start_date && form.start_time 
        ? `${form.start_date}T${form.start_time}` 
        : form.start_date

      const end_time = form.end_date && form.end_time 
        ? `${form.end_date}T${form.end_time}` 
        : form.end_date || null

      const { error } = await supabase
        .from('sessions')
        .update({
          title: form.title,
          description: form.description,
          location: form.location,
          start_time,
          end_time,
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
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="p-8 border border-gray-200 rounded-2xl bg-white hover:border-blue-200 hover:shadow-lg transition-all duration-300">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Save className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Edit Sesi Rapat</h2>
            <p className="text-gray-600">Update informasi sesi rapat</p>
          </div>
        </div>
      </Card>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Judul Rapat */}
        <Card className="p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 rounded-xl bg-white">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <Label className="text-gray-900 font-semibold text-base mb-2 block">
                Judul Rapat <span className="text-red-500">*</span>
              </Label>
              <Input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Contoh: Rapat Koordinasi Q4 2025"
                className="border-2 border-gray-200 rounded-xl h-12 px-4 text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>
        </Card>

        {/* Deskripsi */}
        <Card className="p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 rounded-xl bg-white">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <Label className="text-gray-900 font-semibold text-base mb-2 block">
                Deskripsi
              </Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Detail agenda rapat (opsional)"
                className="border-2 border-gray-200 rounded-xl min-h-28 px-4 py-3 text-gray-900 placeholder:text-gray-400 resize-none"
              />
            </div>
          </div>
        </Card>

        {/* Lokasi */}
        <Card className="p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 rounded-xl bg-white">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <Label className="text-gray-900 font-semibold text-base mb-2 block">
                Lokasi
              </Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Contoh: Ruang Meeting Lt. 3"
                className="border-2 border-gray-200 rounded-xl h-12 px-4 text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>
        </Card>

        {/* Divider */}
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gray-50 px-4 text-sm font-semibold text-gray-500">Jadwal Rapat</span>
          </div>
        </div>

        {/* Waktu Mulai */}
        <Card className="p-6 border border-blue-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 rounded-xl bg-blue-50">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <Label className="text-gray-900 font-semibold text-base">
                Waktu Mulai <span className="text-red-500">*</span>
              </Label>
              <p className="text-sm text-gray-600 mt-1">Tentukan kapan rapat akan dimulai</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-700 font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Tanggal
              </label>
              <Input
                type="date"
                required
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="border-2 border-gray-200 bg-white rounded-xl h-12 px-4 text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-700 font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Jam
              </label>
              <Input
                type="time"
                required
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                className="border-2 border-gray-200 bg-white rounded-xl h-12 px-4 text-gray-900"
              />
            </div>
          </div>
        </Card>

        {/* Waktu Selesai */}
        <Card className="p-6 border-2 border-dashed border-gray-300 hover:border-blue-300 hover:shadow-lg transition-all duration-300 rounded-xl bg-white">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <Label className="text-gray-900 font-semibold text-base">
                Waktu Selesai <span className="text-gray-400 font-normal text-sm">(Opsional)</span>
              </Label>
              <p className="text-sm text-gray-600 mt-1">Estimasi waktu berakhir rapat</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-700 font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                Tanggal
              </label>
              <Input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="border-2 border-gray-200 bg-white rounded-xl h-12 px-4 text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-700 font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                Jam
              </label>
              <Input
                type="time"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                className="border-2 border-gray-200 bg-white rounded-xl h-12 px-4 text-gray-900"
              />
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          {onCancel && (
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="flex-1 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-xl h-14 text-base font-semibold transition-all duration-300"
            >
              Batal
            </Button>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-xl text-base font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Menyimpan...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="w-5 h-5" />
                <span>Simpan Perubahan</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}