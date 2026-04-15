import { Flame, CheckCircle2, Zap } from 'lucide-react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';

function Home({ user, name, feed, completedTasks, onStartTask }) {
  const navigate = useNavigate();

  return (
    <>
      <Header user={user} name={name} />
      <section className="wrap">
        <div className="streak-banner">
          <div className="streak-box">
            <div style={{display:'flex', alignItems:'center', gap:'8px', color:'var(--accent)', fontWeight:'700', fontSize:'14px', textTransform:'uppercase', letterSpacing:'1px'}}>
              <Flame size={18} /> Execution Streak
            </div>
            <strong>{user.current_streak} days</strong>
            <div style={{color:'var(--primary)', fontSize:'13px', fontWeight:'600'}}>Keep executing! 🌱</div>
          </div>
        </div>

        <div className="card">
          <h2 className="eyebrow">Your Daily Action Feed</h2>
          <div className="feed-list">
            {feed.map((item) => {
              const isCompleted = completedTasks.includes(item.id);
              return (
                <div key={item.id} className={`feed-item ${isCompleted ? 'completed' : ''}`}>
                  <div className="feed-header">
                    <div className="feed-signal"><Zap size={22} color="var(--accent)"/> {item.signal}</div>
                    {item.difficulty && (
                      <span className={`difficulty-badge diff-${item.difficulty}`}>{item.difficulty}</span>
                    )}
                  </div>
                  
                  <div className="feed-text"><strong>Why it matters:</strong> {item.meaning}</div>
                  <div className="feed-text"><strong>Career Impact:</strong> {item.impact}</div>
                  <div className="feed-task"><strong>Today's Task:</strong> {item.task_desc}</div>
                  
                  <div>
                    {isCompleted ? (
                      <button className="btn btn-ghost" disabled>
                        <CheckCircle2 size={18} color="var(--primary)" /> Executed
                      </button>
                    ) : (
                      <button className="btn btn-primary" onClick={() => {
                        onStartTask(item);
                        navigate(`/execute/${item.id}`);
                      }}>
                        <Zap size={18} /> DO TASK
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
