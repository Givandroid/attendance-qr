import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Session, Attendance } from '@/types'

export const exportToPDF = (session: Session, attendances: Attendance[]) => {
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Laporan Absensi Rapat', 14, 20)
  
  // Session Info
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Judul: ${session.title}`, 14, 30)
  
  if (session.description) {
    doc.text(`Deskripsi: ${session.description}`, 14, 37)
  }
  
  if (session.location) {
    doc.text(`Lokasi: ${session.location}`, 14, 44)
  }
  
  const startDate = new Date(session.start_time).toLocaleString('id-ID')
  doc.text(`Waktu: ${startDate}`, 14, 51)
  
  doc.text(`Total Peserta: ${attendances.length} orang`, 14, 58)
  
  // Table
  const tableData = attendances.map((att, index) => [
    index + 1,
    att.full_name,
    att.institution,
    att.position,
    att.phone_number,
    new Date(att.checked_in_at).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  ])
  
  autoTable(doc, {
    startY: 65,
    head: [['No', 'Nama', 'Instansi', 'Jabatan', 'No. Telp', 'Waktu Absen']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246], // #3b82f6
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 40 },
      2: { cellWidth: 40 },
      3: { cellWidth: 35 },
      4: { cellWidth: 30 },
      5: { cellWidth: 25, halign: 'center' }
    }
  })
  
  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(100)
    doc.text(
      `Halaman ${i} dari ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    )
  }
  
  // Download
  const fileName = `Absensi_${session.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}

export const exportToCSV = (session: Session, attendances: Attendance[]) => {
  const headers = ['No', 'Nama Lengkap', 'Instansi', 'Jabatan', 'No. Telepon', 'Waktu Absen']
  
  const rows = attendances.map((att, index) => [
    index + 1,
    att.full_name,
    att.institution,
    att.position,
    att.phone_number,
    new Date(att.checked_in_at).toLocaleString('id-ID')
  ])
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')
  
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `Absensi_${session.title.replace(/\s+/g, '_')}.csv`)
  link.click()
}