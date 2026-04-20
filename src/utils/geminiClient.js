import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
let chatSession = null;

function getClient() {
  if (!API_KEY) return null;
  if (!genAI) genAI = new GoogleGenerativeAI(API_KEY);
  return genAI;
}

const SYSTEM_PROMPT = `당신은 간호 실습 시뮬레이션에서 심정지 환자 '김철수(65세 남성)'의 상태를 묘사하는 의료 시뮬레이션 내레이터입니다.

규칙:
1. 임상적으로 정확한 환자 반응을 2-3문장으로 묘사하세요.
2. 의식이 없는 경우(GCS 3-5) 환자의 말은 없고, 신체·생리적 반응만 묘사하세요.
3. 의식이 일부 돌아오는 경우(GCS 6+) 짧은 신음 소리나 한두 마디를 포함할 수 있습니다.
4. 반드시 한국어로 응답하세요.
5. 의료 상황을 사실적이고 생동감 있게 묘사하여 학생이 임상 현장감을 느낄 수 있도록 하세요.
6. 학생의 처치가 잘못된 경우, 환자 상태 악화나 위험 징후를 묘사하세요.`;

const MOCK_RESPONSES = {
  check_safety: '주변 환경이 안전합니다. 바닥에 쓰러진 65세 남성이 보입니다. 얼굴색이 창백하고 움직임이 없습니다.',
  check_consciousness: '어깨를 두드리고 크게 불러보았지만 전혀 반응이 없습니다. 눈은 감겨 있고 근육이 완전히 이완되어 있습니다.',
  call_119: '119 상황실: "현재 구급차가 출동했습니다. CPR을 시작하세요." 주변 손님이 AED를 찾으러 달려갑니다.',
  check_pulse_breath: '경동맥에서 맥박이 전혀 촉지되지 않습니다. 흉부의 움직임이 없고 코와 입에서 호흡 소리가 들리지 않습니다. 심정지 상태입니다.',
  request_aed: '직원이 AED를 들고 뛰어오고 있습니다. "AED 가져왔습니다!"라고 외치는 소리가 들립니다.',
  chest_compression: '가슴이 5-6cm 깊이로 규칙적으로 눌리고 있습니다. 매 압박 후 흉벽이 완전히 이완됩니다. 분당 110회의 리듬으로 진행됩니다.',
  rescue_breathing: '머리 젖히기-턱 들기로 기도가 열립니다. 인공호흡 시 흉부가 부풀어 오르는 것이 확인됩니다.',
  defibrillation: '"쇼크가 권장됩니다!" AED 음성 안내가 울립니다. 제세동 후 환자 몸이 순간적으로 경직됩니다. 심장 리듬이 서서히 변화하고 있습니다!',
  cpr_continue: 'CPR 재개 후 2분이 경과합니다. 경동맥에서 약한 맥박이 촉지되기 시작합니다. ROSC 징후입니다!',
  reassess_vitals: '혈압 108/68mmHg, 맥박 84회/분, SpO₂ 93%. 활력징후가 안정되어 가고 있습니다.',
  recovery_position: '환자가 좌측 측위로 안전하게 위치가 변경되었습니다. 기도가 확보된 상태입니다.',
  assess_consciousness: '이름을 부르자 눈꺼풀이 약간 떨립니다. "으음..." 하는 작은 신음 소리가 납니다. GCS 7점으로 의식이 회복 중입니다.',
  oxygen_therapy: '산소 마스크 적용 후 SpO₂가 93%→96%로 상승합니다. 얼굴색이 점차 핑크빛으로 개선됩니다.',
  prepare_transfer: '119 구급대에게 처치 내용이 인계되었습니다. 환자는 척추 고정 후 들것에 안전하게 이송 준비가 완료되었습니다.',
};

export function initGeminiChat(scenario) {
  const client = getClient();
  if (!client) {
    chatSession = null;
    return;
  }
  const model = client.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: SYSTEM_PROMPT,
  });
  chatSession = model.startChat({
    history: [],
    generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
  });
}

export async function getPatientResponse(actionData, vitals, stage) {
  if (!chatSession) {
    return MOCK_RESPONSES[actionData.id] || actionData.patientReaction || '환자 반응을 처리하는 중입니다...';
  }

  const prompt = `현재 단계: ${stage}
환자 활력징후: 맥박 ${vitals.heartRate || 0}회/분, SpO₂ ${vitals.spO2 || 0}%, 혈압 ${vitals.bloodPressure}, 의식 ${vitals.consciousness}
학생이 방금 수행한 처치: ${actionData.label} (${actionData.description})
처치 정확성: ${actionData.isCorrect ? '올바른 처치' : '부적절한 처치'}

위 상황에서 환자의 반응을 묘사해 주세요.`;

  try {
    const result = await chatSession.sendMessage(prompt);
    return result.response.text();
  } catch {
    return MOCK_RESPONSES[actionData.id] || actionData.patientReaction || '환자 반응을 처리하는 중입니다...';
  }
}
