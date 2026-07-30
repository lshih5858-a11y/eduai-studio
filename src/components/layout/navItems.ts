import {
  BookOpenCheck,
  CalendarRange,
  ClipboardList,
  GraduationCap,
  Home,
  MessageCircleQuestion,
  Settings as SettingsIcon,
  Sparkles,
  Table2,
} from 'lucide-react'
import type { MenuKey } from '../../types'

export interface NavItem {
  key: MenuKey
  label: string
  icon: typeof Home
}

export const navItems: NavItem[] = [
  { key: 'home', label: '홈', icon: Home },
  { key: 'courseSetup', label: '과목 설정', icon: GraduationCap },
  { key: 'weeklyPlan', label: '16주 수업설계', icon: CalendarRange },
  { key: 'quiz', label: '퀴즈 생성기', icon: BookOpenCheck },
  { key: 'rubric', label: '루브릭 생성기', icon: Table2 },
  { key: 'feedback', label: '과제 피드백', icon: ClipboardList },
  { key: 'aiTutor', label: 'AI 튜터', icon: Sparkles },
  { key: 'settings', label: '설정 및 사용 안내', icon: SettingsIcon },
]

export const questionIcon = MessageCircleQuestion
