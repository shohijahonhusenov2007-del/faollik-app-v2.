import { NavLink } from 'react-router-dom'
import { Home, ListChecks, Plus, MessageCircle, BarChart3, User } from 'lucide-react'


export default function BottomNav({ onAddClick }) {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" end className={({isActive}) => 'nav-item' + (isActive ? ' active' : '')}>
        <Home size={22} />
        <span>Bosh sahifa</span>
      </NavLink>
      <NavLink to="/yutuqlar" className={({isActive}) => 'nav-item' + (isActive ? ' active' : '')}>
        <ListChecks size={22} />
        <span>Yutuqlar</span>
      </NavLink>
      <button className="fab" onClick={onAddClick} aria-label="Qo'shish">
        <Plus size={26} />
      </button>
      <NavLink to="/chat" className={({isActive}) => 'nav-item' + (isActive ? ' active' : '')}>
        <MessageCircle size={22} />
        <span>Chat</span>
      </NavLink>
      <NavLink to="/statistika" className={({isActive}) => 'nav-item' + (isActive ? ' active' : '')}>
        <BarChart3 size={22} />
        <span>Statistika</span>
      </NavLink>
      <NavLink to="/profil" className={({isActive}) => 'nav-item' + (isActive ? ' active' : '')}>
        <User size={22} />
        <span>Profil</span>
      </NavLink>
    </nav>
  )
}
