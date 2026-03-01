from pydantic import BaseModel, EmailStr
from datetime import date
from .models import AttendanceStatus

class EmployeeBase(BaseModel):
    full_name: str
    email_address: EmailStr
    department: str

class EmployeeCreate(EmployeeBase):
    pass

class Employee(EmployeeBase):
    id: int

    class Config:
        from_attributes = True

class AttendanceBase(BaseModel):
    date: date
    status: AttendanceStatus

class AttendanceCreate(AttendanceBase):
    employee_id: int

class Attendance(AttendanceBase):
    id: int
    employee_id: int

    class Config:
        from_attributes = True