import { useState } from 'react';
import { Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Landing({ user, setUser, isIntroComplete, setIsIntroComplete }) {
  const navigate = useNavigate();
  const [introData, setIntroData] = useState({ name: '', domain: 'CSE', branch: '' });

  const handleStart = () => {
    setUser({ ...user, domain: introData.domain, name: introData.name });
    setIsIntroComplete(true);
    navigate('/home');
  };

  return (
    <div className="intro-container">
      <div className="intro-card">
        <h1>Welcome to Kriya <Rocket size={28} style={{display:'inline', color:'var(--accent)', verticalAlign:'middle'}}/></h1>
        <p className="sub">The Execution-First Engineering Platform.</p>
        
        <div className="form-group" style={{marginTop: '20px'}}>
          <label>What's your name?</label>
          <input 
            type="text" 
            className="input-field" 
            value={introData.name}
            onChange={(e) => setIntroData({...introData, name: e.target.value})}
            placeholder="e.g. Alex"
          />
        </div>

        <div className="form-group">
          <label>Select your Domain</label>
          <select 
            className="input-field"
            value={introData.domain}
            onChange={(e) => setIntroData({...introData, domain: e.target.value})}
          >
            <option value="CSE">CSE</option>
            <option value="CSE (AI/ML)">CSE (AI/ML)</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Civil">Civil</option>
          </select>
        </div>

        <div className="form-group">
          <label>Branch / Year</label>
          <input 
            type="text" 
            className="input-field" 
            value={introData.branch}
            onChange={(e) => setIntroData({...introData, branch: e.target.value})}
            placeholder="e.g. 3rd Year"
          />
        </div>

        <button 
          className="btn btn-primary" 
          style={{width: '100%', marginTop: '20px'}}
          onClick={handleStart}
        >
          Enter Focus Mode <Rocket size={18} />
        </button>
      </div>
    </div>
  );
}

export default Landing;
