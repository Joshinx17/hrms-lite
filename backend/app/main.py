from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List
from sqlalchemy import create_engine, Column, Integer, String, Date
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import date

# -----------------------
# DATABASE SETUP
# -----------------------

DATABASE_URL = "sqlite:///./hrms.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()

# -----------------------
# DATABASE MODELS
# -----------------------

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, unique=True, index=True)
    full_name = Column(String)
    email = Column(String, unique=True)
    department = Column(String)


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String)
    date = Column(Date)
    status = Column(String)


Base.metadata.create_all(bind=engine)

# -----------------------
# APP INIT
# -----------------------

app = FastAPI(title="HRMS Lite API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------
# SCHEMAS (VALIDATION)
# -----------------------

class EmployeeCreate(BaseModel):
    employee_id: str
    full_name: str
    email: EmailStr
    department: str


class AttendanceCreate(BaseModel):
    employee_id: str
    date: date
    status: str  # Present / Absent

# -----------------------
# EMPLOYEE APIs
# -----------------------

@app.post("/employees")
def add_employee(employee: EmployeeCreate):
    db = SessionLocal()

    # Check duplicate employee ID
    existing_id = db.query(Employee).filter(Employee.employee_id == employee.employee_id).first()
    if existing_id:
        raise HTTPException(status_code=409, detail="Employee ID already exists")

    # Check duplicate email
    existing_email = db.query(Employee).filter(Employee.email == employee.email).first()
    if existing_email:
        raise HTTPException(status_code=409, detail="Email already exists")

    new_employee = Employee(
        employee_id=employee.employee_id,
        full_name=employee.full_name,
        email=employee.email,
        department=employee.department
    )

    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)
    db.close()

    return {"message": "Employee added successfully"}


@app.get("/employees")
def get_employees():
    db = SessionLocal()
    employees = db.query(Employee).all()

    result = []
    for emp in employees:
        result.append({
            "id": emp.id,
            "employee_id": emp.employee_id,
            "full_name": emp.full_name,
            "email": emp.email,
            "department": emp.department
        })

    db.close()
    return result


@app.delete("/employees/{employee_id}")
def delete_employee(employee_id: str):
    db = SessionLocal()
    employee = db.query(Employee).filter(Employee.employee_id == employee_id).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    db.delete(employee)
    db.commit()
    db.close()

    return {"message": "Employee deleted successfully"}

# -----------------------
# ATTENDANCE APIs
# -----------------------

@app.post("/attendance")
def mark_attendance(attendance: AttendanceCreate):
    db = SessionLocal()

    # Check if employee exists
    employee = db.query(Employee).filter(Employee.employee_id == attendance.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee does not exist")
        
    # Prevent duplicate attendance on same day
    existing_attendance = db.query(Attendance).filter(
        Attendance.employee_id == attendance.employee_id,
        Attendance.date == attendance.date
    ).first()

    if existing_attendance:
        raise HTTPException(
            status_code=409,
            detail="Attendance already marked for this employee on this date"
        )

    record = Attendance(
        employee_id=attendance.employee_id,
        date=attendance.date,
        status=attendance.status
    )

    db.add(record)
    db.commit()
    db.close()

    return {"message": "Attendance marked successfully"}


@app.get("/attendance/{employee_id}")
def get_attendance(employee_id: str):
    db = SessionLocal()
    records = db.query(Attendance).filter(
        Attendance.employee_id == employee_id
    ).all()

    result = [
        {
            "date": record.date.isoformat(),
            "status": record.status
        }
        for record in records
    ]

    db.close()
    return result
    
@app.get("/")
def root():
    return {"message": "Backend is running"}    