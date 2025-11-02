'use client'

import { useRef } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RefreshCw, PenTool } from 'lucide-react'

interface SignaturePadProps {
  onSave: (signature: string) => void
}

export default function SignaturePad({ onSave }: SignaturePadProps) {
  const sigRef = useRef<SignatureCanvas>(null)

  const handleEnd = () => {
    if (!sigRef.current?.isEmpty()) {
      const dataUrl = sigRef.current?.toDataURL('image/png')
      if (dataUrl) {
        onSave(dataUrl)
      }
    }
  }

  const clear = () => {
    sigRef.current?.clear()
    onSave('')
  }

  return (
    <div className="space-y-3">
      <Label className="text-gray-700 font-medium flex items-center gap-2">
        <PenTool className="w-4 h-4 text-blue-600" />
        Tanda Tangan Digital <span className="text-red-600">*</span>
      </Label>
      
      <Card className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 transition-colors duration-300">
        <div className="bg-white p-2">
          <SignatureCanvas
            ref={sigRef}
            onEnd={handleEnd}
            canvasProps={{
              className: 'w-full h-48 cursor-crosshair bg-gray-50 rounded-lg',
            }}
            backgroundColor="#f9fafb"
            penColor="#1e293b"
          />
        </div>
      </Card>

      <Button
        type="button"
        onClick={clear}
        variant="outline"
        className="w-full border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-xl h-12 font-medium transition-all duration-300"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Ulangi Tanda Tangan
      </Button>
      
      <p className="text-xs text-gray-500 text-center">
        Gunakan mouse atau jari Anda untuk tanda tangan. Tanda tangan akan tersimpan otomatis.
      </p>
    </div>
  )
}