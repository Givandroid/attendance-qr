import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Session, Attendance, EmployeeAttendance } from '@/types'

export const exportToPDF = async (session: Session, attendances: (Attendance | EmployeeAttendance)[]) => {
  const doc = new jsPDF()
  
  const isEmployeeSession = session.session_type === 'employee'
  
  // Fungsi untuk menambahkan kop surat (hanya halaman pertama)
  const addLetterhead = async () => {
    try {
      const logoUrl = `${window.location.origin}/assets/logo-imigrasi.png`
      
      const response = await fetch(logoUrl)
      if (response.ok) {
        const blob = await response.blob()
        const reader = new FileReader()
        
        await new Promise((resolve) => {
          reader.onloadend = () => {
            const base64data = reader.result as string
            doc.addImage(base64data, 'PNG', 14, 8, 20, 20)
            resolve(null)
          }
          reader.onerror = resolve
          reader.readAsDataURL(blob)
        })
      } else {
        console.log('Logo tidak ditemukan di:', logoUrl)
      }
    } catch (error) {
      console.log('Error loading logo:', error)
    }

    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    
    doc.text('KEMENTERIAN IMIGRASI DAN PEMASYARAKATAN REPUBLIK INDONESIA', 105, 10, { align: 'center' })
    
    doc.setFontSize(10)
    doc.text('DIREKTORAT JENDERAL IMIGRASI', 105, 14, { align: 'center' })  
    doc.text('KANTOR WILAYAH KALIMANTAN TIMUR', 105, 18, { align: 'center' })  
    doc.text('KANTOR IMIGRASI KELAS II TPI TARAKAN', 105, 22, { align: 'center' })  
    
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('Jl. P. Sumatera No.1, Kec Tarakan Tengah, Kota Tarakan, Kalimantan Utara', 105, 26, { align: 'center' })  
    doc.text('Telepon: 0811-8773-337', 105, 30, { align: 'center' }) 
    doc.text('Laman: tarakan.imigrasi.go.id, Pos-el: kanim_tarakan@imigrasi.go.id', 105, 34, { align: 'center' })  
    
    // Garis pembatas
    doc.setLineWidth(0.8)
    doc.line(14, 38, 196, 38)  
    doc.setLineWidth(0.3)
    doc.line(14, 39.5, 196, 39.5)  
  }
  
  await addLetterhead()

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('DAFTAR HADIR', 105, 47, { align: 'center' })
  
  const boxStartY = 52
  const labelX = 18
  const valueX = 50
  let contentHeight = 5 
  
  contentHeight += 5
  
  if (session.description) {
    const descLines = doc.splitTextToSize(`: ${session.description}`, 140)
    contentHeight += descLines.length * 4.5
  }
  
  if (session.location) {
    contentHeight += 5
  }
  
  contentHeight += 5 + 5 + 5 + 6 
  
  doc.setDrawColor(200)
  doc.setFillColor(248, 249, 250)
  doc.roundedRect(14, boxStartY, 182, contentHeight, 2, 2, 'FD')
  
  doc.setFontSize(9)
  doc.setTextColor(0, 0, 0)
  let yPos = boxStartY + 6
  
  // Judul Rapat
  doc.setFont('helvetica', 'bold')
  doc.text('Judul Rapat', labelX, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(`: ${session.title}`, valueX, yPos)
  yPos += 6
  
  // Deskripsi
  if (session.description) {
    doc.setFont('helvetica', 'bold')
    doc.text('Deskripsi', labelX, yPos)
    doc.setFont('helvetica', 'normal')
    const descLines = doc.splitTextToSize(`: ${session.description}`, 140)
    doc.text(descLines, valueX, yPos)
    yPos += descLines.length * 4.5 + 1.5 
  }
  
  // Lokasi
  if (session.location) {
    doc.setFont('helvetica', 'bold')
    doc.text('Lokasi', labelX, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(`: ${session.location}`, valueX, yPos)
    yPos += 6
  }
  
  const sessionDate = new Date(session.session_date).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  doc.setFont('helvetica', 'bold')
  doc.text('Hari/Tanggal', labelX, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(`: ${sessionDate}`, valueX, yPos)
  yPos += 6
  
  const startTime = session.start_time.slice(0, 5) 
  const endTime = session.end_time ? session.end_time.slice(0, 5) : 'selesai'
  
  doc.setFont('helvetica', 'bold')
  doc.text('Waktu', labelX, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(`: ${startTime} - ${endTime}`, valueX, yPos)
  yPos += 6
  
  // Jumlah Peserta
  doc.setFont('helvetica', 'bold')
  doc.text('Jumlah Peserta', labelX, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(`: ${attendances.length} orang`, valueX, yPos)
  
  const tableStartY = boxStartY + contentHeight + 8
  
  // Tabel Kehadiran 
  let tableHeaders: string[]
  let tableData: any[]
  let columnStyles: any
  let tableMargin: any
  
  if (isEmployeeSession) {
    // TABEL PEGAWAI 
    tableHeaders = ['No', 'NIP', 'Nama Lengkap', 'Jabatan', 'Tanda Tangan']
    
    tableData = attendances.map((att, index) => {
      const empAtt = att as EmployeeAttendance
      return [
        index + 1,
        empAtt.nip || '-',
        empAtt.full_name || '-',
        empAtt.position || '-',
        '' // Placeholder untuk tanda tangan
      ]
    })
    
    columnStyles = {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 40 },
      2: { cellWidth: 60 },
      3: { cellWidth: 42 },
      4: { cellWidth: 25, halign: 'center', minCellHeight: 10 }
    }
    
    tableMargin = { 
      top: 10, 
      left: 14, 
      right: 14, 
      bottom: 20 
    }
  } else {
    tableHeaders = ['No', 'Nama Lengkap', 'Instansi', 'Jabatan', 'No. Telepon', 'Tanda Tangan']
    
    tableData = attendances.map((att, index) => {
      const extAtt = att as Attendance
      return [
        index + 1,
        extAtt.full_name || '-',
        extAtt.institution || '-',
        extAtt.position || '-',
        extAtt.phone_number || '-',
        '' // Placeholder untuk tanda tangan
      ]
    })
    
    columnStyles = {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 42 },
      2: { cellWidth: 40 },
      3: { cellWidth: 38 },
      4: { cellWidth: 28 },
      5: { cellWidth: 22, halign: 'center', minCellHeight: 10 }
    }
    
    tableMargin = { 
      top: 10, 
      left: 14, 
      right: 14, 
      bottom: 20 
    }
  }
  
  autoTable(doc, {
    startY: tableStartY,
    head: [tableHeaders],
    body: tableData,
    theme: 'grid',
    tableWidth: 'auto',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 8,
      lineColor: [200, 200, 200], 
      lineWidth: 0.3,
      cellPadding: 1.5
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 1.5,
      overflow: 'linebreak',
      lineColor: [200, 200, 200],
      lineWidth: 0.3,
      valign: 'middle',
      minCellHeight: 6
    },
    columnStyles: columnStyles,
    showHead: 'firstPage',
    margin: tableMargin,
    pageBreak: 'auto',
    rowPageBreak: 'avoid',
    
    // Tambahkan signature di setiap cell
    didDrawCell: (data) => {
      const signatureColumnIndex = isEmployeeSession ? 4 : 5
      
      if (data.column.index === signatureColumnIndex && data.section === 'body') {
        const rowIndex = data.row.index
        const attendance = attendances[rowIndex]
        
        if (attendance && attendance.signature) {
          try {
            const cell = data.cell
            const imgWidth = 18
            const imgHeight = 7
            const imgX = cell.x + (cell.width - imgWidth) / 2 
            const imgY = cell.y + (cell.height - imgHeight) / 2 
            
            doc.addImage(
              attendance.signature, 
              'PNG', 
              imgX, 
              imgY, 
              imgWidth, 
              imgHeight
            )
          } catch (error) {
            console.error('Error adding signature:', error)
          }
        }
      }
    }
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
  const sessionTypeLabel = isEmployeeSession ? 'Pegawai' : 'Instansi_Luar'
  const fileName = `Laporan_Absensi_${sessionTypeLabel}_${session.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}

export const exportToCSV = (session: Session, attendances: (Attendance | EmployeeAttendance)[]) => {
  const isEmployeeSession = session.session_type === 'employee'
  
  let headers: string[]
  let rows: any[]
  
  if (isEmployeeSession) {
    headers = ['No', 'NIP', 'Nama Lengkap', 'Jabatan', 'Waktu Absen']
    
    rows = attendances.map((att, index) => {
      const empAtt = att as EmployeeAttendance
      return [
        index + 1,
        empAtt.nip,
        empAtt.full_name,
        empAtt.position,
        new Date(empAtt.checked_in_at).toLocaleString('id-ID')
      ]
    })
  } else {
    headers = ['No', 'Nama Lengkap', 'Instansi', 'Jabatan', 'No. Telepon', 'Waktu Absen']
    
    rows = attendances.map((att, index) => {
      const extAtt = att as Attendance
      return [
        index + 1,
        extAtt.full_name,
        extAtt.institution,
        extAtt.position,
        extAtt.phone_number,
        new Date(extAtt.checked_in_at).toLocaleString('id-ID')
      ]
    })
  }
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map((cell: string | number) => `"${cell}"`).join(','))
  ].join('\n')
  
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  const sessionTypeLabel = isEmployeeSession ? 'Pegawai' : 'Instansi_Luar'
  link.setAttribute('href', url)
  link.setAttribute('download', `Absensi_${sessionTypeLabel}_${session.title.replace(/\s+/g, '_')}.csv`)
  link.click()
}