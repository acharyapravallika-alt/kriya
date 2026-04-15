import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Rocket, ArrowLeft, Clock } from 'lucide-react';
import Header from '../components/Header';
import AiSaathi from '../components/AiSaathi';

const API_BASE = "http://localhost:8000/api";

function ExecutionMode({ user, feed, setCompletedTasks, completedTasks, setUser }) {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [proof, setProof] = useState("");
  const [time, setTime] = useState(0);
  const [checkedSteps, setCheckedSteps] = useState({});

  const task = feed.find(t => t.id === parseInt(taskId));

  useEffect(() => {
    const interval = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const submitProof = async () => {
    if(!proof.trim() || !task) return;
    try {
      const res = await fetch(`${API_BASE}/submit-proof`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            user_id: user.id || "student_123", 
            task_id: task.id,
            submission_type: 'text',
            submission_content: proof
        })
      });
      const data = await res.json();
      
      if (data.status === 'success') {
          setCompletedTasks([...completedTasks, task.id]);
          setUser({...user, current_streak: data.new_streak});
      }
      navigate('/profile'); // Redirect to profile to see updated skills/streak
    } catch(e) { console.error(e) }
  };

  if (!task) return (
    <div className="wrap" style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2>Task Loading...</h2>
      <button className="btn btn-ghost" onClick={() => navigate('/home')}>Return Home</button>
    </div>
  );

  return (
    <>
      <Header user={user} name={user.name} />
      <section className="wrap" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* Left Column: Task & Proof */}
        <div style={{ flex: '2', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <button className="btn btn-ghost" style={{ alignSelf: 'flex-start', padding: 0 }} onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Back to Feed
          </button>
          
          <div className="card" style={{ border: '2px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="eyebrow">Execution Mode</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent)', fontWeight: 'bold' }}>
                <Clock size={16} /> {formatTime(time)}
              </div>
            </div>
            
            <h2 style={{marginTop: 8, marginBottom: 16}}>{task.signal}</h2>
            <p className="feed-text" style={{ color: 'var(--text-m)', marginBottom: '16px' }}>{task.meaning}</p>
            
            <div className="eyebrow" style={{marginBottom: 12}}>Action Path</div>
            {task.action_path && Array.isArray(task.action_path) ? (
              <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                {task.action_path.map((step, idx) => (
                  <label key={idx} style={{display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px'}}>
                    <input 
                      type="checkbox" 
                      style={{marginTop: '4px', width: '18px', height: '18px', accentColor: 'var(--primary)'}}
                      checked={!!checkedSteps[idx]}
                      onChange={(e) => setCheckedSteps({...checkedSteps, [idx]: e.target.checked})}
                    />
                    <span style={{fontSize: '15px', color: checkedSteps[idx] ? 'var(--text-m)' : 'var(--text-h)', textDecoration: checkedSteps[idx] ? 'line-through' : 'none'}}>
                      <strong>Step {idx + 1}:</strong> {step}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
                <p className="feed-text" style={{ fontSize: '18px', color: 'var(--text-h)' }}><strong>Instructions:</strong> {task.task_desc || "Follow the opportunity guidelines."}</p>
            )}
          </div>

          <div className="card">
             <div className="eyebrow" style={{marginBottom: 12}}>Finish Line</div>
             <p className="feed-text" style={{marginBottom: 12}}><strong>Proof Required:</strong> {task.proof_desc}</p>
              <textarea 
                  className="input-field" 
                  rows={5} 
                  placeholder="Drop your link or explanation here. No fluff."
                  value={proof}
                  onChange={(e) => setProof(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button className="btn btn-primary" onClick={submitProof}>
                    Verify & Complete <Rocket size={16} />
                  </button>
              </div>
          </div>
        </div>

        {/* Right Column: AI Saathi */}
        <div style={{ flex: '1', position: 'sticky', top: '24px' }}>
          <AiSaathi taskId={task.id} userId={user.id || "student_123"} />
        </div>

      </section>
    </>
  );
}

export default ExecutionMode;
