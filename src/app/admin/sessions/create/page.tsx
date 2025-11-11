'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SessionTypeModal from '@/components/shared/SessionTypeModal'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CreateSessionPage() {
  const router = useRouter()
  const [showModal, setShowModal] = useState(true)

  const handleSelectType = (type: 'employee' | 'external') => {
    setShowModal(false)
    
    if (type === 'employee') {
      // Redirect ke employee session create page
      router.push('/admin/sessions/employee/create')
    } else {
      // Redirect ke external session create page 
      router.push('/admin/sessions/external/create')
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    // Kembali ke dashboard jika user close modal
    router.push('/admin')
  }

  return (
    <>
      <SessionTypeModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSelectType={handleSelectType}
      />

      {/* Empty container - modal will handle everything */}
      <div className="min-h-screen bg-gray-50" />
    </>
  )
}