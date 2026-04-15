import { Flame, CheckCircle2, Zap, Calendar, BookOpen, Podcast, ExternalLink } from 'lucide-react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';

function FeedPage({ user, name, feed, completedTasks, onStartTask, category }) {
  const navigate = useNavigate();

  // Filter feed by category
  const activeFeed = feed.filter(item => item.opportunity_type === category);

  const getPageConfig = () => {
    switch (category) {
      case 'newsletter': return { title: 'Decision Intelligence Feed', icon: <Flame size={20}/>, cta: 'EXECUTE NOW' };
      case 'event': return { title: 'Opportunity Preparation Engine', icon: <Calendar size={20}/>, cta: 'START PREPARATION' };
      case 'course': return { title: 'Skill Acceleration Paths', icon: <BookOpen size={20}/>, cta: 'START + BUILD' };
      case 'podcast': return { title: 'Insight-to-Execution Engine', icon: <Podcast size={20}/>, cta: 'APPLY INSIGHT' };
      default: return { title: 'Action Feed', icon: <Zap size={20}/>, cta: 'DO TASK' };
    }
  };

  const config = getPageConfig();

  return (
    <>
      <Header user={user} name={name} />
      <section className="wrap">
        <div className="card">
          <h2 className="eyebrow" style={{display:'flex', alignItems:'center', gap:'8px'}}>
            {config.icon} {config.title}
          </h2>
          <div className="feed-list">
            {activeFeed.length === 0 && <div style={{padding:'20px', color:'var(--text-m)'}}>No '{category}' opportunities available. Run Gemini Generator!</div>}
            {activeFeed.map((item) => {
              const isCompleted = completedTasks.includes(item.id);
              
              // Dynamic Metadata Rendering
              const meta = item.opportunity_metadata || {};

              return (
                <div key={item.id} className={`feed-item ${isCompleted ? 'completed' : ''}`}>
                  <div className="feed-header">
                    <div className="feed-signal">{config.icon} {item.signal}</div>
                    <div style={{display:'flex', gap:'8px'}}>
                      <span className="badge" style={{background:'rgba(255,255,255,0.1)'}}>Rel: {item.relevance_score}%</span>
                      {item.difficulty && (
                        <span className={`difficulty-badge diff-${item.difficulty}`}>{item.difficulty}</span>
                      )}
                    </div>
                  </div>
                  
                  {category === 'newsletter' && (
                    <div className="badge diff-hard" style={{marginBottom:'12px', display:'inline-block'}}>High Leverage Opportunity</div>
                  )}

                  {category === 'event' && meta.success_probability && (
                    <div style={{marginBottom:'12px', padding:'8px', background:'rgba(255,255,255,0.05)', borderRadius:'6px'}}>
                      <strong>Readiness Meter:</strong> {meta.success_probability} <br/>
                      <span style={{fontSize:'12px', color:'var(--text-m)'}}>{meta.gap_analysis || "Close skill gaps before event."}</span>
                    </div>
                  )}

                  {category === 'course' && meta.mini_milestones && (
                    <div style={{marginBottom:'12px'}}>
                      <strong>Progress Checkpoints:</strong>
                      <ul style={{margin:'4px 0 0 20px', fontSize:'13px'}}>
                        {meta.mini_milestones.map((m, i) => <li key={i}>{m}</li>)}
                      </ul>
                    </div>
                  )}

                  {category === 'podcast' && meta.key_insights && (
                    <div style={{marginBottom:'12px', fontStyle:"italic", color:"var(--text-m)"}}>
                      " {meta.key_insights.join(", ")} "
                    </div>
                  )}

                  <div className="feed-text"><strong>Why This Matters to YOU:</strong> {item.meaning}</div>
                  <div className="feed-text" style={{color: 'var(--primary)'}}><strong>Action Path:</strong> {item.action_path?.length > 0 ? `${item.action_path.length} Execution Steps` : 'Direct Delivery'} | {item.estimated_time}</div>
                  
                  <div style={{marginTop: '16px'}}>
                    {isCompleted ? (
                      <button className="btn btn-ghost" disabled>
                        <CheckCircle2 size={18} color="var(--primary)" /> Executed
                      </button>
                    ) : (
                      <button className="btn btn-primary" onClick={() => {
                        onStartTask(item);
                        navigate(`/execute/${item.id}`);
                      }}>
                        <Zap size={18} /> {config.cta}
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

export default FeedPage;
