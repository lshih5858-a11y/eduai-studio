import os
from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import anthropic
import json

app = FastAPI(title="AI 기반 운동건강관리 프로그램")
app.mount("/static", StaticFiles(directory="app/static"), name="static")
templates = Jinja2Templates(directory="app/templates")

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))

SYSTEM_PROMPT = """당신은 15년 경력의 운동처방사 겸 스포츠영양사입니다.
전문대학 운동건강관리과 학생들의 실습을 지도하고 있으며,
AI 기반 건강관리 프로그램의 각 단계를 친절하고 전문적으로 안내합니다.
모든 분석 결과는 교육적 참고용이며 의료적 진단이 아님을 항상 명시합니다.
응답은 한국어로, Markdown 형식으로 작성합니다."""


def build_prompt(stage: int, data: dict) -> str:
    if stage == 1:
        return f"""[1단계: 건강 상태 분석]

다음 정보를 바탕으로 종합 건강 상태를 분석해 주세요.

**기본 정보**
- 성별: {data.get('gender', '미입력')}
- 나이: {data.get('age', '미입력')}세
- 키: {data.get('height', '미입력')}cm
- 체중: {data.get('weight', '미입력')}kg
- 체지방률: {data.get('body_fat', '미입력')}%

**체력 측정 결과**
- 악력(우): {data.get('grip', '미입력')}kg
- 윗몸일으키기(1분): {data.get('situp', '미입력')}회
- 앉아서 윗몸 앞으로 굽히기: {data.get('flexibility', '미입력')}cm
- 왕복오래달리기: {data.get('endurance', '미입력')}회

**생활습관**
- 하루 수면 시간: {data.get('sleep', '미입력')}시간
- 하루 걷기: {data.get('steps', '미입력')}보
- 스트레스 수준: {data.get('stress', '미입력')}/10
- 식습관 특이사항: {data.get('diet_note', '없음')}

분석 항목:
1. **BMI 계산 및 분류** (WHO 기준)
2. **체지방률 평가** (성별·연령 기준)
3. **체력 수준 평가** (항목별 백분위 추정)
4. **생활습관 위험도** (10점 만점 종합 점수)
5. **최우선 개선 과제** (상위 3가지, 근거 포함)
6. **종합 건강 상태 요약**

⚠️ 이 분석은 교육적 참고용이며 의료 진단이 아닙니다."""

    elif stage == 2:
        return f"""[2단계: 개인 맞춤 운동 프로그램 설계]

1단계 분석 결과를 바탕으로 운동 프로그램을 설계해 주세요.

**클라이언트 정보**
- 성별: {data.get('gender', '미입력')} / 나이: {data.get('age', '미입력')}세
- 체력 수준: {data.get('fitness_level', '초급')}
- 운동 목표: {data.get('goal', '전반적 건강 증진')}
- 가용 시간: {data.get('available_time', '주 3~4회, 회당 40분')}
- 이용 가능 시설: {data.get('facility', '헬스장')}
- 주의사항: {data.get('precaution', '없음')}

설계 요청:
1. **SMART 목표** (8주 기준, 3가지)
2. **주간 운동 스케줄 표** (7일, FITT 원칙 적용)
3. **대표 세션 상세 계획** (워밍업→본운동→쿨다운)
4. **1~4주(적응기) vs 5~8주(발전기)** 강도 증가 방안
5. **안전 주의사항** 및 부상 예방 팁

⚠️ 이 프로그램은 교육적 참고용이며 실제 적용 전 전문가 검토를 권장합니다."""

    elif stage == 3:
        return f"""[3단계: 식단 및 생활습관 개선 가이드]

다음 정보를 바탕으로 맞춤 식단과 생활습관 개선 계획을 작성해 주세요.

**기본 정보**
- 성별: {data.get('gender', '미입력')} / 나이: {data.get('age', '미입력')}세
- 키: {data.get('height', '미입력')}cm / 체중: {data.get('weight', '미입력')}kg
- 운동 목표: {data.get('goal', '건강 증진')}
- 활동 수준: {data.get('activity', '보통')}
- 식이 제한: {data.get('diet_restriction', '없음')}
- 하루 식비 예산: {data.get('budget', '1만원')}원 이내
- 현재 문제 생활습관: {data.get('bad_habits', '없음')}

작성 요청:
1. **일일 칼로리·영양소 필요량** (BMR→TDEE→목표 칼로리)
2. **탄수화물:단백질:지방 비율** 및 그램 수
3. **3일치 식단 계획** (아침·점심·저녁·간식, 칼로리 표기)
4. **운동일 vs 휴식일** 식단 차이
5. **생활습관 4주 개선 계획** (수면·스트레스·신체활동)
6. **실천 가능한 소소한 팁** 5가지

⚠️ 이 식단은 교육적 참고용이며 개인 의료 상태에 따라 조정이 필요합니다."""

    elif stage == 4:
        return f"""[4단계: AI 피드백 및 월간 리포트 생성]

4주 운동 기록을 분석하고 클라이언트용 리포트를 생성해 주세요.

**4주 운동 실적**
- 계획 대비 실천율: {data.get('adherence', '미입력')}%
- 미이행 주요 이유: {data.get('miss_reason', '없음')}

**체력 변화 (시작→현재)**
- 체중: {data.get('weight_before', '미입력')}kg → {data.get('weight_after', '미입력')}kg
- 체지방률: {data.get('fat_before', '미입력')}% → {data.get('fat_after', '미입력')}%
- 심폐지구력(왕복오래달리기): {data.get('cardio_before', '미입력')}회 → {data.get('cardio_after', '미입력')}회
- 근력(악력): {data.get('strength_before', '미입력')}kg → {data.get('strength_after', '미입력')}kg

**주관적 변화 (10점 만점)**
- 에너지 수준: {data.get('energy_before', '미입력')} → {data.get('energy_after', '미입력')}
- 수면의 질: {data.get('sleep_before', '미입력')} → {data.get('sleep_after', '미입력')}
- 운동 즐거움: {data.get('enjoyment', '미입력')}/10

생성 요청:
1. **4주 성과 종합 평가** (항목별 달성률 %)
2. **클라이언트용 월간 리포트** (A4 1페이지 분량, 따뜻한 톤)
3. **5~8주 프로그램 조정 권고사항** (구체적)
4. **동기부여 피드백 메시지**
5. **AI 분석의 한계 및 주의사항** (윤리 섹션)

⚠️ 리포트는 교육용 템플릿이며 실제 클라이언트 제공 전 전문가 검토가 필요합니다."""

    return "잘못된 단계입니다."


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse(request=request, name="index.html")


@app.get("/stage/{stage_num}", response_class=HTMLResponse)
async def stage_page(request: Request, stage_num: int):
    if stage_num not in [1, 2, 3, 4]:
        return HTMLResponse("잘못된 단계입니다.", status_code=404)
    return templates.TemplateResponse(request=request, name=f"stage{stage_num}.html")


@app.post("/analyze/{stage_num}")
async def analyze(stage_num: int, request: Request):
    form_data = await request.form()
    data = dict(form_data)

    if not client.api_key:
        async def error_stream():
            yield "data: API 키가 설정되지 않았습니다. 환경변수 ANTHROPIC_API_KEY를 설정해 주세요.\n\n"
        return StreamingResponse(error_stream(), media_type="text/event-stream")

    prompt = build_prompt(stage_num, data)

    async def generate():
        with client.messages.stream(
            model="claude-sonnet-4-6",
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": prompt}],
        ) as stream:
            for text in stream.text_stream:
                escaped = text.replace("\n", "\\n")
                yield f"data: {escaped}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
