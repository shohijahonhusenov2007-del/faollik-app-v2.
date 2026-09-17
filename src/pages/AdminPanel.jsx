import { useEffect, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { ArrowLeft, Trash2, FileDown } from 'lucide-react'
import { collection, getDocs } from 'firebase/firestore'
import jsPDF from 'jspdf'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { listenAllAchievements, deleteAchievement } from '../lib/data'
import CategoryBadge from '../components/CategoryBadge'

export default function AdminPanel() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [achievements, setAchievements] = useState([])
  const [users, setUsers] = useState([])
  const [tab, setTab] = useState('achievements')

  useEffect(() => {
    const unsub = listenAllAchievements(setAchievements)
    return unsub
  }, [])

  useEffect(() => {
    const loadUsers = async () => {
      const snap = await getDocs(collection(db, 'users'))
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    loadUsers()
  }, [])

  if (profile && profile.role !== 'Administrator') {
    return <Navigate to="/profil" replace />
  }

  const handleDelete = async (a) => {
    if (confirm(`"${a.title}" o'chirilsinmi?`)) {
      await deleteAchievement(a.id)
    }
  }

  const userName = (uid) => users.find(u => u.id === uid)?.name || '-'

  const handlePdfExport = async () => {
    const pdf = new jsPDF()
    pdf.setFontSize(16)
    pdf.text('Ijtimoiy Faollik Portfolio', 14, 16)
    pdf.setFontSize(11)
    pdf.text('Barcha foydalanuvchilar yutuqlari (Admin hisobot)', 14, 24)
    pdf.text(`Jami yutuqlar: ${achievements.length}    Jami foydalanuvchilar: ${users.length}`, 14, 31)

    let y = 44
    pdf.setFontSize(12)
    achievements.forEach((a, i) => {
      if (y > 270) { pdf.addPage(); y = 20 }
      pdf.setFont(undefined, 'bold')
      pdf.text(`${i + 1}. ${a.title}`, 14, y)
      pdf.setFont(undefined, 'normal')
      y += 6
      pdf.text(`Foydalanuvchi: ${userName(a.uid)}`, 14, y)
      y += 6
      pdf.text(`Kategoriya: ${a.categoryName || '-'}    Sana: ${a.date || '-'}`, 14, y)
      y += 6
      if (a.description) {
        const lines = pdf.splitTextToSize(a.description, 180)
        pdf.text(lines, 14, y)
        y += lines.length * 6
      }
      y += 6
    })

    try {
      const base64 = pdf.output('datauristring').split(',')[1]
      const fileName = `admin_yutuqlar_${Date.now()}.pdf`
      const result = await Filesystem.writeFile({
        path: fileName,
        data: base64,
        directory: Directory.Cache
      })
      await Share.share({
        title: 'Barcha yutuqlar PDF',
        url: result.uri
      })
    } catch (err) {
      alert('PDF saqlashda xatolik: ' + err.message)
    }
  }

  return (
    <div className="flex-page">
      <div className="fullpage-header">
        <button className="fullpage-back" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
        <h3>Admin panel</h3>
      </div>

      <div className="fullpage-content">
        <div className="filter-chips" style={{ padding: 0, marginBottom: 16 }}>
          <button
            className={`filter-chip ${tab === 'achievements' ? 'active' : ''}`}
            onClick={() => setTab('achievements')}
          >
            Yutuqlar
          </button>
          <button
            className={`filter-chip ${tab === 'users' ? 'active' : ''}`}
            onClick={() => setTab('users')}
          >
            Foydalanuvchilar
          </button>
        </div>

        <button className="profile-menu-item" style={{ marginBottom: 16 }} onClick={handlePdfExport}>
          <FileDown size={18} />
          PDF chiqarish (barcha yutuqlar)
        </button>

        {tab === 'achievements' && (
          <>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13.5, marginBottom: 12 }}>
              Jami: {achievements.length} ta yutuq (barcha foydalanuvchilar)
            </p>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Foydalanuvchi</th>
                    <th>Nomi</th>
                    <th>Kategoriya</th>
                    <th>Sana</th>
                    <th>Rasm</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {achievements.map(a => (
                    <tr key={a.id}>
                      <td>{userName(a.uid)}</td>
                      <td>{a.title}</td>
                      <td><CategoryBadge categoryId={a.categoryId} name={a.categoryName || '-'} /></td>
                      <td>{a.date}</td>
                      <td>{a.imageUrls?.length || 0}</td>
                      <td>
                        <button className="icon-btn" onClick={() => handleDelete(a)}>
                          <Trash2 size={16} color="#DC2626" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {achievements.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: 24 }}>
                Hali yutuq yo'q
              </p>
            )}
          </>
        )}

        {tab === 'users' && (
          <>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13.5, marginBottom: 12 }}>
              Jami: {users.length} ta foydalanuvchi
            </p>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ism</th>
                    <th>Rol</th>
                    <th>Ro'yxatdan o'tgan sana</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} onClick={() => navigate(`/admin/foydalanuvchi/${u.id}`)} style={{ cursor: 'pointer' }}>
                      <td>{u.name || '-'}</td>
                      <td>{u.role || '-'}</td>
                      <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {users.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: 24 }}>
                Foydalanuvchi topilmadi
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
