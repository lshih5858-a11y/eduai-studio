import type { ExampleCoursePackage, WeekPlan } from '../types'
import { serviceManagementPackage } from './serviceManagement'
import { nursingPackage } from './nursing'

export const examplePackages: ExampleCoursePackage[] = [serviceManagementPackage, nursingPackage]

export { serviceManagementPackage, nursingPackage }

// 과목 설정만 되어 있고 수업설계가 비어 있을 때 16주 기본 틀을 자동 생성한다.
export function generateBlankWeeklyPlan(): WeekPlan[] {
  return Array.from({ length: 16 }, (_, index) => {
    const week = index + 1
    if (week === 8 || week === 9) {
      return {
        week,
        topic: '중간고사 및 중간 점검',
        objectives: '학기 전반부 학습 내용을 종합적으로 점검한다.',
        keyConcepts: '1~7주차 핵심 개념 통합',
        teachingActivities: '중간고사 시행 및 성과 피드백',
        studentActivities: '중간고사 응시',
        aiUsage: 'AI로 오답 유형 분석(교수자 검토 후 활용)',
        assignment: '중간고사 오답 정리',
        evaluationMethod: '중간고사(지필)',
      }
    }
    if (week === 16) {
      return {
        week,
        topic: '종합 정리 및 기말 평가',
        objectives: '학기 전체 학습 내용을 통합하여 정리한다.',
        keyConcepts: '전체 단원 통합',
        teachingActivities: '기말 평가 시행 및 학기 총평',
        studentActivities: '기말 평가 응시 및 학기 성찰 작성',
        aiUsage: 'AI로 학습 성찰 정리 도우미(교수자 검토 후 활용)',
        assignment: '학기 성찰 보고서 제출',
        evaluationMethod: '기말고사(지필)',
      }
    }
    return {
      week,
      topic: `${week}주차 주제를 입력하세요`,
      objectives: '',
      keyConcepts: '',
      teachingActivities: '',
      studentActivities: '',
      aiUsage: '',
      assignment: '',
      evaluationMethod: '',
    }
  })
}
