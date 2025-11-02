'use client'

import { useRef } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RefreshCw, Check, PenTool } from 'lucide-react'

interface SignaturePadProps {
  onSave: (signature: string) => void
}

export default function SignaturePad({ onSave }: SignaturePadProps) {
  const sigRef = useRef<SignatureCanvas>(null)

  const clear = () => {
    sigRef.current?.clear()
    onSave('')
  }

  const save = () => {
    if (sigRef.current?.isEmpty()) {
      alert('Silakan tanda tangan terlebih dahulu')
      return
    }
    const dataUrl = sigRef.current?.toDataURL('image/png')
    if (dataUrl) {
      onSave(dataUrl)
      alert('✅ Tanda tangan berhasil disimpan!')
    }
  }

  return (
    <div className="space-y-3">
      <Label className="text-gray-700 font-medium flex items-center gap-2">
        <PenTool className="w-4 h-4 text-blue-600" />
        Tanda Tangan Digital *
      </Label>
      
      <Card className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 transition-colors duration-300">
        <div className="bg-white p-2">
          <SignatureCanvas
            ref={sigRef}
            canvasProps={{
              className: 'w-full h-48 cursor-crosshair bg-gray-50 rounded-lg',
            }}
            backgroundColor="#f9fafb"
            penColor="#1e293b"
          />
        </div>
      </Card>

      <div className="flex gap-3">
        <Button
          type="button"
          onClick={clear}
          variant="outline"
          className="flex-1 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-xl h-12 font-medium transition-all duration-300"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Ulangi
        </Button>
        <Button
          type="button"
          onClick={save}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 font-medium hover:scale-[1.02] transition-all duration-300"
        >
          <Check className="w-4 h-4 mr-2" />
          Simpan Tanda Tangan
        </Button>
      </div>
      
      <p className="text-xs text-gray-500 text-center">
        Gunakan mouse atau jari Anda untuk tanda tangan
      </p>
    </div>
  )
}