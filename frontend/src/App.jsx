import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Home from './pages/Home'
import FeedPage from './pages/FeedPage'
import PracticePage from './pages/PracticePage'
import ExecutionMode from './pages/ExecutionMode'
import Profile from './pages/Profile'
import './App.css'

const API_BASE = "http://localhost:8000/api";
const USER_ID = "student_123";

function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ current_streak: 0, longest_streak: 0, skill_progress: 0, domain: 'CSE', skills: [], badges: [] });
  const [feed, setFeed] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [isIntroComplete, setIsIntroComplete] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchTasks();
  }, [user.current_streak]);

  const fetchUserData = async () => {
    try {
      const res = await fetch(`${API_BASE}/user/${USER_ID}`);
      const data = await res.json();
      setUser(prev => ({...prev, ...data})); 
    } catch(e) { console.error("Failed to fetch user:", e) }
  };

  const fetchTasks = async () => {
    try {
      const feedRes = await fetch(`${API_BASE}/feed?user_id=${USER_ID}`);
      const feedData = await feedRes.json();
      setFeed(feedData);

      const taskRes = await fetch(`${API_BASE}/user/${USER_ID}/tasks`);
      const taskData = await taskRes.json();
      const completed = taskData.filter(t => t.status === 'completed').map(t => t.task_id);
      setCompletedTasks(completed);
    } catch(e) { console.error("Failed to fetch tasks:", e) }
  };

  const handleStartTask = async (task) => {
    try {
        await fetch(`${API_BASE}/start-task`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({user_id: USER_ID, task_id: task.id})
        });
    } catch(e) { console.error(e) }
  };

  const feedProps = { user, name: user.name, feed, completedTasks, onStartTask: handleStartTask };

  return (
    <Routes>
      <Route path="/" element={
        !isIntroComplete ? (
          <Landing user={user} setUser={setUser} isIntroComplete={isIntroComplete} setIsIntroComplete={setIsIntroComplete} />
        ) : <Navigate to="/news" replace />
      } />
      
      <Route path="/home" element={isIntroComplete ? <Navigate to="/news" replace /> : <Navigate to="/" replace />} />
      
      <Route path="/news" element={isIntroComplete ? <FeedPage category="newsletter" {...feedProps} /> : <Navigate to="/" />} />
      <Route path="/events" element={isIntroComplete ? <FeedPage category="event" {...feedProps} /> : <Navigate to="/" />} />
      <Route path="/courses" element={isIntroComplete ? <FeedPage category="course" {...feedProps} /> : <Navigate to="/" />} />
      <Route path="/podcasts" element={isIntroComplete ? <FeedPage category="podcast" {...feedProps} /> : <Navigate to="/" />} />
      <Route path="/practice" element={isIntroComplete ? <PracticePage {...feedProps} /> : <Navigate to="/" />} />
      
      <Route path="/execute/:taskId" element={isIntroComplete ? <ExecutionMode user={user} feed={feed} completedTasks={completedTasks} setCompletedTasks={setCompletedTasks} setUser={setUser} /> : <Navigate to="/" />} />
      <Route path="/profile" element={isIntroComplete ? <Profile user={user} /> : <Navigate to="/" />} />
    </Routes>
  )
}

export default App
