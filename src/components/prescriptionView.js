App.register('prescription', function (el) {
  const TARGETS = [
    { label:'비만 대학생', age:21, gender:'여성', height:162, weight:78, exp:'없음', risks:'비만(BMI 29.7)', goal:'체중감량 및 체력향상', hours:4 },
    { label:'운동 부족 직장인', age:35, gender:'남성', height:175, weight:82, exp:'거의 없음', risks:'대사증후군 경계', goal:'활동량 증가 및 스트레스 해소', hours:3 },
    { label:'고혈압 위험군', age:48, gender:'남성', height:170, weight:85, exp:'과거 운동 경험 있음', risks:'고혈압 전단계(수축기 130mmHg)', goal:'혈압 조절 및 심혈관 건강', hours:5 },
    { label:'당뇨 전단계 성인', age:52, gender:'여성', height:158, weight:72, exp:'가벼운 걷기', risks:'당뇨 전단계(공복혈당 105)', goal:'혈당 조절 및 체중관리', hours:5 },
    { label:'근감소증 위험 노인', age:72, gender:'여성', height:155, weight:52, exp:'없음', risks:'근감소증 위험, 낙상 경험 1회', goal:'근력강화 및 낙상 예방', hours:3 },
    { label:'체력 향상 일반인', age:28, gender:'남성', height:178, weight:70, exp:'주 1~2회 운동', risks:'해당 없음', goal:'전반적 체력향상', hours:6 },
  ];

  function buildResult(f) {
    const bmi = (f.weight / ((f.height / 100) ** 2)).toFixed(1);
    const maxHR = 220 - f.age;
    const lowHR = Math.round(maxHR * 0.5);
    const highHR = Math.round(maxHR * 0.7);

    return `
      <div class="result-box mt-24" id="prescriptionResult">
        <h4>📋 대상자 분석</h4>
        <p>나이 ${f.age}세 ${f.gender} / 신장 ${f.height}cm / 체중 ${f.weight}kg / BMI ${bmi}<br>
        운동경험: ${f.exp} | 건강위험요인: ${f.risks}<br>
        운동목표: ${f.goal} | 주당 가능 시간: ${f.hours}시간</p>

        <h4>🎯 운동목표 설정</h4>
        <p>단기(4주): 규칙적인 운동 습관 형성 및 기초 체력 향상<br>
        중기(8주): ${f.goal} 달성을 위한 체계적 운동 수행<br>
        장기(12주): 자기주도적 건강관리 역량 확립</p>

        <h4>🏃 유산소 운동계획 (FITT 원리)</h4>
        <p>빈도(F): 주 3~4회<br>
        강도(I): 목표심박수 ${lowHR}~${highHR}bpm (최대심박수 ${maxHR}의 50~70%)<br>
        시간(T): 회당 20~40분 (점진적 증가)<br>
        유형(T): 빠른 걷기, 자전거, 수영 등 저충격 유산소</p>

        <h4>💪 저항운동 계획</h4>
        <p>빈도: 주 2~3회 (비연속일)<br>
        강도: 1RM의 50~65% (초보자 기준)<br>
        구성: 하체(스쿼트, 레그프레스) → 상체(체스트프레스, 로우) → 코어(플랭크)<br>
        세트/반복: 2~3세트 × 12~15회 / 세트 간 휴식 60~90초</p>

        <h4>🤸 유연성 운동계획</h4>
        <p>빈도: 매 운동 후 10분<br>
        방법: 정적 스트레칭 (각 부위 20~30초 × 2회)<br>
        주요 부위: 햄스트링, 대퇴사두근, 흉근, 어깨, 종아리</p>

        <h4>⚠️ 안전주의사항</h4>
        <p>• 운동 전 5~10분 준비운동 필수<br>
        • 운동 중 통증·호흡곤란·어지럼증 발생 시 즉시 중단<br>
        • 수분 섭취: 운동 전·중·후 규칙적으로<br>
        • ${f.risks !== '해당 없음' ? f.risks + '이 있으므로 초기에는 저강도로 시작하고 담당 의사와 상담 권장' : '운동 강도는 점진적으로 증가'}</p>

        <h4>📆 4주 운동관리표</h4>
        <table style="width:100%;font-size:.82rem;border-collapse:collapse;margin-top:6px">
          <thead style="background:var(--color-primary);color:#fff">
            <tr><th style="padding:6px 10px">주차</th><th style="padding:6px 10px">유산소</th><th style="padding:6px 10px">저항운동</th><th style="padding:6px 10px">목표강도</th></tr>
          </thead>
          <tbody>
            ${[['1주','20분 × 3회','2세트 × 12회','50~55% HRmax'],['2주','25분 × 3회','2세트 × 12회','55~60% HRmax'],['3주','30분 × 4회','3세트 × 12회','60~65% HRmax'],['4주','35분 × 4회','3세트 × 15회','65~70% HRmax']].map(r => `
              <tr style="border-bottom:1px solid var(--color-border)">
                ${r.map((c,i)=>`<td style="padding:6px 10px;${i===0?'font-weight:700':''}">${c}</td>`).join('')}
              </tr>`).join('')}
          </tbody>
        </table>

        <h4>📝 교수자 피드백 메모</h4>
        <p>□ 대상자 분석 적절성 확인<br>
        □ FITT 원리 적용 여부 확인<br>
        □ 안전주의사항 반영 여부 확인<br>
        □ 현실적인 운동량 설정 여부 확인</p>

        <div style="margin-top:14px;padding:10px 14px;background:#fff3cd;border-radius:6px;font-size:.82rem;color:#856404">
          ⚠️ 본 결과는 교육용 예시이며, 실제 질환자나 고위험군의 운동처방은 전문가 상담과 의학적 확인이 필요합니다.
        </div>

        <button class="btn btn-outline btn-sm mt-16" onclick="copyPrescription()">📋 처방안 복사</button>
      </div>
    `;
  }

  el.innerHTML = `
    <p class="page-title">🏋️ 운동처방 실습</p>
    <p class="page-subtitle">가상 대상자를 선택하거나 직접 정보를 입력하여 맞춤형 운동처방안을 작성해보세요.</p>

    <div class="notice notice-warn mb-24">
      ⚠️ 본 결과는 교육용 예시이며, 실제 질환자나 고위험군의 운동처방은 전문가 상담과 의학적 확인이 필요합니다.
    </div>

    <p class="section-heading">가상 대상자 선택</p>
    <div class="grid-3 mb-24">
      ${TARGETS.map((t, i) => `
        <button class="card" style="text-align:left;cursor:pointer" onclick="loadTarget(${i})">
          <div class="card-title">👤 ${t.label}</div>
          <div class="card-desc">${t.age}세 ${t.gender} · BMI ${(t.weight/((t.height/100)**2)).toFixed(1)}</div>
        </button>
      `).join('')}
    </div>

    <p class="section-heading">직접 입력</p>
    <div class="card mb-24">
      <div class="grid-3 gap-16">
        <div class="form-group">
          <label class="form-label">나이</label>
          <input class="form-input" id="p-age" type="number" placeholder="예: 25" min="10" max="100">
        </div>
        <div class="form-group">
          <label class="form-label">성별</label>
          <select class="form-select" id="p-gender">
            <option>남성</option><option>여성</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">키 (cm)</label>
          <input class="form-input" id="p-height" type="number" placeholder="예: 170" min="100" max="220">
        </div>
        <div class="form-group">
          <label class="form-label">체중 (kg)</label>
          <input class="form-input" id="p-weight" type="number" placeholder="예: 70" min="30" max="200">
        </div>
        <div class="form-group">
          <label class="form-label">운동경험</label>
          <select class="form-select" id="p-exp">
            <option>없음</option><option>가벼운 걷기</option><option>주 1~2회</option><option>주 3회 이상</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">주당 운동 가능 시간</label>
          <input class="form-input" id="p-hours" type="number" placeholder="예: 4" min="1" max="21">
        </div>
        <div class="form-group" style="grid-column:1/-1">
          <label class="form-label">건강위험요인</label>
          <input class="form-input" id="p-risks" placeholder="예: 고혈압 전단계, 과체중 (없으면 '해당 없음')">
        </div>
        <div class="form-group" style="grid-column:1/-1">
          <label class="form-label">운동목표</label>
          <input class="form-input" id="p-goal" placeholder="예: 체중감량 및 심폐지구력 향상">
        </div>
      </div>
      <button class="btn btn-primary mt-8" onclick="generatePrescription()">✅ 운동처방안 생성</button>
    </div>

    <div id="prescriptionOutput"></div>
  `;

  window.loadTarget = function (i) {
    const t = TARGETS[i];
    document.getElementById('p-age').value    = t.age;
    document.getElementById('p-gender').value = t.gender;
    document.getElementById('p-height').value = t.height;
    document.getElementById('p-weight').value = t.weight;
    document.getElementById('p-exp').value    = t.exp;
    document.getElementById('p-hours').value  = t.hours;
    document.getElementById('p-risks').value  = t.risks;
    document.getElementById('p-goal').value   = t.goal;
    document.getElementById('prescriptionOutput').innerHTML = '';
    document.querySelector('.card[onclick^="loadTarget"]') && window.scrollTo({ top: document.getElementById('p-age').getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth' });
  };

  window.generatePrescription = function () {
    const f = {
      age:    parseInt(document.getElementById('p-age').value)    || 30,
      gender: document.getElementById('p-gender').value,
      height: parseInt(document.getElementById('p-height').value) || 170,
      weight: parseInt(document.getElementById('p-weight').value) || 70,
      exp:    document.getElementById('p-exp').value,
      risks:  document.getElementById('p-risks').value  || '해당 없음',
      goal:   document.getElementById('p-goal').value   || '전반적 체력향상',
      hours:  parseInt(document.getElementById('p-hours').value)  || 4,
    };
    document.getElementById('prescriptionOutput').innerHTML = buildResult(f);
    document.getElementById('prescriptionResult').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  window.copyPrescription = function () {
    const box = document.getElementById('prescriptionResult');
    copyToClipboard(box ? box.innerText : '');
  };
});
