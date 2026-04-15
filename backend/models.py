from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, default="User")
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    skill_progress = Column(Float, default=0.0)
    domain = Column(String, default="CSE")
    
    # Relationships
    tasks = relationship("UserTask", back_populates="user")
    skills = relationship("UserSkill", back_populates="user", cascade="all, delete")
    badges = relationship("UserBadge", back_populates="user", cascade="all, delete")
    
class UserSkill(Base):
    __tablename__ = "user_skills"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    skill_name = Column(String) # e.g., "React", "Python", "System Design"
    level = Column(Integer, default=10) # Out of 100
    
    user = relationship("User", back_populates="skills")
    
class UserBadge(Base):
    __tablename__ = "user_badges"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    badge_name = Column(String)
    badge_desc = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="badges")

from sqlalchemy import JSON
class ActionTask(Base):
    __tablename__ = "action_tasks"
    id = Column(Integer, primary_key=True, index=True)
    opportunity_type = Column(String, index=True) # "newsletter", "event", "course", "podcast"
    signal = Column(String)
    meaning = Column(Text)
    impact = Column(Text)
    relevance_score = Column(Integer, default=50)
    estimated_time = Column(String) # e.g. "45m"
    difficulty = Column(String) 
    domain_target = Column(String)
    primary_skill = Column(String, default="General")
    
    # Store dynamic action paths and module-specific fields
    action_path = Column(JSON, default=list) # e.g. ["step1", "step2"]
    opportunity_metadata = Column(JSON, default=dict) # To hold gap_analysis, mini_milestones etc.
    expected_output = Column(Text) 
    proof_desc = Column(Text)

class UserTask(Base):
    __tablename__ = "user_tasks"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    task_id = Column(Integer, ForeignKey("action_tasks.id"))
    status = Column(String, default="pending") 
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    user = relationship("User", back_populates="tasks")
    task = relationship("ActionTask")
    submission = relationship("Submission", back_populates="user_task", uselist=False)

class Submission(Base):
    __tablename__ = "submissions"
    id = Column(Integer, primary_key=True, index=True)
    user_task_id = Column(Integer, ForeignKey("user_tasks.id"))
    submission_type = Column(String) 
    content = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    score = Column(Integer, default=0) # AI evaluated score
    evaluation_feedback = Column(Text, nullable=True) # AI feedback
    
    user_task = relationship("UserTask", back_populates="submission")
