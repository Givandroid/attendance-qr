// Session Types
export type SessionType = 'external' | 'employee'

export interface Session {
  id: string
  title: string
  description?: string
  location?: string
  session_date: string     
  start_time: string        
  end_time?: string        
  qr_code: string
  is_active: boolean
  session_type: SessionType  // NEW: tipe session (default: 'external')
  created_at: string
  updated_at: string
}

// Attendance untuk Instansi Luar (existing)
export interface Attendance {
  id: string
  session_id: string
  full_name: string
  institution: string
  position: string
  phone_number: string
  signature: string
  checked_in_at: string
  created_at: string
}

// NEW: Attendance untuk Internal
export interface EmployeeAttendance {
  id: string
  session_id: string
  nip: string           // Nomor Induk Pegawai
  full_name: string
  position: string      // Jabatan
  signature: string
  checked_in_at: string
  created_at: string
}