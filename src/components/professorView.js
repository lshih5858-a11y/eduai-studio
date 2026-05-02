App.register('professor', function (el) {
  const MATERIALS = [
    {
      title: '16주차 수업계획서',
      desc: '주제·목표·개념·실습·AI도구·과제·평가 전체 포함',
      icon: '📅',
      getText: () => CURRICULUM.map(w =>
        `[${w.week}주차] ${w.topic}\n목표: ${w.goal}\n핵심개념: ${w.concepts.join(', ')}\n실습: ${w.practice}\nAI도구: ${w.aiTools.join(', ')}\n과제: ${w.assignment}\n평가: ${w.evaluation}`
      ).join('\n\n'),
    },
    {
      title: '주차별 실습지 (전체)',
      desc: '각 주차 실습활동 안내문 전체',
      icon: '📋',
      getText: () => CURRICULUM.map(w =>
        `【${w.week}주차 실습지】\n주제: ${w.topic}\n실습활동: ${w.practice}\n사용 AI도구: ${w.aiTools.join(', ')}\n\n[실습 과정]\n1. 오늘의 핵심 개념 확인 (${w.concepts.slice(0,2).join(', ')})\n2. ${w.practice}\n3. AI 도구(${w.aiTools[0]}) 활용하여 결과 정리\n4. 동료 피드백 및 발표`
      ).join('\n\n─────────────────\n\n'),
    },
    {
      title: 'AI 도구별 프롬프트북',
      desc: 'GPT·Gamma·Napkin·Genspark·Gemini·NotebookLM·Perplexity 예시 프롬프트',
      icon: '🤖',
      getText: () => AI_TOOLS.map(t =>
        `【${t.name}】\n역할: ${t.tagline}\n\n${t.prompts.map((p,i) => `예시 ${i+1} - ${p.title}\n${p.text}`).join('\n\n')}`
      ).join('\n\n═══════════════════\n\n'),
    },
    {
      title: '운동처방 과제 양식',
      desc: '대상자 분석부터 4주 관리계획까지 포함한 양식',
      icon: '🏋️',
      getText: () =>
`[운동처방 과제 양식]

1. 대상자 기본정보
   - 나이/성별:
   - 신장/체중/BMI:
   - 운동경험:
   - 건강위험요인:

2. 운동목표
   - 단기(4주):
   - 장기(12주):

3. 유산소 운동계획 (FITT)
   - 빈도(F): 주   회
   - 강도(I): 목표심박수     bpm (최대심박수의   %)
   - 시간(T): 회당    분
   - 유형(T):

4. 저항운동 계획
   - 빈도: 주   회
   - 강도: 1RM의   %
   - 운동 구성:
   - 세트/반복:

5. 유연성 운동계획
   - 빈도:
   - 방법:
   - 주요 부위:

6. 안전주의사항

7. 4주 운동관리표
   1주차:
   2주차:
   3주차:
   4주차:

⚠️ 본 양식은 교육용이며, 실제 질환자 처방은 전문가 상담이 필요합니다.`,
    },
    {
      title: '체력평가 체크리스트',
      desc: '8개 체력요소 평가 항목 및 측정방법 체크리스트',
      icon: '📊',
      getText: () =>
`[체력평가 체크리스트]

대상자 이름:            날짜:

□ 심폐지구력
  측정방법: 12분 달리기 / 3분 스텝 테스트 / 셔틀런
  측정값: ________  평가: 우수 / 보통 / 부족

□ 근력
  측정방법: 악력계 / 추정 1RM
  측정값: ________  평가: 우수 / 보통 / 부족

□ 근지구력
  측정방법: 1분 윗몸일으키기 / 팔굽혀펴기
  측정값: ________  평가: 우수 / 보통 / 부족

□ 유연성
  측정방법: 좌전굴 검사
  측정값: ________  평가: 우수 / 보통 / 부족

□ 신체조성
  측정방법: BIA (인바디) / BMI
  BMI: ______  체지방률: ______  평가: 정상 / 과체중 / 비만

□ 균형능력
  측정방법: 외발서기 (눈 뜨고/감고)
  측정값: ________  평가: 우수 / 보통 / 부족

□ 자세평가
  이상소견: 전방머리자세 / 둥근어깨 / 요추전만 / 해당없음

□ 생활습관
  주당 운동일수: ____  수면시간: ____  앉아있는 시간: ____

종합 소견:

⚠️ 본 체크리스트는 교육용이며 의학적 진단을 대체하지 않습니다.`,
    },
    {
      title: '중간·기말 퀴즈 예시',
      desc: 'OX·객관식·단답형 퀴즈 예시 모음',
      icon: '❓',
      getText: () => {
        const ox = QUIZZES.ox.map((q,i) => `OX ${i+1}. ${q.q}\n정답: ${q.a} / 해설: ${q.explain}`).join('\n');
        const mc = QUIZZES.mc.map((q,i) => `객관식 ${i+1}. ${q.q}\n${q.options.map((o,j)=>`${j+1}) ${o}`).join('  ')}\n정답: ${q.a+1}번 / 해설: ${q.explain}`).join('\n\n');
        const sh = QUIZZES.short.map((q,i) => `단답형 ${i+1}. ${q.q}\n정답: ${q.a}`).join('\n');
        return `[중간·기말 퀴즈 예시]\n\n■ OX형\n${ox}\n\n■ 객관식\n${mc}\n\n■ 단답형\n${sh}`;
      },
    },
    {
      title: '발표평가 루브릭',
      desc: '팀 프로젝트 발표 5개 항목 100점 만점 루브릭',
      icon: '📈',
      getText: () => {
        const items = RUBRIC_PRESENTATION.items.map(item =>
          `[${item.criterion} - ${item.score}점]\n우수: ${item.levels.excellent}\n양호: ${item.levels.good}\n보통: ${item.levels.average}\n미흡: ${item.levels.poor}`
        ).join('\n\n');
        return `[발표평가 루브릭 - 총 100점]\n\n${items}`;
      },
    },
    {
      title: '학생용 안내문',
      desc: '플랫폼 사용 방법 및 AI 도구 활용 안내',
      icon: '📄',
      getText: () =>
`[EduAI Exercise Health Designer - 학생 사용 안내문]

안녕하세요! 운동건강관리과 AI 기반 수업 플랫폼에 오신 것을 환영합니다.

■ 이 플랫폼에서 할 수 있는 것
1. 16주차 수업계획 확인 (주제·목표·과제·평가 방법)
2. AI 도구별 활용 방법과 예시 프롬프트 확인
3. 운동처방 실습 (가상 대상자 운동처방안 작성)
4. 건강·체력 평가 개념 학습
5. AI 튜터를 통한 개념 설명·과제 도움·퀴즈 풀기

■ AI 도구 활용 방법
• GPT: 개념 설명, 과제 초안 작성, 보고서 피드백
• Gamma: 발표자료, 카드뉴스 제작
• Napkin: 개념도, 흐름도, 인포그래픽
• Genspark: 가상 사례 생성, 시나리오 작성
• Gemini: 퀴즈 생성, 비교표 작성
• NotebookLM: 교재·논문 기반 학습 정리
• Perplexity: 최신 동향 및 사례 조사

■ 주의사항
• AI가 생성한 내용은 반드시 교재·수업 내용과 교차 확인하세요.
• 건강·운동 관련 정보는 교육용 예시이며 의학적 조언이 아닙니다.
• 질환이 있거나 건강 이상이 있는 경우 반드시 전문가와 상담하세요.

EduAI Studio 연구소 | 전공 맞춤형 AI 수업설계 플랫폼`,
    },
    {
      title: 'Custom GPT 지식탭 JSON',
      desc: 'Custom GPT 지식탭에 업로드할 수업 데이터 JSON 구조',
      icon: '🔧',
      getText: () => JSON.stringify({
        title: 'EduAI Exercise Health Designer',
        description: '운동건강관리과 AI 기반 16주차 수업설계 플랫폼 지식 데이터',
        curriculum: CURRICULUM.map(w => ({
          week: w.week,
          topic: w.topic,
          goal: w.goal,
          concepts: w.concepts,
          practice: w.practice,
          aiTools: w.aiTools,
          assignment: w.assignment,
          evaluation: w.evaluation,
        })),
        rubrics: {
          prescription: RUBRIC_PRESCRIPTION,
          presentation: RUBRIC_PRESENTATION,
        },
      }, null, 2),
    },
  ];

  const cards = MATERIALS.map((m, i) => `
    <div class="print-card">
      <div class="print-card-info">
        <div class="print-card-title">${m.icon} ${m.title}</div>
        <div class="print-card-desc">${m.desc}</div>
      </div>
      <button class="btn btn-primary btn-sm" onclick="copyMaterial(${i})">📋 복사</button>
    </div>
  `).join('');

  el.innerHTML = `
    <p class="page-title">🖨️ 교수자용 출력자료</p>
    <p class="page-subtitle">수업에서 바로 사용할 수 있는 자료를 복사하여 활용하세요.</p>

    <div class="notice notice-info mb-24">
      💡 각 자료의 <strong>"복사"</strong> 버튼을 누르면 내용이 클립보드에 복사됩니다. 문서 편집기에 붙여넣어 사용하세요.
    </div>

    <div style="display:flex;flex-direction:column;gap:12px">${cards}</div>

    <div class="notice notice-warn mt-24">
      ⚠️ 본 자료는 교육용 예시입니다. 실제 수업에서 사용할 때는 학과 상황에 맞게 수정하여 사용하시기 바랍니다.
    </div>
  `;

  window.copyMaterial = function (i) {
    copyToClipboard(MATERIALS[i].getText());
  };
});
