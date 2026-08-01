import { generateId } from '../../../utils/id'
import type {
  AgentQuizDifficulty,
  CourseContext,
  LearningObjectivesResult,
  QuizzesResult,
} from '../../../types/agent'
import type { DomainPack } from '../domainPacks/types'
import { pick } from './helpers'

const DIFFICULTY_CYCLE: AgentQuizDifficulty[] = ['기초', '보통', '심화']

export function runStep08Quizzes(
  context: CourseContext,
  pack: DomainPack,
  objectivesResult: LearningObjectivesResult,
): QuizzesResult {
  const objectives = objectivesResult.objectives
  const items: QuizzesResult['items'] = []

  // OX 3문항
  for (let i = 0; i < 3; i += 1) {
    const concept = pick(pack.coreConcepts, i)
    const isTrue = i % 2 === 0
    const wrongConcept = pick(pack.coreConcepts, i + 3)
    items.push({
      id: generateId('q'),
      type: 'OX',
      difficulty: pick(DIFFICULTY_CYCLE, i),
      question: isTrue
        ? `${concept}은(는) ${context.courseName} 수업에서 다루는 핵심 개념이다.`
        : `${concept}은(는) ${wrongConcept}와(과) 완전히 동일한 개념이며 구분할 필요가 없다.`,
      answer: isTrue ? 'O' : 'X',
      explanation: isTrue
        ? `${concept}은(는) 이 과목의 핵심 개념 중 하나로 명시적으로 다룬다.`
        : `${concept}과(와) ${wrongConcept}은(는) 서로 다른 개념으로, 혼동하지 않도록 구분해서 학습해야 한다.`,
      relatedObjectiveId: pick(objectives, i).id,
    })
  }

  // 객관식 4문항
  for (let i = 0; i < 4; i += 1) {
    const concept = pick(pack.coreConcepts, i)
    const distractors = [pick(pack.coreConcepts, i + 1), pick(pack.coreConcepts, i + 2), pick(pack.coreConcepts, i + 3)]
    const options = [
      `${concept}의 핵심 정의와 특징에 부합하는 설명`,
      `${distractors[0]}에 대한 설명(오답)`,
      `${distractors[1]}에 대한 설명(오답)`,
      `${distractors[2]}에 대한 설명(오답)`,
    ]
    items.push({
      id: generateId('q'),
      type: '객관식',
      difficulty: pick(DIFFICULTY_CYCLE, i),
      question: `다음 중 '${concept}'에 대한 설명으로 가장 적절한 것은?`,
      options,
      answer: options[0],
      explanation: `${concept}의 정의를 정확히 이해했는지 확인하는 문항이다. 나머지 보기는 다른 핵심 개념에 대한 설명이다.`,
      relatedObjectiveId: pick(objectives, i + 1).id,
    })
  }

  // 단답형 3문항
  for (let i = 0; i < 3; i += 1) {
    const concept = pick(pack.coreConcepts, i + 4)
    items.push({
      id: generateId('q'),
      type: '단답형',
      difficulty: pick(DIFFICULTY_CYCLE, i),
      question: `'${concept}'이(가) 무엇인지 한두 문장으로 설명하시오.`,
      answer: concept,
      explanation: `${concept}의 정의와 ${context.courseName}에서의 역할을 포함해 채점한다.`,
      relatedObjectiveId: pick(objectives, i + 2).id,
    })
  }

  // 사례형 3문항
  for (let i = 0; i < 3; i += 1) {
    const scenario = pick(pack.caseScenarioPool, i)
    items.push({
      id: generateId('q'),
      type: '사례형',
      difficulty: '심화',
      question: `다음 사례를 읽고 ${context.courseName}에서 배운 개념을 활용해 어떻게 대응할지 서술하시오.\n\n[사례] ${scenario}`,
      answer: '교수자 채점 기준(루브릭)에 따른 서술형 채점',
      explanation: `${pick(pack.coreConcepts, i)} 개념을 실제 상황에 적용하는 능력을 평가하는 문항이다.`,
      relatedObjectiveId: pick(objectives, i + 3).id,
    })
  }

  return { items }
}
