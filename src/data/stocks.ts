export type VolatilityLevel = '낮음' | '중간' | '높음'

export interface StockPricePoint {
  month: string
  price: number
}

export interface VirtualStock {
  id: string
  name: string
  type: string
  price: number
  per: number
  pbr: number
  roe: number
  dividendYield: number
  volatility: VolatilityLevel
  chartPattern: '상승형' | '하락형' | '변동형' | '횡보형'
  description: string
  pros: string[]
  risks: string[]
  studyPoints: string[]
  indicatorInterpretation: string
  misconceptions: string[]
  priceHistory: StockPricePoint[]
}

const months = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
]

function toHistory(prices: number[]): StockPricePoint[] {
  return prices.map((price, i) => ({ month: months[i], price }))
}

export const virtualStocks: VirtualStock[] = [
  {
    id: 'alpha-electronics',
    name: 'Alpha전자',
    type: '대형 안정주',
    price: 72000,
    per: 12.5,
    pbr: 1.3,
    roe: 10.4,
    dividendYield: 2.1,
    volatility: '낮음',
    chartPattern: '상승형',
    description:
      'Alpha전자는 오랜 기간 안정적인 실적을 유지해온 대형 제조업 가상 기업입니다. 시가총액이 크고 사업 구조가 다각화되어 있어 주가 흐름이 비교적 완만한 편입니다.',
    pros: [
      '실적 변동성이 낮아 예측 가능성이 상대적으로 높습니다.',
      'ROE가 10% 내외로 꾸준한 수익성을 유지하고 있습니다.',
      '배당수익률이 있어 장기 보유 시 현금흐름을 기대할 수 있습니다.',
    ],
    risks: [
      '이미 시장에서 크게 성장한 기업이라 폭발적인 주가 상승은 기대하기 어렵습니다.',
      '산업 전체가 둔화되면 대형주도 영향을 받을 수 있습니다.',
    ],
    studyPoints: [
      'PER 12.5는 업종 평균과 비교했을 때 어떤 수준인지 살펴보는 연습을 해보세요.',
      '낮은 변동성 자산이 포트폴리오에서 어떤 역할을 하는지 생각해보세요.',
    ],
    indicatorInterpretation:
      'PER 12.5, PBR 1.3은 이익과 자산 대비 주가가 과도하게 비싸지 않다는 것을 학습할 수 있는 예시입니다. ROE 10.4%는 자기자본을 효율적으로 활용하고 있음을 보여주는 가상 지표입니다.',
    misconceptions: [
      '"대형주라서 무조건 안전하다"는 생각은 위험합니다. 대형주도 하락할 수 있습니다.',
      '낮은 변동성이 손실 가능성이 전혀 없다는 뜻은 아닙니다.',
    ],
    priceHistory: toHistory([
      61000, 62500, 63200, 64800, 65100, 66700, 67900, 68200, 69500, 70100, 71000, 72000,
    ]),
  },
  {
    id: 'bionext',
    name: 'BioNext',
    type: '성장주',
    price: 38000,
    per: 48.2,
    pbr: 5.1,
    roe: 4.2,
    dividendYield: 0,
    volatility: '높음',
    chartPattern: '변동형',
    description:
      'BioNext는 신약 개발을 테마로 하는 가상 바이오 성장주입니다. 아직 뚜렷한 이익을 내지 못하고 있지만 미래 성장 기대감으로 주가가 크게 움직이는 특징을 보여줍니다.',
    pros: [
      '성공적으로 성장할 경우 높은 주가 상승 가능성을 학습할 수 있는 사례입니다.',
      '혁신 산업의 밸류에이션 방식을 공부하기에 적합합니다.',
    ],
    risks: [
      'PER이 48.2로 매우 높아 현재 이익 대비 기대감이 많이 반영되어 있습니다.',
      'ROE가 4.2%로 낮아 아직 자본 효율성이 검증되지 않았습니다.',
      '변동성이 높아 단기간에 큰 폭의 등락이 발생할 수 있습니다.',
    ],
    studyPoints: [
      '이익이 적은데 PER이 높은 이유가 무엇인지 스스로 설명해보세요.',
      '성장주 투자에서 "기대감"과 "실적"의 차이를 구분하는 연습을 해보세요.',
    ],
    indicatorInterpretation:
      '높은 PER과 PBR은 시장이 미래 성장 가능성에 높은 가격을 매기고 있다는 의미로 해석하는 연습을 할 수 있습니다. 다만 이는 실제 실적으로 증명되기 전까지는 불확실성이 큰 지표입니다.',
    misconceptions: [
      '"성장주는 항상 오른다"는 생각은 위험합니다. 기대가 꺾이면 급락할 수도 있습니다.',
      '"변동성이 높다 = 무조건 나쁘다"가 아니라, 리스크 허용도에 맞는지가 중요합니다.',
    ],
    priceHistory: toHistory([
      30000, 35500, 28800, 41000, 33500, 45200, 31000, 42800, 29500, 40100, 34700, 38000,
    ]),
  },
  {
    id: 'green-energy',
    name: 'GreenEnergy',
    type: '친환경 테마주',
    price: 24500,
    per: 31.6,
    pbr: 3.8,
    roe: 7.5,
    dividendYield: 0.5,
    volatility: '높음',
    chartPattern: '하락형',
    description:
      'GreenEnergy는 친환경 에너지 테마를 가진 가상 종목입니다. 테마가 부각될 때 단기간에 급등했다가, 기대감이 식으면서 조정을 받는 흐름을 학습 목적으로 담고 있습니다.',
    pros: [
      '산업 트렌드와 정책 기대감이 주가에 미치는 영향을 학습하기에 좋은 사례입니다.',
      'ROE 7.5%로 성장주 대비 상대적인 수익성은 확보하고 있습니다.',
    ],
    risks: [
      '테마주 특성상 기대감이 꺾이면 주가가 빠르게 하락할 수 있습니다.',
      '단기 급등 이후 고점에서 진입하면 큰 손실로 이어질 수 있습니다.',
    ],
    studyPoints: [
      '차트에서 급등 이후 하락하는 구간을 찾아보고, 그 이유를 추론해보세요.',
      '테마주 투자에서 "타이밍"이 왜 중요한 리스크 요인인지 생각해보세요.',
    ],
    indicatorInterpretation:
      'PER 31.6은 테마 기대감이 반영된 수준으로, 실적이 이를 뒷받침하지 못하면 밸류에이션 부담으로 작용할 수 있음을 보여주는 예시입니다.',
    misconceptions: [
      '"요즘 뜨는 테마니까 사도 된다"는 판단은 근거가 부족한 접근입니다.',
      '차트가 이미 많이 오른 뒤에는 추가 상승보다 조정 가능성도 함께 고려해야 합니다.',
    ],
    priceHistory: toHistory([
      38000, 42500, 45800, 41200, 36700, 33100, 29800, 27500, 26100, 25400, 24900, 24500,
    ]),
  },
  {
    id: 'daily-dividend',
    name: 'DailyDividend',
    type: '배당주',
    price: 51000,
    per: 15.1,
    pbr: 1.1,
    roe: 8.8,
    dividendYield: 4.3,
    volatility: '중간',
    chartPattern: '횡보형',
    description:
      'DailyDividend는 꾸준한 배당 지급을 특징으로 하는 가상 배당주입니다. 주가는 큰 등락 없이 일정 범위에서 움직이지만, 배당수익률이 상대적으로 높은 것이 특징입니다.',
    pros: [
      '배당수익률 4.3%로 꾸준한 현금흐름을 학습할 수 있는 사례입니다.',
      '변동성이 중간 수준으로 상대적으로 예측 가능한 흐름을 보입니다.',
    ],
    risks: [
      '주가 상승 여력이 크지 않아 자본 차익은 제한적일 수 있습니다.',
      '기업 실적이 악화되면 배당이 줄어들 수도 있다는 점을 학습해야 합니다.',
    ],
    studyPoints: [
      '배당수익률만 보고 투자하면 안 되는 이유를 스스로 설명해보세요.',
      '배당주가 포트폴리오에서 어떤 역할을 하는지 살펴보세요.',
    ],
    indicatorInterpretation:
      'PBR 1.1은 순자산 대비 주가가 크게 비싸지 않다는 의미로 해석 연습을 할 수 있으며, ROE 8.8%는 안정적인 수익 창출 능력을 보여주는 예시입니다.',
    misconceptions: [
      '"배당수익률이 높다 = 무조건 안전하다"는 오해입니다. 배당은 기업 상황에 따라 줄어들 수 있습니다.',
      '배당주도 주가 하락 리스크가 없는 것은 아닙니다.',
    ],
    priceHistory: toHistory([
      49500, 50200, 49800, 50600, 50100, 50900, 49700, 50400, 50800, 50300, 50700, 51000,
    ]),
  },
  {
    id: 'korea-etf-50',
    name: 'KoreaETF50',
    type: '지수형 ETF',
    price: 14800,
    per: 14.0,
    pbr: 1.2,
    roe: 9.2,
    dividendYield: 1.8,
    volatility: '중간',
    chartPattern: '상승형',
    description:
      'KoreaETF50은 여러 종목을 묶어 지수처럼 움직이는 가상 ETF 상품입니다. 개별 종목의 급격한 변동 대신 시장 전체의 흐름을 따라가는 특징을 학습할 수 있습니다.',
    pros: [
      '여러 종목에 분산되어 있어 개별 기업 리스크가 상대적으로 낮습니다.',
      '완만한 상승 흐름을 통해 장기투자 개념을 학습하기에 좋습니다.',
    ],
    risks: [
      '분산투자 효과가 있는 대신, 특정 종목처럼 급격한 수익을 기대하기는 어렵습니다.',
      '시장 전체가 하락하면 ETF도 함께 하락합니다.',
    ],
    studyPoints: [
      'ETF와 개별 종목 투자의 차이를 비교해보세요.',
      '분산투자가 왜 리스크 관리에 도움이 되는지 설명해보세요.',
    ],
    indicatorInterpretation:
      'ETF는 개별 재무지표보다 지수 전체의 흐름과 구성 종목의 분산 효과를 이해하는 것이 더 중요하다는 점을 학습할 수 있는 예시입니다.',
    misconceptions: [
      '"ETF는 절대 손실이 없다"는 생각은 잘못된 정보입니다.',
      '"분산투자 = 무조건 큰 수익"이 아니라, 리스크를 낮추는 방법이라는 점을 기억해야 합니다.',
    ],
    priceHistory: toHistory([
      12800, 13000, 13100, 13350, 13500, 13700, 13900, 14050, 14200, 14400, 14600, 14800,
    ]),
  },
]
