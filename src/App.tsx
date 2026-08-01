import { useState } from 'react'
import { ProjectDataProvider } from './context/ProjectDataContext'
import { AppShell } from './components/layout/AppShell'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { Home } from './pages/Home'
import { CourseSetup } from './pages/CourseSetup'
import { WeeklyPlan } from './pages/WeeklyPlan'
import { QuizGenerator } from './pages/QuizGenerator'
import { RubricGenerator } from './pages/RubricGenerator'
import { AssignmentFeedback } from './pages/AssignmentFeedback'
import { AITutor } from './pages/AITutor'
import { DesignAgent } from './pages/DesignAgent'
import { Settings } from './pages/Settings'
import type { MenuKey } from './types'

function AppContent() {
  const [active, setActive] = useState<MenuKey>('home')

  const renderPage = () => {
    switch (active) {
      case 'home':
        return <Home onNavigate={setActive} />
      case 'courseSetup':
        return <CourseSetup />
      case 'weeklyPlan':
        return <WeeklyPlan />
      case 'quiz':
        return <QuizGenerator />
      case 'rubric':
        return <RubricGenerator />
      case 'feedback':
        return <AssignmentFeedback />
      case 'aiTutor':
        return <AITutor />
      case 'designAgent':
        return <DesignAgent />
      case 'settings':
        return <Settings />
      default:
        return <Home onNavigate={setActive} />
    }
  }

  return (
    <AppShell active={active} onNavigate={setActive}>
      {renderPage()}
    </AppShell>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <ProjectDataProvider>
        <AppContent />
      </ProjectDataProvider>
    </ErrorBoundary>
  )
}

export default App
