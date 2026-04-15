from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
import datetime as dt
import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()
try:
    gemini_client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
except Exception as e:
    print(f"Gemini init error: {e}")
    gemini_client = None

import models, schemas
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Kriya Action Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def init_mock_data(db: Session):
    # Initialize tasks via Gemini if empty
    if not db.query(models.ActionTask).first():
        if gemini_client:
            try:
                print("Generating 8 advanced Decision Intelligence Opportunities via Gemini...")
                prompt = """You are a senior staff-level AI product engineer building advanced feature modules for "Kriya - Execution-First Engineering Platform".
Generate a JSON array of EXACTLY 8 highly practical, execution-heavy "Intelligence Opportunities". Generate EXACTLY 2 items for each of the following 4 types: "newsletter", "event", "course", "podcast".
They must test core skills and push the user to execute instead of passively reading.
Return ONLY a valid JSON List where each item matches this schema exactly:
{
  "opportunity_type": "One of: newsletter, event, course, podcast",
  "signal": "Brief catchy title of the opportunity",
  "meaning": "Personalized explanation of why this matters",
  "impact": "Career impact for the developer",
  "relevance_score": Integer between 0 and 100,
  "estimated_time": "String like '2 hours'",
  "action_path": ["Step 1: Understand X", "Step 2: Build Y", "Step 3: Extend Z"],
  "expected_output": "What the user will produce (Code, Analysis, etc)",
  "proof_desc": "What the user must submit as proof",
  "difficulty": "easy, medium, or hard",
  "primary_skill": "The main skill tested",
  "opportunity_metadata": {
     // If type is newsletter: nothing extra needed (can be empty)
     // If type is event: "success_probability": "75%", "gap_analysis": "Needs React tuning"
     // If type is course: "mini_milestones": ["Milestone 1 description", "Milestone 2"]
     // If type is podcast: "key_insights": ["Insight 1", "Insight 2"]
  }
}
"""
                response = gemini_client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                    ),
                )
                tasks_data = json.loads(response.text)
                for t in tasks_data:
                    db_task = models.ActionTask(
                        opportunity_type=t.get("opportunity_type", "general"),
                        signal=t["signal"],
                        meaning=t["meaning"],
                        impact=t["impact"],
                        relevance_score=t.get("relevance_score", 50),
                        estimated_time=t.get("estimated_time", "1h"),
                        action_path=t.get("action_path", []),
                        opportunity_metadata=t.get("opportunity_metadata", {}),
                        expected_output=t.get("expected_output", ""),
                        proof_desc=t["proof_desc"],
                        difficulty=t["difficulty"],
                        domain_target="CSE",
                        primary_skill=t["primary_skill"]
                    )
                    db.add(db_task)
                db.commit()
                print("Opportunities generated and saved to DB.")
            except Exception as e:
                print("Failed to generate opportunities:", e)
            
            try:
                print("Generating 10 dynamic Practice Questions via Gemini...")
                practice_prompt = """You are an expert technical interviewer at a FAANG company.
Generate a JSON array of EXACTLY 10 highly practical, execution-heavy "LeetCode-style" algorithmic or system design practice Action Tasks.
Return ONLY a valid JSON List where each item matches this schema exactly:
{
  "opportunity_type": "practice",
  "signal": "Brief catchy title (e.g., Optimize React Render)",
  "meaning": "Why this matters in production.",
  "impact": "Career impact for the developer.",
  "relevance_score": 50,
  "estimated_time": "30 mins",
  "action_path": ["Understand the problem constraints", "Design the optimal solution", "Implement and test edge cases"],
  "expected_output": "Working code submission",
  "proof_desc": "What the user must submit as proof (e.g., Link to code, 1-line explanation).",
  "difficulty": "medium",
  "primary_skill": "The main skill tested (e.g., React, System Design)"
}
"""
                practice_res = gemini_client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=practice_prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                    ),
                )
                practice_data = json.loads(practice_res.text)
                for t in practice_data:
                    db_task = models.ActionTask(
                        opportunity_type=t.get("opportunity_type", "practice"),
                        signal=t["signal"],
                        meaning=t["meaning"],
                        impact=t["impact"],
                        relevance_score=t.get("relevance_score", 50),
                        estimated_time=t.get("estimated_time", "30 mins"),
                        action_path=t.get("action_path", []),
                        opportunity_metadata={},
                        expected_output=t.get("expected_output", ""),
                        proof_desc=t["proof_desc"],
                        difficulty=t["difficulty"],
                        domain_target="CSE",
                        primary_skill=t["primary_skill"]
                    )
                    db.add(db_task)
                db.commit()
                print("Practice questions generated and saved to DB.")
            except Exception as e:
                print("Failed to generate practice tasks:", e)

    # Initialize MVP test user if doesn't exist
    user = db.query(models.User).filter(models.User.id == "student_123").first()
    if not user:
        user = models.User(id="student_123", name="Alex", current_streak=12, longest_streak=15, skill_progress=40.5)
        db.add(user)
        db.commit()
        db.refresh(user)
        # Add basic skills
        for skill, lvl in [("React", 40), ("Debugging", 65), ("System Design", 20), ("Python", 80)]:
            db.add(models.UserSkill(user_id=user.id, skill_name=skill, level=lvl))
        # Add a badge
        db.add(models.UserBadge(user_id=user.id, badge_name="7-Day Sprint", badge_desc="Completed tasks 7 days in a row."))
        db.commit()

@app.on_event("startup")
def startup_event():
    db = next(get_db())
    init_mock_data(db)

@app.get("/api/feed", response_model=list[schemas.FeedItemResponse])
def get_feed(user_id: str, opp_type: str = None, db: Session = Depends(get_db)):
    query = db.query(models.ActionTask)
    if opp_type:
        query = query.filter(models.ActionTask.opportunity_type == opp_type)
    tasks = query.limit(20).all()
    
    results = []
    for t in tasks:
        results.append({
            "id": t.id,
            "opportunity_type": t.opportunity_type or "general",
            "signal": t.signal or "",
            "meaning": t.meaning or "",
            "impact": t.impact or "",
            "relevance_score": t.relevance_score or 50,
            "estimated_time": t.estimated_time or "1h",
            "action_path": t.action_path if isinstance(t.action_path, list) else [],
            "opportunity_metadata": t.opportunity_metadata if isinstance(t.opportunity_metadata, dict) else {},
            "expected_output": t.expected_output or "",
            "proof_desc": t.proof_desc or "",
            "difficulty": t.difficulty or "easy",
            "primary_skill": t.primary_skill or "General"
        })
    return results

@app.get("/api/user/{user_id}/tasks")
def get_user_tasks(user_id: str, db: Session = Depends(get_db)):
    user_tasks = db.query(models.UserTask).filter_by(user_id=user_id).all()
    return [{"task_id": ut.task_id, "status": ut.status} for ut in user_tasks]

@app.post("/api/start-task")
def start_task(req: schemas.StartTaskRequest, db: Session = Depends(get_db)):
    user_task = db.query(models.UserTask).filter_by(user_id=req.user_id, task_id=req.task_id).first()
    if not user_task:
        user_task = models.UserTask(
            user_id=req.user_id,
            task_id=req.task_id,
            status="started",
            started_at=dt.datetime.utcnow()
        )
        db.add(user_task)
    else:
        user_task.status = "started"
        user_task.started_at = dt.datetime.utcnow()
    db.commit()
    return {"status": "started", "task_id": req.task_id}

@app.post("/api/submit-proof")
def submit_proof(req: schemas.SubmitProofRequest, db: Session = Depends(get_db)):
    user_task = db.query(models.UserTask).filter_by(user_id=req.user_id, task_id=req.task_id).first()
    if not user_task:
        user_task = models.UserTask(user_id=req.user_id, task_id=req.task_id, status="started")
        db.add(user_task)
        db.commit()
        db.refresh(user_task)
    
    if user_task.status == "completed":
        return {"status": "already_completed"}
        
    score = 85
    eval_feedback = "Mock evaluation completed."
    
    if gemini_client and req.submission_content:
        task = db.query(models.ActionTask).filter_by(id=req.task_id).first()
        task_desc = str(task.action_path) if task else "Generic engineering task."
        proof_desc = task.proof_desc if task else "No specific proof description."
        
        prompt = f"""You are an expert engineering mentor. Evaluate the user's submission for the following task.
Task Instructions: {task_desc}
Required Proof: {proof_desc}

User Submission: {req.submission_content}

Return ONLY a JSON object exactly like this:
{{"score": <Integer from 0 to 100>, "feedback": "<1-2 sentence feedback explaining the score and any improvements>"}}
"""
        try:
            res = gemini_client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(response_mime_type="application/json")
            )
            eval_data = json.loads(res.text)
            score = eval_data.get("score", 60)
            eval_feedback = eval_data.get("feedback", "No feedback provided.")
        except Exception as e:
            print("Evaluation error:", e)

    submission = models.Submission(
        user_task_id=user_task.id,
        submission_type=req.submission_type,
        content=req.submission_content,
        score=score,
        evaluation_feedback=eval_feedback
    )
    db.add(submission)
    
    user_task.status = "completed"
    user_task.completed_at = dt.datetime.utcnow()
    
    user = db.query(models.User).filter(models.User.id == req.user_id).first()
    if user:
        user.current_streak += 1
        if user.current_streak > user.longest_streak:
            user.longest_streak = user.current_streak
        
        # Boost specific skill based on dynamic score
        task = db.query(models.ActionTask).filter_by(id=req.task_id).first()
        if task:
            skill_boost = max(1, score // 10) # 1 to 10 points
            skill = db.query(models.UserSkill).filter_by(user_id=user.id, skill_name=task.primary_skill).first()
            if skill:
                skill.level = min(100, skill.level + skill_boost)
            else:
                db.add(models.UserSkill(user_id=user.id, skill_name=task.primary_skill, level=10 + skill_boost))
    
    db.commit()
    db.refresh(user)
    
    return {"status": "success", "new_streak": user.current_streak if user else 0}

@app.get("/api/user/{user_id}", response_model=schemas.UserProfileResponse)
def get_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    skills = db.query(models.UserSkill).filter_by(user_id=user_id).all()
    badges = db.query(models.UserBadge).filter_by(user_id=user_id).all()
    
    return {
        "id": user.id,
        "name": user.name,
        "current_streak": user.current_streak,
        "longest_streak": user.longest_streak,
        "skill_progress": user.skill_progress,
        "domain": user.domain,
        "skills": [{"skill_name": s.skill_name, "level": s.level} for s in skills],
        "badges": [{"badge_name": b.badge_name, "timestamp": b.timestamp} for b in badges]
    }

@app.post("/api/ai-saathi", response_model=schemas.AiSaathiResponse)
def chat_with_saathi(req: schemas.AiSaathiRequest, db: Session = Depends(get_db)):
    task = db.query(models.ActionTask).filter_by(id=req.task_id).first()
    task_desc = task.task_desc if task else "an unknown task"
    signal = task.signal if task else "unknown title"

    if gemini_client:
        prompt = f"""You are Ai Saathi, an expert, enthusiastic technical mentor helping a developer execute a task.
Task Title: {signal}
Task Instructions: {task_desc}

User Query: {req.message}

Provide a concise, highly practical, direct hint or unblocking instruction. Be encouraging but don't write the code for them entirely. Keep it under 3 sentences."""
        try:
            res = gemini_client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
            )
            reply = res.text
        except Exception as e:
            reply = f"Sorry, I had trouble connecting to my AI brain. Keep trying! Error: {e}"
    else:
        # Mock AI fallback
        msg = req.message.lower()
        reply = f"I'm your AI Saathi. You are working on '{signal}'. "
        if "error" in msg or "bug" in msg:
            reply += "It looks like you've hit a bug. Try looking at the console logs or verify your object names!"
        elif "help" in msg or "stuck" in msg:
            reply += "Here's a hint: break it down. Have you tried searching the exact error message?"
        else:
            reply += "I'm monitoring your progress. Keep executing!"
        
    return {"reply": reply}
