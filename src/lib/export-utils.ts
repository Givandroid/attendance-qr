import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Session, Attendance } from '@/types'

export const exportToPDF = (session: Session, attendances: Attendance[]) => {
  const doc = new jsPDF()
  
  // Fungsi untuk menambahkan kop surat (hanya halaman pertama)
  const addLetterhead = () => {
    // Logo placeholder (koordinat untuk logo di kiri)
    // Jika ada logo, bisa ditambahkan dengan doc.addImage()
    
    // Header text
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    
    // Bagian atas - Nama Kementerian
    doc.text('KEMENTERIAN IMIGRASI DAN PEMASYARAKATAN REPUBLIK INDONESIA', 105, 12, { align: 'center' })
    
    doc.setFontSize(10)
    doc.text('DIREKTORAT JENDERAL IMIGRASI', 105, 17, { align: 'center' })
    doc.text('KANTOR WILAYAH KALIMANTAN TIMUR', 105, 22, { align: 'center' })
    doc.text('KANTOR IMIGRASI KELAS II TPI TARAKAN', 105, 27, { align: 'center' })
    
    // Alamat dan kontak
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('Jl. P. Sumatera No.1, Kec Tarakan Tengah, Kota Tarakan, Kalimantan Utara', 105, 33, { align: 'center' })
    doc.text('Telepon: 0811-8773-337, Faxsimili: -', 105, 37, { align: 'center' })
    doc.text('Laman: tarakan.imigrasi.go.id, Pos-el: kanim_tarakan@imigrasi.go.id', 105, 41, { align: 'center' })
    
    // Garis pembatas
    doc.setLineWidth(0.8)
    doc.line(14, 44, 196, 44)
    doc.setLineWidth(0.3)
    doc.line(14, 45.5, 196, 45.5)
  }
  
  // Tambahkan kop surat di halaman pertama
  addLetterhead()
  
  // Judul Laporan
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('LAPORAN DAFTAR HADIR', 105, 52, { align: 'center' })
  
  // Data Sesi
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  let yPos = 60
  
  doc.setFont('helvetica', 'bold')
  doc.text('Judul Rapat', 14, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(`: ${session.title}`, 45, yPos)
  yPos += 5
  
  if (session.description) {
    doc.setFont('helvetica', 'bold')
    doc.text('Deskripsi', 14, yPos)
    doc.setFont('helvetica', 'normal')
    const descLines = doc.splitTextToSize(`: ${session.description}`, 150)
    doc.text(descLines, 45, yPos)
    yPos += (descLines.length * 5)
  }
  
  if (session.location) {
    doc.setFont('helvetica', 'bold')
    doc.text('Lokasi', 14, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(`: ${session.location}`, 45, yPos)
    yPos += 5
  }
  
  const startDate = new Date(session.start_time).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  const startTime = new Date(session.start_time).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  })
  
  let endTime = 'selesai'
  if (session.end_time) {
    endTime = new Date(session.end_time).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  doc.setFont('helvetica', 'bold')
  doc.text('Hari/Tanggal', 14, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(`: ${startDate}`, 45, yPos)
  yPos += 5
  
  doc.setFont('helvetica', 'bold')
  doc.text('Waktu', 14, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(`: ${startTime} - ${endTime} WIB`, 45, yPos)
  yPos += 5
  
  doc.setFont('helvetica', 'bold')
  doc.text('Jumlah Peserta', 14, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(`: ${attendances.length} orang`, 45, yPos)
  yPos += 8
  
  // Tabel Kehadiran
  const tableData = attendances.map((att, index) => [
    index + 1,
    att.full_name,
    att.institution,
    att.position,
    '' // Kolom tanda tangan kosong
  ])
  
  autoTable(doc, {
    startY: yPos,
    head: [['No', 'Nama Lengkap', 'Instansi', 'Jabatan', 'Tanda Tangan']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 9
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
      overflow: 'linebreak'
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 50 },
      2: { cellWidth: 45 },
      3: { cellWidth: 40 },
      4: { cellWidth: 35, halign: 'center', minCellHeight: 10 }
    },
    // Hanya tampilkan header di halaman pertama
    showHead: 'firstPage',
    margin: { top: 10, left: 14, right: 14 }
  })
  
  // Footer dengan nomor halaman
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(100)
    doc.text(
      `Halaman ${i} dari ${pageCount}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    )
  }
  
  // Download
  const fileName = `Laporan_Absensi_${session.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
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