export interface Session {
  id: string
  title: string
  description?: string
  location?: string
  start_time: string
  end_time?: string
  qr_code: string
  is_active: boolean
  created_at: string
  updated_at: string
}

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