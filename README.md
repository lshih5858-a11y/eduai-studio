# EduAI Service Management Designer

**서비스경영 과목을 위한 AI 기반 16주차 수업설계·실습·챗봇·평가 통합 플랫폼**

> EduAI Studio 연구소 | 전공 맞춤형 AI 수업설계 플랫폼

---

## 프로그램 개요

`EduAI Service Management Designer`는 서비스경영 과목을 AI 기반 수업으로 운영하기 위한 **교수자용·학생용 통합 웹앱**입니다.

- **교수자**는 16주차 수업계획, AI 도구 매핑, 실습과제, 퀴즈, 평가 루브릭, 챗봇 지식자료를 관리할 수 있습니다.
- **학생**은 주차별 개념 설명, 발표자료 프롬프트, 실습 미션, 퀴즈, 과제 피드백 예시를 확인할 수 있습니다.

---

## 기술 스택

| 항목 | 내용 |
|------|------|
| 프레임워크 | React 18 + TypeScript |
| 빌드 도구 | Vite 5 |
| 스타일링 | Tailwind CSS 3 |
| 아이콘 | lucide-react |
| 저장소 | localStorage (외부 DB 없음) |
| 배포 형태 | 정적 웹앱 (Static Web App) |

---

## 실행 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속합니다.

### 3. 프로덕션 빌드

```bash
npm run build
```

`dist/` 디렉토리에 정적 파일이 생성됩니다.

### 4. 빌드 미리보기

```bash
npm run preview
```

---

## 주요 기능

### 메인 메뉴 8개

| 메뉴 | 대상 | 주요 기능 |
|------|------|-----------|
| 홈 대시보드 | 공통 | 교수자/학생 모드 전환, 주요 기능 안내, 통계 |
| 16주차 수업설계 | 교수자 | 카드형/표형 전환, 주차별 상세 정보, Gamma 프롬프트 |
| AI 도구 매핑 | 공통 | 6가지 AI 도구 역할·적용 주차·예시 프롬프트 |
| 주차별 실습 미션 | 공통 | 16개 미션 (목표·절차·추천 프롬프트) |
| 학생용 AI 튜터 | 학생 | 8가지 질문 유형 자동 답변, 메모 저장 |
| 퀴즈 생성기 | 공통 | OX·객관식·단답형·사례형, 주차별 4문항+ |
| 평가 루브릭 | 교수자 | 4종 100점 루브릭, 교수자 메모 저장 |
| 교수자 출력자료 | 교수자 | 8개 항목 복사, Custom GPT JSON 코드블록 |

### 활용 AI 도구 6종

| 도구 | 주요 역할 |
|------|-----------|
| GPT | 개념 설명, 전략 분석, 과제 피드백 |
| Gamma | 발표자료 슬라이드 자동 생성 |
| Napkin | 서비스 프로세스·구조도 시각화 |
| Felo | 고객 응대 시뮬레이션·역할극 |
| Genspark | 고객 인터뷰·직원 교육 대본 생성 |
| Geminiami | 퀴즈·평가 문항 자동 생성 |

---

## 파일 구조

```
eduai-studio/
├── src/
│   ├── App.tsx                  # 메인 앱 (사이드바·라우팅·검색·역할 전환)
│   ├── main.tsx                 # 앱 진입점
│   ├── index.css                # Tailwind 기본 스타일
│   ├── data/
│   │   ├── weeklyPlan.ts        # 16주차 수업계획 + Gamma 프롬프트
│   │   ├── aiTools.ts           # AI 도구 6종 데이터
│   │   ├── missions.ts          # 주차별 실습 미션 16개
│   │   ├── rubrics.ts           # 평가 루브릭 4종
│   │   └── quizzes.ts           # 주차별 퀴즈 (주차당 4문항+)
│   └── components/
│       ├── Sidebar.tsx          # 좌측 네이비 사이드바 (역할별 메뉴)
│       ├── Dashboard.tsx        # 홈 대시보드 (히어로·통계·기능카드)
│       ├── WeeklyPlan.tsx       # 16주차 수업설계 (카드형/표형 전환)
│       ├── ToolMapping.tsx      # AI 도구 매핑 (주차 태그·매트릭스)
│       ├── MissionBoard.tsx     # 주차별 실습 미션
│       ├── StudentTutor.tsx     # 학생용 AI 튜터 (자동 답변 갱신)
│       ├── QuizGenerator.tsx    # 퀴즈 생성기
│       ├── RubricBoard.tsx      # 평가 루브릭 (메모 저장)
│       ├── TeacherExports.tsx   # 교수자 출력자료 (JSON 코드블록)
│       └── CopyButton.tsx       # 공용 클립보드 복사 버튼
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 특징

- **역할 분리**: 상단 토글로 교수자/학생 모드 전환, 사이드바 메뉴가 역할에 맞게 조정됨
- **카드형/표형 전환**: 16주차 수업설계를 카드 아코디언 또는 전체 요약표로 선택 조회
- **자동 답변 갱신**: 학생용 AI 튜터에서 주차·질문 유형 선택 즉시 답변이 갱신됨
- **클립보드 복사**: 모든 프롬프트, 루브릭, 출력자료에 복사 버튼 제공
- **localStorage 저장**: 학생 메모, 교수자 평가 메모가 브라우저에 지속 저장됨
- **Custom GPT JSON**: ChatGPT Custom GPT Knowledge 탭 업로드용 JSON 코드블록 제공
- **반응형 디자인**: PC, 태블릿, 모바일 모든 화면에서 안정적으로 동작

---

## 사용 안내

> 본 프로그램은 서비스경영 수업설계와 학습지원을 위한 **교육용 도구**입니다.
> 실제 기관 컨설팅이나 고객 데이터 분석에 적용할 경우 교수자의 검토가 필요합니다.

---

*EduAI Studio 연구소 — 전공 맞춤형 AI 수업설계 플랫폼*
