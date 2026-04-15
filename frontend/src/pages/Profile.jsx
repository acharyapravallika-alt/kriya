import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { ArrowLeft, Trophy, Medal } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

function Profile({ user }) {
  const navigate = useNavigate();

  // Recharts needs an array of objects like { skill: 'React', level: 80 }
  const radarData = user?.skills?.map(s => ({
    skill: s.skill_name,
    level: s.level,
    fullMark: 100
  })) || [
    { skill: 'React', level: 30, fullMark: 100 },
    { skill: 'Python', level: 40, fullMark: 100 },
    { skill: 'Debugging', level: 20, fullMark: 100 },
    { skill: 'System Design', level: 10, fullMark: 100 }
  ];

  return (
    <>
      <Header user={user} name={user.name} />
      <section className="wrap" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        
        <div style={{ width: '100%', marginBottom: '12px' }}>
          <button className="btn btn-ghost" style={{ padding: 0 }} onClick={() => navigate('/home')}>
            <ArrowLeft size={18} /> Back tracking
          </button>
        </div>

        {/* Radar Chart Card */}
        <div className="card" style={{ flex: '1', minWidth: '300px' }}>
          <div className="eyebrow" style={{marginBottom: '16px'}}>Skill Radar</div>
          <div style={{ width: '100%', height: '300px', backgroundColor: 'var(--surface-light)', borderRadius: '12px', padding: '10px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: 'var(--text-m)', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} stroke="var(--border)"/>
                <Radar name="Skills" dataKey="level" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats & Badges */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '24px', minWidth: '300px' }}>
          
          <div className="card" style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <div className="eyebrow">Longest Streak</div>
              <h2 style={{ color: 'var(--accent)', fontSize: '32px', margin: '4px 0' }}>{user.longest_streak || 0} <span style={{fontSize:'16px', color:'var(--text-m)'}}>days</span></h2>
            </div>
            <div style={{ flex: 1 }}>
              <div className="eyebrow">Overall Progress</div>
              <h2 style={{ color: 'var(--primary)', fontSize: '32px', margin: '4px 0' }}>{Math.floor(user.skill_progress || 0)}<span style={{fontSize:'16px', color:'var(--text-m)'}}>%</span></h2>
            </div>
          </div>

          <div className="card flex-1">
            <div className="eyebrow" style={{marginBottom: '16px'}}><Trophy size={16} style={{display:'inline', verticalAlign:'middle'}}/> Earned Badges</div>
            {user?.badges?.length > 0 ? (
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '16px' }}>
                 {user.badges.map((b, i) => (
                   <div key={i} style={{ backgroundColor: 'var(--surface-light)', padding: '16px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border)' }}>
                     <Medal size={32} color="var(--accent)" style={{ margin: '0 auto 8px auto' }} />
                     <div style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--text-h)' }}>{b.badge_name}</div>
                   </div>
                 ))}
               </div>
            ) : (
                <div className="feed-text" style={{ textAlign: 'center', padding: '20px' }}>Execute tasks to earn badges!</div>
            )}
          </div>

        </div>

      </section>
    </>
  );
}

export default Profile;
