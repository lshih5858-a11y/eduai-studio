#!/usr/bin/env python3
"""AI 기반 운동건강관리 프로그램 CLI — Anthropic SDK 직접 호출"""

import os
import sys
import anthropic

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))

SYSTEM_PROMPT = """당신은 15년 경력의 운동처방사 겸 스포츠영양사입니다.
전문대학 운동건강관리과 학생들의 실습을 지도하고 있으며,
AI 기반 건강관리 프로그램의 각 단계를 친절하고 전문적으로 안내합니다.
모든 분석 결과는 교육적 참고용이며 의료적 진단이 아님을 항상 명시합니다.
응답은 한국어로 작성합니다."""


def ask(prompt: str, default: str = "") -> str:
    try:
        val = input(f"  {prompt}: ").strip()
        return val if val else default
    except (EOFError, KeyboardInterrupt):
        print()
        sys.exit(0)


def stream_analysis(prompt: str) -> None:
    print("\n" + "─" * 60)
    print("🤖 AI 분석 중...\n")
    with client.messages.stream(
        model="claude-opus-4-7",
        max_tokens=4096,
        thinking={"type": "adaptive"},
        output_config={"effort": "high"},
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        for text in stream.text_stream:
            print(text, end="", flush=True)
    print("\n" + "─" * 60)


def stage1() -> dict:
    print("\n📋 [1단계] 건강 상태 분석 — 기본 정보 입력")
    print("─" * 60)
    d: dict = {}
    d["gender"] = ask("성별 (남/여)")
    d["age"] = ask("나이 (세)")
    d["height"] = ask("키 (cm)")
    d["weight"] = ask("체중 (kg)")
    d["body_fat"] = ask("체지방률 (%, 모르면 Enter)", "미측정")

    print("\n  ── 체력 측정 결과 ──")
    d["grip"] = ask("악력(우) (kg)")
    d["situp"] = ask("윗몸일으키기 1분 (회)")
    d["flexibility"] = ask("앉아 윗몸 앞으로 굽히기 (cm)")
    d["endurance"] = ask("왕복오래달리기 (회)")

    print("\n  ── 생활습관 ──")
    d["sleep"] = ask("하루 수면 시간 (시간)")
    d["steps"] = ask("하루 걷기 (보)")
    d["stress"] = ask("스트레스 수준 (0~10)")
    d["diet_note"] = ask("식습관 특이사항 (없으면 Enter)", "없음")

    prompt = f"""[1단계: 건강 상태 분석]

다음 정보를 바탕으로 종합 건강 상태를 분석해 주세요.

**기본 정보**
- 성별: {d['gender']} / 나이: {d['age']}세 / 키: {d['height']}cm / 체중: {d['weight']}kg / 체지방률: {d['body_fat']}%

**체력 측정**
- 악력(우): {d['grip']}kg / 윗몸일으키기: {d['situp']}회 / 유연성: {d['flexibility']}cm / 왕복오래달리기: {d['endurance']}회

**생활습관**
- 수면: {d['sleep']}시간 / 걷기: {d['steps']}보 / 스트레스: {d['stress']}/10 / 식습관: {d['diet_note']}

분석 항목:
1. **BMI 계산 및 분류** (WHO 기준)
2. **체지방률 평가** (성별·연령 기준)
3. **체력 수준 평가** (항목별 백분위 추정)
4. **생활습관 위험도** (10점 만점)
5. **최우선 개선 과제** (상위 3가지, 근거 포함)
6. **종합 건강 상태 요약**

⚠️ 이 분석은 교육적 참고용이며 의료 진단이 아닙니다."""

    stream_analysis(prompt)
    return d


def stage2(prev: dict) -> dict:
    print("\n🏋️ [2단계] 개인 맞춤 운동 프로그램 설계")
    print("─" * 60)
    d: dict = {**prev}
    d["fitness_level"] = ask("체력 수준 (초급/중급/고급)", "초급")
    d["goal"] = ask("운동 목표 (예: 체지방 감소, 근력 향상)", "전반적 건강 증진")
    d["available_time"] = ask("가용 시간 (예: 주 3회, 회당 40분)", "주 3~4회, 회당 40분")
    d["facility"] = ask("이용 가능 시설 (헬스장/공원/자택 등)", "헬스장")
    d["precaution"] = ask("주의사항·부상 이력 (없으면 Enter)", "없음")

    prompt = f"""[2단계: 개인 맞춤 운동 프로그램 설계]

**클라이언트 정보**
- 성별: {d.get('gender','미입력')} / 나이: {d.get('age','미입력')}세
- 체력 수준: {d['fitness_level']} / 운동 목표: {d['goal']}
- 가용 시간: {d['available_time']} / 시설: {d['facility']}
- 주의사항: {d['precaution']}

설계 요청:
1. **SMART 목표** (8주 기준, 3가지)
2. **주간 운동 스케줄 표** (7일, FITT 원칙 적용)
3. **대표 세션 상세 계획** (워밍업→본운동→쿨다운)
4. **1~4주(적응기) vs 5~8주(발전기)** 강도 증가 방안
5. **안전 주의사항** 및 부상 예방 팁

⚠️ 이 프로그램은 교육적 참고용이며 실제 적용 전 전문가 검토를 권장합니다."""

    stream_analysis(prompt)
    return d


def stage3(prev: dict) -> dict:
    print("\n🥗 [3단계] 식단 및 생활습관 개선 가이드")
    print("─" * 60)
    d: dict = {**prev}
    d["activity"] = ask("활동 수준 (낮음/보통/높음)", "보통")
    d["diet_restriction"] = ask("식이 제한 (채식/알레르기 등, 없으면 Enter)", "없음")
    d["budget"] = ask("하루 식비 예산 (원, 예: 10000)", "10000")
    d["bad_habits"] = ask("개선할 생활습관 (없으면 Enter)", "없음")

    prompt = f"""[3단계: 식단 및 생활습관 개선 가이드]

**기본 정보**
- 성별: {d.get('gender','미입력')} / 나이: {d.get('age','미입력')}세
- 키: {d.get('height','미입력')}cm / 체중: {d.get('weight','미입력')}kg
- 운동 목표: {d.get('goal','건강 증진')} / 활동 수준: {d['activity']}
- 식이 제한: {d['diet_restriction']} / 하루 식비: {d['budget']}원
- 현재 문제 생활습관: {d['bad_habits']}

작성 요청:
1. **일일 칼로리·영양소 필요량** (BMR→TDEE→목표 칼로리)
2. **탄수화물:단백질:지방 비율** 및 그램 수
3. **3일치 식단 계획** (아침·점심·저녁·간식, 칼로리 표기)
4. **운동일 vs 휴식일** 식단 차이
5. **생활습관 4주 개선 계획** (수면·스트레스·신체활동)
6. **실천 가능한 소소한 팁** 5가지

⚠️ 이 식단은 교육적 참고용이며 개인 의료 상태에 따라 조정이 필요합니다."""

    stream_analysis(prompt)
    return d


def stage4(prev: dict) -> None:
    print("\n📊 [4단계] AI 피드백 및 월간 리포트 생성")
    print("─" * 60)
    d: dict = {**prev}
    d["adherence"] = ask("계획 대비 실천율 (%)", "80")
    d["miss_reason"] = ask("미이행 주요 이유 (없으면 Enter)", "없음")

    print("\n  ── 체력 변화 (시작 → 현재) ──")
    d["weight_before"] = ask(f"체중 시작 (kg, 기본: {d.get('weight','?')})", d.get("weight", "미입력"))
    d["weight_after"] = ask("체중 현재 (kg)")
    d["fat_before"] = ask(f"체지방률 시작 (%, 기본: {d.get('body_fat','?')})", d.get("body_fat", "미입력"))
    d["fat_after"] = ask("체지방률 현재 (%)")
    d["cardio_before"] = ask(f"왕복오래달리기 시작 (회, 기본: {d.get('endurance','?')})", d.get("endurance", "미입력"))
    d["cardio_after"] = ask("왕복오래달리기 현재 (회)")
    d["strength_before"] = ask(f"악력 시작 (kg, 기본: {d.get('grip','?')})", d.get("grip", "미입력"))
    d["strength_after"] = ask("악력 현재 (kg)")

    print("\n  ── 주관적 변화 (10점 만점) ──")
    d["energy_before"] = ask("에너지 수준 시작 (1~10)")
    d["energy_after"] = ask("에너지 수준 현재 (1~10)")
    d["sleep_before"] = ask("수면의 질 시작 (1~10)")
    d["sleep_after"] = ask("수면의 질 현재 (1~10)")
    d["enjoyment"] = ask("운동 즐거움 (1~10)")

    prompt = f"""[4단계: AI 피드백 및 월간 리포트 생성]

**4주 운동 실적**
- 계획 대비 실천율: {d['adherence']}% / 미이행 이유: {d['miss_reason']}

**체력 변화 (시작→현재)**
- 체중: {d['weight_before']}kg → {d['weight_after']}kg
- 체지방률: {d['fat_before']}% → {d['fat_after']}%
- 왕복오래달리기: {d['cardio_before']}회 → {d['cardio_after']}회
- 악력: {d['strength_before']}kg → {d['strength_after']}kg

**주관적 변화 (10점 만점)**
- 에너지: {d['energy_before']} → {d['energy_after']}
- 수면의 질: {d['sleep_before']} → {d['sleep_after']}
- 운동 즐거움: {d['enjoyment']}/10

생성 요청:
1. **4주 성과 종합 평가** (항목별 달성률 %)
2. **클라이언트용 월간 리포트** (A4 1페이지 분량, 따뜻한 톤)
3. **5~8주 프로그램 조정 권고사항** (구체적)
4. **동기부여 피드백 메시지**
5. **AI 분석의 한계 및 주의사항** (윤리 섹션)

⚠️ 리포트는 교육용 템플릿이며 실제 클라이언트 제공 전 전문가 검토가 필요합니다."""

    stream_analysis(prompt)


STAGE_MAP = {
    "1": ("1단계: 건강 상태 분석", stage1),
    "2": ("2단계: 운동 프로그램 설계", stage2),
    "3": ("3단계: 식단·생활습관 가이드", stage3),
    "4": ("4단계: AI 피드백 & 월간 리포트", stage4),
}


def main() -> None:
    if not client.api_key:
        print("❌ ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.")
        sys.exit(1)

    print("=" * 60)
    print("  💪 AI 기반 운동건강관리 프로그램 (CLI)")
    print("  운동건강관리과 실습용 · Powered by Claude Opus 4.7")
    print("=" * 60)
    print("\n단계를 선택하세요 (1~4, 또는 'all' 전체 실행, 'q' 종료):")
    for key, (name, _) in STAGE_MAP.items():
        print(f"  {key}. {name}")

    choice = ask("\n선택").strip().lower()

    if choice == "q":
        sys.exit(0)

    data: dict = {}

    if choice == "all":
        data = stage1()
        data = stage2(data)
        data = stage3(data)
        stage4(data)
    elif choice in STAGE_MAP:
        _, fn = STAGE_MAP[choice]
        if choice == "1":
            fn()
        else:
            fn(data)
    else:
        print("❌ 잘못된 선택입니다.")
        sys.exit(1)

    print("\n✅ 분석 완료. 결과는 교육적 참고용이며 의료 진단이 아닙니다.")


if __name__ == "__main__":
    main()
