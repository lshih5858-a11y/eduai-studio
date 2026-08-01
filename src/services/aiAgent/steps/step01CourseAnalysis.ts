import type { CourseAnalysisResult, CourseContext } from '../../../types/agent'
import type { DomainPack } from '../domainPacks/types'

export function runStep01CourseAnalysis(context: CourseContext, pack: DomainPack): CourseAnalysisResult {
  return {
    courseNature: pack.courseNatureTemplate,
    studentCharacteristics: `${context.grade} · ${context.studentLevel} 학생 대상. ${pack.studentCharacteristics}`,
    prerequisites: pack.prerequisitesPool.join(', '),
    coreConcepts: pack.coreConcepts,
    difficulties: pack.difficultiesPool,
    aiApplicability: `${pack.aiApplicability} (설정된 AI 활용 수준: ${context.aiUsageLevel})`,
    instructorJudgmentNeeded: pack.instructorJudgmentPool,
  }
}
