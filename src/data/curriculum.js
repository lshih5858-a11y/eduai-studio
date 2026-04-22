export const GAMMA_LINKS = {
  3: "https://gamma.app/docs/10--ut4lkjpqo5cyhop?mode=doc",
  5: "https://gamma.app/docs/-rumwqo52cfyvua4?mode=doc",
  6: "https://gamma.app/docs/UI--ye8cfff9jr0kec3?mode=doc",
  7: "https://gamma.app/docs/-xputl3reew3m5pp?mode=doc",
  10: "https://gamma.app/docs/-0lzh4ofeednt708?mode=doc",
};

export const SUBMISSION_LINK = "https://www.genspark.ai/api/page_private?id=gsajwcfr";

export const WEEKS = [
  {
    week: 1,
    title: "OT: 수업 안내 및 AI 협업 개요",
    objective: "수업 구조와 AI 협업 방식을 이해하고 학습 환경을 설정한다.",
    topics: [
      "수업 목표 및 16주 로드맵 소개",
      "생성형 AI와 게임/VR 콘텐츠 개발의 연계",
      "AI 협업 윤리: 본인 작성 부분과 AI 생성 부분 주석 구분 필수",
      "과제 제출 방식 및 평가 기준 안내",
    ],
    aiTools: [{ name: "ChatGPT", purpose: "자기소개 및 학습 목표 초안 작성" }],
    practiceEnv: [],
    submissionNote: true,
    otNote: `📌 **[필수 공지] 레포트 및 과제 제출 링크**\n\n제출 주소: ${SUBMISSION_LINK}\n\n⚠️ **반드시** AI 협업 내용과 본인 작성 부분을 **주석으로 구분**해야 합니다.\n예시: \`// [AI 생성]\` / \`// [본인 작성]\``,
    samplePrompt: {
      role: "게임/VR 콘텐츠 개론 수강생",
      goal: "이번 학기 학습 목표를 명확히 정리",
      context: "게임 기획 또는 VR 개발에 관심 있는 대학생",
      format: "200자 이내 자기소개 + 3가지 학습 목표 불릿 형식",
    },
  },
  {
    week: 2,
    title: "게임/VR 콘텐츠 산업 이해",
    objective: "게임 및 VR 콘텐츠 산업의 현황과 트렌드를 파악한다.",
    topics: [
      "게임 산업의 역사와 현재 시장 규모",
      "VR/AR/MR/XR 기술 개요 및 차이점",
      "메타버스와 게임의 융합 트렌드",
      "주요 플랫폼(Steam, Meta Quest, PSVR) 분석",
    ],
    aiTools: [
      { name: "ChatGPT", purpose: "산업 리서치 요약 및 트렌드 분석 보고서 초안" },
      { name: "Perplexity AI", purpose: "최신 게임/VR 시장 데이터 검색" },
    ],
    practiceEnv: [],
    samplePrompt: {
      role: "게임/VR 산업 분석가 지망생",
      goal: "2024-2025년 VR 콘텐츠 시장 트렌드 분석",
      context: "메타버스, AI 연계 게임, 소셜 VR 플랫폼 중심",
      format: "트렌드 3가지를 각각 제목 + 설명 100자 + 예시 게임/서비스 형식으로",
    },
  },
  {
    week: 3,
    title: "AI 기반 게임 기획 및 스토리텔링",
    objective: "생성형 AI를 활용해 게임 세계관과 스토리를 기획한다.",
    topics: [
      "게임 스토리텔링의 구조 (3막 구조, 비선형 내러티브)",
      "AI 프롬프트 엔지니어링 기초 (R-G-C-F 원칙)",
      "ChatGPT로 게임 시나리오 초안 작성 실습",
      "Gamma로 기획서 시각화",
    ],
    aiTools: [
      { name: "ChatGPT", purpose: "게임 세계관 및 시나리오 생성" },
      { name: "Gamma", purpose: "기획서/스토리보드 슬라이드 제작" },
    ],
    practiceEnv: [],
    gammaLink: true,
    samplePrompt: {
      role: "인디 게임 스토리 작가",
      goal: "포스트 아포칼립스 VR 게임의 메인 시나리오 초안 작성",
      context: "플레이어는 생존자로 폐허 도시를 탐험하며 단서를 수집",
      format: "배경 설정 + 주인공 정보 + 3개의 챕터 개요 (각 150자 이내)",
    },
  },
  {
    week: 4,
    title: "AI 이미지 생성과 비주얼 컨셉 디자인",
    objective: "AI 이미지 도구로 게임 캐릭터, 배경, 아이템 컨셉 아트를 제작한다.",
    topics: [
      "AI 이미지 생성 도구 비교 (Dreamina, Midjourney, DALL-E)",
      "게임 컨셉 아트 프롬프트 작성법",
      "스타일 가이드와 일관성 유지 전략",
      "생성 이미지의 저작권 이슈",
    ],
    aiTools: [
      { name: "Dreamina", purpose: "캐릭터/배경 컨셉 아트 생성" },
      { name: "ChatGPT", purpose: "이미지 프롬프트 최적화" },
    ],
    practiceEnv: [],
    samplePrompt: {
      role: "게임 컨셉 아티스트",
      goal: "SF RPG 게임의 여주인공 캐릭터 컨셉 아트 프롬프트 생성",
      context: "사이버펑크 스타일, 미래 도시 배경, 해커 직업",
      format: "Dreamina용 영문 프롬프트 3가지 + 스타일 키워드 목록",
    },
  },
  {
    week: 5,
    title: "게임 UI/UX 기획 및 프로토타이핑",
    objective: "게임 인터페이스 설계 원칙을 이해하고 AI로 UI 기획서를 작성한다.",
    topics: [
      "게임 UI/UX의 핵심 원칙 (몰입감, 직관성, 피드백)",
      "HUD, 메뉴, 인벤토리 등 주요 UI 요소 분석",
      "AI로 UI 와이어프레임 아이디어 생성",
      "Gamma로 UI 기획 발표자료 제작",
    ],
    aiTools: [
      { name: "ChatGPT", purpose: "UI 구성 요소 아이디어 브레인스토밍" },
      { name: "Gamma", purpose: "UI/UX 기획 프레젠테이션 제작" },
    ],
    practiceEnv: [],
    gammaLink: true,
    samplePrompt: {
      role: "게임 UI/UX 디자이너",
      goal: "모바일 RPG 게임의 인벤토리 UI 개선안 기획",
      context: "10-25세 캐주얼 게이머, 터치 인터페이스 중심",
      format: "현재 문제점 3가지 + 개선 방향 3가지 + 레이아웃 설명 (텍스트)",
    },
  },
  {
    week: 6,
    title: "Figma로 게임 UI 프로토타입 제작",
    objective: "Figma를 활용해 실제 게임 UI 프로토타입을 제작한다.",
    topics: [
      "Figma 기본 기능 및 게임 UI 컴포넌트 라이브러리",
      "Auto Layout과 Variants로 반응형 UI 설계",
      "인터랙티브 프로토타이핑 (흐름 연결, 애니메이션)",
      "VR UI 설계 시 고려사항 (시야각, 거리감)",
    ],
    aiTools: [
      { name: "ChatGPT", purpose: "Figma 컴포넌트 명세서 초안 작성" },
      { name: "Gamma", purpose: "디자인 시스템 가이드 슬라이드 제작" },
    ],
    practiceEnv: [
      { name: "Figma", url: "https://figma.com", desc: "UI 프로토타입 제작 (무료 계정 사용)" },
    ],
    gammaLink: true,
    samplePrompt: {
      role: "VR 게임 UI 디자이너",
      goal: "VR 게임의 메인 메뉴 화면 Figma 컴포넌트 목록 작성",
      context: "헤드셋 착용 환경, 시야각 110도, 컨트롤러 포인터 입력",
      format: "컴포넌트 이름 + 기능 설명 + Figma 속성 (크기/색상/폰트) 표 형식",
    },
  },
  {
    week: 7,
    title: "VR 환경 설계 및 공간 경험 디자인",
    objective: "VR 공간 경험 설계 원칙을 이해하고 환경 디자인 기획서를 작성한다.",
    topics: [
      "VR 공간 설계의 원칙 (Scale, Depth, Navigation)",
      "사이버 멀미 방지 UX 전략",
      "360도 환경 구성 요소 (스카이박스, 라이팅, 사운드)",
      "VR 사용자 여정 (User Journey) 설계",
    ],
    aiTools: [
      { name: "ChatGPT", purpose: "VR 환경 컨셉 기술서 작성" },
      { name: "Gamma", purpose: "VR 환경 설계 기획서 슬라이드" },
    ],
    practiceEnv: [],
    gammaLink: true,
    samplePrompt: {
      role: "VR 환경 설계 디렉터",
      goal: "교육용 VR 역사 박물관 환경 기획서 작성",
      context: "초등학생 대상, 조선시대 재현, 5분 체험 코스",
      format: "공간 구성도 (텍스트) + 핵심 인터랙션 3가지 + 멀미 방지 설계 방안",
    },
  },
  {
    week: 8,
    title: "중간 프로젝트 발표 및 피드백",
    objective: "1-7주차 학습을 종합한 게임/VR 기획서를 발표하고 상호 피드백한다.",
    topics: [
      "팀/개인 프로젝트 기획서 발표 (5-7분)",
      "교수 및 동료 피드백 (Glow & Grow 형식)",
      "중간 평가 루브릭 안내",
      "후반부 프로젝트 방향 조정",
    ],
    aiTools: [
      { name: "ChatGPT", purpose: "발표 스크립트 및 Q&A 예상 질문 준비" },
      { name: "Gamma", purpose: "발표자료 최종 다듬기" },
    ],
    practiceEnv: [],
    samplePrompt: {
      role: "게임 기획 발표자",
      goal: "5분 발표를 위한 핵심 포인트 정리 및 예상 질문 대비",
      context: "VR 교육 게임 기획서, 대학 수업 발표 상황",
      format: "발표 흐름 (30초 단위) + 예상 질문 5개 + 답변 키워드",
    },
  },
  {
    week: 9,
    title: "Unity 기초 및 게임 오브젝트 구성",
    objective: "Unity 엔진의 기본 구조를 이해하고 씬을 구성한다.",
    topics: [
      "Unity 인터페이스 이해 (Scene, Game, Hierarchy, Inspector)",
      "게임 오브젝트와 컴포넌트 시스템",
      "기본 3D 오브젝트 배치 및 Physics 설정",
      "C# 스크립트 기초 (변수, 조건문, 이벤트)",
    ],
    aiTools: [
      { name: "ChatGPT", purpose: "Unity C# 코드 생성 및 디버깅 도움" },
      { name: "GitHub Copilot", purpose: "코드 자동완성" },
    ],
    practiceEnv: [
      { name: "Unity Hub", url: "https://unity.com/download", desc: "Unity 2022 LTS 설치 필요" },
      { name: "Visual Studio Code", url: "https://code.visualstudio.com", desc: "C# 스크립팅 IDE" },
    ],
    samplePrompt: {
      role: "Unity 초보 개발자",
      goal: "플레이어 캐릭터가 WASD로 이동하는 Unity C# 스크립트 작성",
      context: "Unity 2022 LTS, 3D 프로젝트, CharacterController 컴포넌트 사용",
      format: "주석 포함 C# 코드 + 각 메서드 설명 + 씬 설정 방법",
    },
  },
  {
    week: 10,
    title: "Unity VR 개발 기초",
    objective: "Unity XR Toolkit으로 기본 VR 인터랙션을 구현한다.",
    topics: [
      "Unity XR Toolkit 설치 및 설정",
      "VR 카메라 리그 및 컨트롤러 입력 설정",
      "오브젝트 잡기(Grab), 버튼 상호작용 구현",
      "VR 씬 빌드 및 Meta Quest 빌드 설정",
    ],
    aiTools: [
      { name: "ChatGPT", purpose: "XR Toolkit API 활용 코드 생성" },
      { name: "Gamma", purpose: "VR 개발 과정 기록 슬라이드 제작" },
    ],
    practiceEnv: [
      { name: "Unity + XR Toolkit", url: "https://unity.com/download", desc: "XR Interaction Toolkit 2.5+ 패키지 필요" },
      { name: "Meta Quest Link", url: "https://www.meta.com/ko-kr/help/quest/articles/headsets-and-accessories/oculus-link/", desc: "PC 연결 테스트용" },
    ],
    gammaLink: true,
    samplePrompt: {
      role: "Unity VR 개발자",
      goal: "XR Grab Interactable로 물건을 집어 올리는 인터랙션 구현",
      context: "Unity 2022 LTS, XR Interaction Toolkit 2.5, Meta Quest 2 타겟",
      format: "단계별 설정 방법 + C# 코드 + 자주 발생하는 오류 및 해결법",
    },
  },
  {
    week: 11,
    title: "AI 생성 에셋 Unity 연동",
    objective: "AI 생성 이미지/3D 에셋을 Unity에 임포트하고 활용한다.",
    topics: [
      "AI 생성 텍스처/이미지 Unity 임포트 설정",
      "Meshy AI로 3D 모델 생성 및 FBX 내보내기",
      "Material과 Shader 설정으로 품질 향상",
      "에셋 스토어와 AI 생성 에셋 혼용 전략",
    ],
    aiTools: [
      { name: "Meshy AI", purpose: "텍스트→3D 모델 생성" },
      { name: "Dreamina", purpose: "텍스처/스카이박스 이미지 생성" },
      { name: "ChatGPT", purpose: "Unity 임포트 설정 가이드" },
    ],
    practiceEnv: [
      { name: "Unity", url: "https://unity.com/download", desc: "에셋 임포트 및 씬 통합" },
      { name: "Meshy AI", url: "https://www.meshy.ai", desc: "3D 모델 생성 (무료 플랜 가능)" },
    ],
    samplePrompt: {
      role: "인디 게임 개발자",
      goal: "Meshy AI로 생성한 FBX 파일을 Unity에 최적화 임포트하는 방법",
      context: "VR 게임용, 폴리곤 수 최적화 필요, PBR 머티리얼 적용",
      format: "임포트 설정 체크리스트 + 폴리곤 최적화 팁 + 머티리얼 설정 방법",
    },
  },
  {
    week: 12,
    title: "소셜 VR & Mozilla Hubs 활용",
    objective: "소셜 VR 플랫폼의 구조를 이해하고 Mozilla Hubs로 가상 공간을 제작한다.",
    topics: [
      "소셜 VR 플랫폼 비교 (Mozilla Hubs, VRChat, Spatial)",
      "Mozilla Hubs Spoke 에디터로 방 제작",
      "아바타 커스터마이징 및 인터랙션 설정",
      "교육/이벤트 목적 가상 공간 설계 사례",
    ],
    aiTools: [
      { name: "ChatGPT", purpose: "가상 공간 기획 및 진행 시나리오 작성" },
      { name: "Dreamina", purpose: "가상 공간용 텍스처/배경 이미지 생성" },
    ],
    practiceEnv: [
      { name: "Mozilla Hubs", url: "https://hubs.mozilla.com", desc: "브라우저 기반, 별도 설치 불필요" },
      { name: "Spoke (Hubs 에디터)", url: "https://hubs.mozilla.com/spoke", desc: "가상 공간 제작 도구" },
    ],
    samplePrompt: {
      role: "소셜 VR 공간 디자이너",
      goal: "비대면 수업을 위한 가상 강의실 Mozilla Hubs 방 기획",
      context: "30명 수용, 발표 공간 + 소그룹 토론 구역 포함",
      format: "공간 레이아웃 설명 + 필요한 에셋 목록 + 인터랙션 설계",
    },
  },
  {
    week: 13,
    title: "게임 사운드 및 AI 음악 생성",
    objective: "게임 오디오 설계 원칙을 이해하고 AI 도구로 BGM과 효과음을 제작한다.",
    topics: [
      "게임 오디오의 역할 (몰입감, 감정 유도, 피드백)",
      "Suno AI / Udio로 BGM 생성",
      "효과음 설계 및 무료 효과음 라이브러리",
      "Unity Audio Mixer로 사운드 통합",
    ],
    aiTools: [
      { name: "Suno AI", purpose: "게임 BGM 생성" },
      { name: "ChatGPT", purpose: "음악 분위기 프롬프트 작성 및 Unity 오디오 코드" },
    ],
    practiceEnv: [
      { name: "Unity Audio Mixer", url: "https://unity.com/download", desc: "Unity 내 오디오 관리" },
      { name: "Suno AI", url: "https://suno.com", desc: "AI 음악 생성 (무료 플랜)" },
    ],
    samplePrompt: {
      role: "게임 사운드 디렉터",
      goal: "공포 VR 게임의 분위기에 맞는 BGM 프롬프트 작성",
      context: "어두운 지하 공간, 긴장감, 미스터리 요소, 루프 가능해야 함",
      format: "Suno AI용 프롬프트 2가지 + 장르/분위기 키워드 + Unity 재생 설정 팁",
    },
  },
  {
    week: 14,
    title: "QA 테스트 및 플레이테스트",
    objective: "게임/VR 콘텐츠의 품질을 체계적으로 검증하는 QA 방법론을 적용한다.",
    topics: [
      "게임 QA의 종류 (기능, 성능, UX, 호환성 테스트)",
      "VR 특화 테스트 항목 (멀미 지수, 컨트롤러 반응)",
      "버그 리포트 작성 방법 및 우선순위 분류",
      "플레이테스트 설계 및 사용자 피드백 수집",
    ],
    aiTools: [
      { name: "ChatGPT", purpose: "테스트 케이스 목록 자동 생성" },
      { name: "Notion AI", purpose: "버그 리포트 및 QA 문서 정리" },
    ],
    practiceEnv: [
      { name: "Unity Profiler", url: "https://unity.com/download", desc: "성능 분석 도구 (Unity 내장)" },
    ],
    samplePrompt: {
      role: "게임 QA 테스터",
      goal: "VR 교육 게임의 플레이테스트 체크리스트 작성",
      context: "초등학생 대상, Meta Quest 2, 10분 체험 콘텐츠",
      format: "카테고리별 테스트 항목 체크리스트 (기능/UX/성능/안전성) + 평가 기준",
    },
  },
  {
    week: 15,
    title: "포트폴리오 제작 및 최종 발표 준비",
    objective: "16주 결과물을 정리해 취업 포트폴리오와 최종 발표자료를 완성한다.",
    topics: [
      "게임/VR 개발자 포트폴리오 구성 방법",
      "GitHub Pages / Notion으로 포트폴리오 공개",
      "최종 발표 구조 및 데모 준비",
      "AI 협업 과정 기록 및 회고",
    ],
    aiTools: [
      { name: "ChatGPT", purpose: "포트폴리오 자기소개 및 프로젝트 설명 문구 작성" },
      { name: "Gamma", purpose: "포트폴리오 프레젠테이션 제작" },
    ],
    practiceEnv: [
      { name: "GitHub Pages", url: "https://pages.github.com", desc: "무료 포트폴리오 호스팅" },
      { name: "Notion", url: "https://notion.so", desc: "프로젝트 문서화 및 포트폴리오 페이지" },
    ],
    samplePrompt: {
      role: "게임/VR 개발자 취업 준비생",
      goal: "Unity VR 프로젝트를 포트폴리오에 소개하는 프로젝트 설명 작성",
      context: "인턴십 지원, 기술 스택(Unity, XR Toolkit, AI 에셋), 역할(기획+개발)",
      format: "프로젝트 개요 + 내 기여도 + 기술 스택 + 배운 점 (각 2-3문장)",
    },
  },
  {
    week: 16,
    title: "최종 프로젝트 발표 및 수료",
    objective: "최종 게임/VR 프로젝트를 발표하고 한 학기 학습을 회고한다.",
    topics: [
      "최종 프로젝트 발표 (10분 발표 + 5분 Q&A)",
      "동료 평가 및 교수 총평",
      "AI 협업 회고: 무엇이 도움이 됐고 한계는 무엇이었나",
      "다음 단계 학습 로드맵 안내 (취업, 대학원, 창업)",
    ],
    aiTools: [
      { name: "ChatGPT", purpose: "발표 최종 점검 및 Q&A 대비" },
    ],
    practiceEnv: [],
    samplePrompt: {
      role: "게임/VR 개발 수료생",
      goal: "한 학기 AI 협업 학습 경험 회고문 작성",
      context: "생성형 AI(ChatGPT, Dreamina, Suno 등) 활용 게임 개발 과정",
      format: "가장 유용했던 AI 도구 + 한계점 + 다음에 시도할 것 + 한 학기 한 줄 회고",
    },
  },
];

export const RGCF_PRINCIPLE = {
  R: { label: "Role (역할)", desc: "AI에게 부여할 전문가 역할" },
  G: { label: "Goal (목표)", desc: "달성하고자 하는 구체적 목표" },
  C: { label: "Context (맥락)", desc: "배경 정보와 제약 조건" },
  F: { label: "Format (형식)", desc: "원하는 출력 형식과 길이" },
};
