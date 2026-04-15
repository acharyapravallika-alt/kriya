import { Code2, Zap, CheckCircle2 } from 'lucide-react';
import Header from '../components/Header';
import AiSaathi from '../components/AiSaathi';
import { useNavigate } from 'react-router-dom';

function PracticePage({ user, name, feed, completedTasks, onStartTask }) {
  const navigate = useNavigate();
  const practiceTasks = feed.filter(item => item.opportunity_type === 'practice');

  return (
    <>
      <Header user={user} name={name} />
      <section className="wrap" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* Left Column: Practice Questions List */}
        <div style={{ flex: '2', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <h2 className="eyebrow" style={{display:'flex', alignItems:'center', gap:'8px'}}>
              <Code2 size={20}/> Daily Technical Practice
            </h2>
            <div className="feed-list">
              {practiceTasks.length === 0 && <div style={{padding:'20px', color:'var(--text-m)'}}>No practice questions available. Run Gemini Generator!</div>}
              {practiceTasks.map((item) => {
                const isCompleted = completedTasks.includes(item.id);
                return (
                  <div key={item.id} className={`feed-item ${isCompleted ? 'completed' : ''}`}>
                    <div className="feed-header">
                      <div className="feed-signal"><Code2 size={20}/> {item.signal}</div>
                      <div style={{display:'flex', gap:'8px'}}>
                        <span className={`difficulty-badge diff-${item.difficulty}`}>{item.difficulty}</span>
                      </div>
                    </div>
                    
                    <div className="feed-text"><strong>Core Skill Tested:</strong> {item.primary_skill}</div>
                    <div className="feed-text"><strong>Why it matters:</strong> {item.meaning}</div>
                    <div className="feed-text" style={{color: 'var(--primary)'}}><strong>Time to Crack:</strong> {item.estimated_time}</div>
                    
                    <div style={{marginTop: '16px'}}>
                      {isCompleted ? (
                        <button className="btn btn-ghost" disabled>
                          <CheckCircle2 size={18} color="var(--primary)" /> Solved
                        </button>
                      ) : (
                        <button className="btn btn-primary" onClick={() => {
                          onStartTask(item);
                          navigate(`/execute/${item.id}`);
                        }}>
                          <Zap size={18} /> CRACK PROBLEM
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Floating AI Saathi */}
        <div style={{ flex: '1', position: 'sticky', top: '24px' }}>
          <div style={{marginBottom: '12px', fontSize: '14px', color: 'var(--text-m)'}}>Stuck on a problem? Ask Saathi!</div>
          <AiSaathi taskId={null} userId={user.id || "student_123"} />
        </div>

      </section>
    </>
  );
}

export default PracticePage;
