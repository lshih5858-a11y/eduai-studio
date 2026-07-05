import { useState } from 'react'
import Header, { type Section } from './components/Header'
import Dashboard from './components/Dashboard'
import InvestorProfile from './components/InvestorProfile'
import StockLearningCards from './components/StockLearningCards'
import VirtualStockMarket from './components/VirtualStockMarket'
import PortfolioSimulator from './components/PortfolioSimulator'
import InvestmentChecklist from './components/InvestmentChecklist'
import QuizSection from './components/QuizSection'
import AiCoach from './components/AiCoach'
import ReportGenerator from './components/ReportGenerator'
import TeacherDemoPoints from './components/TeacherDemoPoints'
import { AppStateProvider } from './context/AppStateContext'

function SectionView({ section, onNavigate }: { section: Section; onNavigate: (s: Section) => void }) {
  switch (section) {
    case 'dashboard':
      return <Dashboard onNavigate={onNavigate} />
    case 'profile':
      return <InvestorProfile />
    case 'lessons':
      return <StockLearningCards />
    case 'market':
      return <VirtualStockMarket />
    case 'portfolio':
      return <PortfolioSimulator />
    case 'checklist':
      return <InvestmentChecklist />
    case 'quiz':
      return <QuizSection />
    case 'coach':
      return <AiCoach />
    case 'report':
      return <ReportGenerator />
  }
}

function AppShell() {
  const [section, setSection] = useState<Section>('dashboard')

  return (
    <div className="min-h-screen bg-slate-50">
      <Header activeSection={section} onNavigate={setSection} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <SectionView section={section} onNavigate={setSection} />
      </main>
      <footer className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
        <TeacherDemoPoints />
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <AppStateProvider>
      <AppShell />
    </AppStateProvider>
  )
}
