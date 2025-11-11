import { X, ArrowRight, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SessionTypeModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectType: (type: 'employee' | 'external') => void
}

export default function SessionTypeModal({ 
  isOpen, 
  onClose, 
  onSelectType 
}: SessionTypeModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full p-4 sm:p-6 md:p-8 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-110 z-10"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
        </button>

        {/* Header */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8 pr-8 sm:pr-10">
          <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 md:mb-3">
            Pilih Jenis Sesi Rapat
          </h2>
          <p className="text-xs sm:text-sm md:text-lg text-gray-600">
            Pilih jenis sesi sesuai dengan peserta rapat Anda
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          {/* Employee Session */}
          <button
            onClick={() => onSelectType('employee')}
            className="group relative overflow-hidden rounded-xl sm:rounded-2xl border-2 border-blue-200 hover:border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 sm:p-6 md:p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1 sm:hover:-translate-y-2 text-left"
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-blue-400/10 rounded-full -mr-10 sm:-mr-12 md:-mr-16 -mt-10 sm:-mt-12 md:-mt-16 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-blue-500/10 rounded-full -ml-8 sm:-ml-10 md:-ml-12 -mb-8 sm:-mb-10 md:-mb-12 group-hover:scale-150 transition-transform duration-500" />
            
            <div className="relative">
              {/* Icon */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 md:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg shadow-blue-500/30">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
              </div>

              {/* Title */}
              <h3 className="text-base sm:text-xl md:text-2xl font-bold text-gray-900 mb-1.5 sm:mb-2 md:mb-3">
                Rapat Internal
              </h3>

              {/* Description */}
              <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-3 sm:mb-4 md:mb-6 leading-relaxed">
                Untuk rapat internal dengan pegawai. Peserta menggunakan NIP untuk absensi.
              </p>

              {/* Button */}
              <div className="flex items-center justify-between text-blue-600 font-semibold group-hover:text-blue-700 text-xs sm:text-sm md:text-base">
                <span>Pilih Sesi Ini</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-2 transition-transform duration-300 flex-shrink-0" />
              </div>
            </div>
          </button>

          {/* External Session */}
          <button
            onClick={() => onSelectType('external')}
            className="group relative overflow-hidden rounded-xl sm:rounded-2xl border-2 border-amber-200 hover:border-amber-500 bg-gradient-to-br from-amber-50 to-amber-100/50 p-4 sm:p-6 md:p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/20 hover:-translate-y-1 sm:hover:-translate-y-2 text-left"
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-amber-400/10 rounded-full -mr-10 sm:-mr-12 md:-mr-16 -mt-10 sm:-mt-12 md:-mt-16 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-amber-500/10 rounded-full -ml-8 sm:-ml-10 md:-ml-12 -mb-8 sm:-mb-10 md:-mb-12 group-hover:scale-150 transition-transform duration-500" />
            
            <div className="relative">
              {/* Icon */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 md:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg shadow-amber-500/30">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
              </div>

              {/* Title */}
              <h3 className="text-base sm:text-xl md:text-2xl font-bold text-gray-900 mb-1.5 sm:mb-2 md:mb-3">
                Rapat Eksternal
              </h3>

              {/* Description */}
              <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-3 sm:mb-4 md:mb-6 leading-relaxed">
                Untuk rapat dengan pihak eksternal atau peserta dari instansi lain.
              </p>

              {/* Button */}
              <div className="flex items-center justify-between text-amber-600 font-semibold group-hover:text-amber-700 text-xs sm:text-sm md:text-base">
                <span>Pilih Sesi Ini</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-2 transition-transform duration-300 flex-shrink-0" />
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}