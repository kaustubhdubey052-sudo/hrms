from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/attendance",
    tags=["attendance"]
)

@router.get("/", response_model=List[schemas.Attendance])
def get_all_attendance(db: Session = Depends(get_db)):
    return db.query(models.Attendance).order_by(models.Attendance.date.desc()).all()

@router.post("/", response_model=schemas.Attendance, status_code=status.HTTP_201_CREATED)
def mark_attendance(attendance: schemas.AttendanceCreate, db: Session = Depends(get_db)):
    employee = db.query(models.Employee).filter(models.Employee.id == attendance.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    db_attendance = db.query(models.Attendance).filter(
        models.Attendance.employee_id == attendance.employee_id,
        models.Attendance.date == attendance.date
    ).first()
    
    if db_attendance:
        raise HTTPException(status_code=400, detail="Attendance already marked for this date")
        
    new_attendance = models.Attendance(**attendance.model_dump())
    db.add(new_attendance)
    db.commit()
    db.refresh(new_attendance)
    return new_attendance

@router.get("/{employee_id}", response_model=List[schemas.Attendance])
def get_attendance(employee_id: int, db: Session = Depends(get_db)):
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    return db.query(models.Attendance).filter(models.Attendance.employee_id == employee_id).all()