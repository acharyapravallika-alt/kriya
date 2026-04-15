import { useState, useRef, useEffect } from 'react';
import { Terminal, Send } from 'lucide-react';

const API_BASE = "http://localhost:8000/api";

function AiSaathi({ taskId, userId }) {
  const [messages, setMessages] = useState([{ role: 'ai', text: "I'm your AI Saathi. Ready to unblock you!" }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if(!input.trim()) return;
    const userMsg = { role: 'user', text: input };
    setMessages([...messages, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/ai-saathi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, task_id: taskId, message: userMsg.text, context_code: "" })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
    } catch(e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'ai', text: "Connection error. Keep trying!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ flex: '1', display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '450px', padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface-light)' }}>
        <Terminal size={18} color="var(--accent)" />
        <strong style={{ color: 'var(--text-h)' }}>AI Saathi</strong>
      </div>
      
      <div style={{ flex: '1', overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            backgroundColor: m.role === 'user' ? 'var(--primary)' : 'var(--surface-light)',
            padding: '10px 14px',
            borderRadius: '12px',
            maxWidth: '85%',
            fontSize: '14px',
            lineHeight: '1.4'
          }}>
            {m.text}
          </div>
        ))}
        {loading && <div style={{ fontSize: '13px', color: 'var(--text-m)' }}>Saathi is typing...</div>}
        <div ref={endRef} />
      </div>

      <div style={{ padding: '12px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px', background: 'var(--surface)' }}>
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask for a hint or explain an error..."
          style={{ flex: 1, backgroundColor: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px 14px', borderRadius: '8px', outline: 'none' }}
        />
        <button className="btn btn-primary" style={{ padding: '0 16px' }} onClick={sendMessage} disabled={loading}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

export default AiSaathi;
