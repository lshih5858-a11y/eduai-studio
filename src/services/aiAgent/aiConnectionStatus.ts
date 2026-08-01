import type { AiConnectionStatus } from '../../types/agent'

// 실제 AI 모델 호출 가능 여부를 진단하는 단일 지점.
// 이 배포(순수 정적 프런트엔드, 백엔드·API 키 없음)에서는 항상 시범 모드를 반환한다.
// 향후 실제 AI 엔드포인트가 연결되면 이 함수 하나만 교체하면 되도록 서비스 계층을 분리했다.
export function getAiConnectionStatus(): AiConnectionStatus {
  return {
    connected: false,
    label: '교육용 시범 모드',
  }
}
