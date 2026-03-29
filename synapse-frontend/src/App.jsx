import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Pages — Public
import LandingPage   from './pages/LandingPage'
import LoginPage     from './pages/LoginPage'
import SignupPage    from './pages/SignupPage'

// Pages — Teacher
import TeacherDashboard    from './pages/teacher/TeacherDashboard'
import ClassroomManagement from './pages/teacher/ClassroomManagement'
import UploadContent       from './pages/teacher/UploadContent'
import AIQuizGenerator     from './pages/teacher/AIQuizGenerator'
import RealTestMarks       from './pages/teacher/RealTestMarks'
import StudentAnalytics    from './pages/teacher/StudentAnalytics'

// Pages — Student
import StudentDashboard    from './pages/student/StudentDashboard'
import ClassroomView       from './pages/student/ClassroomView'
import LearningDashboard   from './pages/student/LearningDashboard'
import NotesRefiner        from './pages/student/NotesRefiner'
import QuizPage            from './pages/student/QuizPage'
import QuizzesPage         from './pages/student/QuizzesPage'
import ChatbotPage         from './pages/student/ChatbotPage'
import MistakeCorner       from './pages/student/MistakeCorner'
import ForumPage           from './pages/student/ForumPage'
import FriendsLeaderboard  from './pages/student/FriendsLeaderboard'

// Pages — Shared
import ProfilePage  from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'

/* ── Protected Route Wrappers ── */
function ProtectedRoute({ children, requiredRole }) {
  const { firebaseUser, userProfile, loading } = useAuth()

  if (loading) return (
    <div className="flex items-center justify-center h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-transparent border-t-cyan-accent rounded-full animate-spin"
             style={{ borderTopColor: 'var(--cyan)' }} />
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading Synapse...</p>
      </div>
    </div>
  )

  if (!firebaseUser) return <Navigate to="/login" replace />
  if (requiredRole && userProfile?.role !== requiredRole) {
    return <Navigate to={userProfile?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'} replace />
  }
  return children
}

export default function App() {
  useEffect(() => {
    const saved = localStorage.getItem('synapse_theme')
    if (saved === 'light') document.documentElement.classList.add('light-theme')
  }, [])

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"       element={<LandingPage />} />
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Teacher */}
          <Route path="/teacher/dashboard"         element={<ProtectedRoute requiredRole="teacher"><TeacherDashboard /></ProtectedRoute>} />
          <Route path="/teacher/classroom/:id"     element={<ProtectedRoute requiredRole="teacher"><ClassroomManagement /></ProtectedRoute>} />
          <Route path="/teacher/upload"            element={<ProtectedRoute requiredRole="teacher"><UploadContent /></ProtectedRoute>} />
          <Route path="/teacher/quiz-generator"    element={<ProtectedRoute requiredRole="teacher"><AIQuizGenerator /></ProtectedRoute>} />
          <Route path="/teacher/marks"             element={<ProtectedRoute requiredRole="teacher"><RealTestMarks /></ProtectedRoute>} />
          <Route path="/teacher/analytics"         element={<ProtectedRoute requiredRole="teacher"><StudentAnalytics /></ProtectedRoute>} />

          {/* Student */}
          <Route path="/student/dashboard"         element={<ProtectedRoute requiredRole="student"><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/classroom/:id"     element={<ProtectedRoute requiredRole="student"><ClassroomView /></ProtectedRoute>} />
          <Route path="/student/learn"             element={<ProtectedRoute requiredRole="student"><LearningDashboard /></ProtectedRoute>} />
          <Route path="/student/notes"             element={<ProtectedRoute requiredRole="student"><NotesRefiner /></ProtectedRoute>} />
          <Route path="/student/quiz/:quizId"      element={<ProtectedRoute requiredRole="student"><QuizPage /></ProtectedRoute>} />
          <Route path="/student/quizzes"           element={<ProtectedRoute requiredRole="student"><QuizzesPage /></ProtectedRoute>} />
          <Route path="/student/chatbot"           element={<ProtectedRoute requiredRole="student"><ChatbotPage /></ProtectedRoute>} />
          <Route path="/student/mistakes"          element={<ProtectedRoute requiredRole="student"><MistakeCorner /></ProtectedRoute>} />
          <Route path="/student/forum/:classroomId" element={<ProtectedRoute requiredRole="student"><ForumPage /></ProtectedRoute>} />
          <Route path="/student/social"            element={<ProtectedRoute requiredRole="student"><FriendsLeaderboard /></ProtectedRoute>} />

          {/* Shared — Profile & Settings (both roles) */}
          <Route path="/profile"  element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
