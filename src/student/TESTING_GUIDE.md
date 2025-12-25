# Student System Testing Guide

## How to See the Student UI Screens

### 1. Prerequisites
Make sure your backend server is running with the student endpoints:
```bash
cd backend
python evaluation_server.py
```

### 2. Database Setup
Create a `students` table in your Supabase database:

```sql
CREATE TABLE students (
    student_id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT,
    password TEXT,
    class TEXT,
    department TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample data
INSERT INTO students (student_id, name, email, password, class, department) VALUES
('STU001', 'John Doe', 'john@example.com', 'password123', '10A', 'Science'),
('STU002', 'Jane Smith', 'jane@example.com', 'password123', '10B', 'Arts');
```

### 3. Frontend Setup
Make sure your frontend is running:
```bash
cd frontend
npm install
npm run dev
```

### 4. Access Student Pages

#### Student Login Page
Navigate to: `http://localhost:5173/student-login`

**Test Credentials:**
- Student ID: `STU001`
- Password: `password123`

#### Student Dashboard
After successful login, you'll be redirected to: `http://localhost:5173/student-dashboard`

### 5. Available Features

#### Navigation Menu
- **Dashboard** - Overview with stats and quick actions
- **Quiz** - Available exams and quizzes
- **Reports** - Academic results and performance
- **Timetable** - Class schedule with weekly navigation
- **Profile** - Student information management

#### Features in Each Section

**Dashboard:**
- Academic statistics cards
- Quick action buttons
- Welcome message

**Quiz:**
- List of available and completed exams
- Quiz details (questions, marks, grade system)
- Status indicators

**Reports:**
- Summary statistics
- Detailed results table
- Performance feedback modal
- Grade visualization

**Timetable:**
- Weekly class schedule
- Week navigation
- Color-coded subjects
- Class details (time, teacher, room)

**Profile:**
- View/edit student information
- Academic summary
- Profile completion tracking

### 6. API Endpoints Available

The following student endpoints are available:
- `POST /student-login` - Student authentication
- `GET /student-results` - Get exam results
- `GET /student-profile` - Get student profile
- `GET /student-quizzes` - Get available quizzes
- `GET /student-auth-test` - Test authentication

### 7. File Structure

```
frontend/src/student/
├── components/
│   ├── StudentLogin.tsx
│   ├── StudentDashboard.tsx
│   ├── StudentQuizzes.tsx
│   ├── StudentReports.tsx
│   ├── StudentTimetable.tsx
│   └── StudentProfile.tsx
└── README.md
```

### 8. Authentication Flow

1. Student enters credentials on `/student-login`
2. Backend validates against `students` table
3. Returns token in format `student:{student_id}`
4. Token stored in localStorage
5. All subsequent API calls use this token
6. Logout clears token and redirects to login

### 9. Sample Data for Testing

You can add more test students:
```sql
INSERT INTO students (student_id, name, email, password, class, department) VALUES
('STU003', 'Alice Johnson', 'alice@example.com', 'password123', '11A', 'Mathematics'),
('STU004', 'Bob Wilson', 'bob@example.com', 'password123', '11B', 'Physics');
```

The student system is now fully integrated and ready for testing!