import { Terminal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Header({ user, name }) {
  const navigate = useNavigate();

  return (
    <header className="header" style={{display:'flex', flexDirection:'column', gap:'16px', alignItems:'flex-start'}}>
      <div style={{display:'flex', width:'100%', justifyContent:'space-between', alignItems:'center'}}>
        <div className="nav-brand" style={{cursor: 'pointer'}} onClick={() => navigate('/home')}>
          <Terminal size={24} color="var(--accent)" /> Kriya Engine
        </div>
        <div className="user-info">
          {name && <span style={{color: 'var(--text-h)'}}>Hey {name}!</span>}
          <button className="badge" onClick={(e) => { e.stopPropagation(); navigate('/profile'); }}>
            Profile
          </button>
          <div className="badge">Domain: {user.domain}</div>
          <div className="badge">Skill: {Math.floor(user.skill_progress)}%</div>
        </div>
      </div>
      <div style={{display:'flex', gap:'12px'}}>
        <button className="badge" onClick={() => navigate('/news')}>📰 Newsletters</button>
        <button className="badge" onClick={() => navigate('/events')}>📅 Events</button>
        <button className="badge" onClick={() => navigate('/courses')}>🎓 Courses</button>
        <button className="badge" onClick={() => navigate('/podcasts')}>🎧 Podcasts</button>
        <button className="badge" onClick={() => navigate('/practice')} style={{background: 'var(--primary)', color: 'var(--bg)'}}>💻 Practice Zone</button>
      </div>
    </header>
  );
}

export default Header;
