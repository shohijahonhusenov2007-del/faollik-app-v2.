import { NavLink } from 'react-router-dom'
import { Home, ListChecks, Plus, MessageCircle, BarChart3, User } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'


export default function BottomNav({ onAddClick }) {
  const { t } = useLanguage()
  return (
    <nav className="bottom-nav">
      <NavLink to="/" end className={({isActive}) => 'nav-item' + (isActive ? ' active' : '')}>
        <Home size={22} />
        <span>{t('nav_home')}</span>
      </NavLink>
      <NavLink to="/yutuqlar" className={({isActive}) => 'nav-item' + (isActive ? ' active' : '')}>
        <ListChecks size={22} />
        <span>{t('stat_achievements')}</span>
      </NavLink>
      <button className="fab" onClick={onAddClick} aria-label="Qo'shish">
        <Plus size={26} />
      </button>
      <NavLink to="/chat" className={({isActive}) => 'nav-item' + (isActive ? ' active' : '')}>
        <MessageCircle size={22} />
        <span>{t('nav_chat')}</span>
      </NavLink>
      <NavLink to="/statistika" className={({isActive}) => 'nav-item' + (isActive ? ' active' : '')}>
        <BarChart3 size={22} />
        <span>{t('nav_stats')}</span>
      </NavLink>
      <NavLink to="/profil" className={({isActive}) => 'nav-item' + (isActive ? ' active' : '')}>
        <User size={22} />
        <span>{t('profile_title')}</span>
      </NavLink>
    </nav>
  )
}
