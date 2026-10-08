import { visitorFacts, countryNames } from './chat-data.mjs'
import { selectableMonths, monthLabel, numberLabel, rateLabel } from '../src/data/visitorDemo.js'
import { monthCounts } from '../src/data/eventCalendar.js'
import { koreaDate } from '../src/data/miceEvents.js'

export const reportFocus = { overview: '관광수요 주요 변화', markets: '국가별 수요 특징', implications: '정책·마케팅 시사점' }
export function validateReportOptions(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload) || Object.keys(payload).some(k => !['start','end','country','focus','eventMonth'].includes(k))) throw new Error('Invalid report options')
  const { start, end, country = 'ALL', focus = 'overview', eventMonth = null } = payload
  if (!selectableMonths.includes(start) || !selectableMonths.includes(end) || start > end || !Object.hasOwn(countryNames, country) || !Object.hasOwn(reportFocus, focus)) throw new Error('Invalid report range')
  if (eventMonth !== null) {
    const current = koreaDate().slice(0, 7)
    const monthIndex = value => Number(value.slice(0, 4)) * 12 + Number(value.slice(5))
    if (typeof eventMonth !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(eventMonth) || Math.abs(monthIndex(eventMonth) - monthIndex(current)) > 12) throw new Error('Invalid event month')
  }
  return { start, end, country, focus, eventMonth }
}

export async function reportEvidence(options, getMonth) {
  const visitors = visitorFacts(options)
  if (!visitors.available) throw new Error('Visitor data unavailable')
  const selectedMarket = options.country === 'ALL' ? null : visitors.countries.find(c => c.code === options.country)
  const display = {
    period: `${monthLabel(options.start)} ~ ${monthLabel(options.end)}`,
    total: `${numberLabel(visitors.total)}명`, growth: rateLabel(visitors.totalGrowth),
    latest: `${monthLabel(visitors.latest.month)} ${numberLabel(visitors.latest.visitors)}명`,
    latestYoy: rateLabel(visitors.latest.yoy), latestMom: rateLabel(visitors.latest.mom),
    peak: `${monthLabel(visitors.peak.month)} ${numberLabel(visitors.peak.visitors)}명`,
    markets: (selectedMarket ? [selectedMarket] : visitors.countries).map(c => `${c.name} ${numberLabel(c.visitors)}명 · 전체 대비 ${c.share.toFixed(1)}%`),
    regions: options.country === 'ALL' ? visitors.regions.map(r => `${r.name} ${numberLabel(r.visitors)}명 · ${r.share.toFixed(1)}%`) : [],
  }
  let events = null
  const sources = [...visitors.sources]
  if (options.eventMonth) {
    try {
      const snapshot = await getMonth(options.eventMonth)
      const counts = monthCounts(snapshot.events, options.eventMonth)
      const peak = Math.max(0, ...counts.map(d => d.count))
      const dates = counts.filter(d => peak > 0 && d.count === peak).map(d => d.date)
      events = { available: true, month: options.eventMonth, total: snapshot.events.length, peak, dates, fetchedAt: snapshot.fetchedAt, stale: snapshot.stale, note: '날짜별 동시 진행 행사 건수이며 실제 방문객 수나 혼잡도가 아닙니다. 선택한 방문객 기간 및 국가와 별개인 부산 전체 일정입니다.' }
      display.events = `${monthLabel(options.eventMonth)} 부산 전체 등록 행사 ${events.total}건. 동시 진행 최대 ${peak}건${dates.length ? `, 날짜 ${dates.join(', ')}` : ''}. ${snapshot.stale ? '갱신 실패로 이전 자료 사용.' : '공식 일정 조회.'}`
      sources.push({ id: 'mice', label: '부산 MICE 플랫폼 · 공식 행사 일정', url: snapshot.sourceUrl, kind: 'official', fetchedAt: snapshot.fetchedAt, stale: snapshot.stale })
    } catch {
      events = { available: false, month: options.eventMonth, note: '공식 행사 일정 조회에 실패했습니다. 행사 수치는 리포트에서 제외했습니다.' }
      display.events = events.note
    }
  }
  return { visitors, display, events, sources, country: visitors.country, focus: reportFocus[options.focus], isDemo: true }
}

export function numericSummary(evidence) {
  const { display: d, visitors: v, events: e, country } = evidence
  return {
    summary: `${d.period} ${country} 방문객의 월별 합산은 ${d.total}이며, 전년 동일 기간 대비 ${d.growth}입니다. 화면 미리보기용 예시 데이터입니다.`,
    trend: [`기간 내 최대 방문월은 ${d.peak}입니다.`, `선택 기간의 마지막 월은 ${d.latest}이며, 전년 동월 대비 ${d.latestYoy}, 전월 대비 ${d.latestMom}입니다. 단일 기간 관찰만으로 반복적인 계절성이나 변화 원인을 확정할 수 없습니다.`],
    markets: [`${country === '전체' ? '선택 기간의 주요 시장 구성' : '선택 국가의 전체 방문객 대비 비중'}: ${d.markets.slice(0, 3).join('; ')}.`, ...(d.regions.length ? [`출발 시장 권역: ${d.regions.join('; ')}. 기타 국가는 권역 미분류로 유지합니다.`] : [])],
    events: e ? [d.events, e.available ? e.note : '일정 조회를 다시 시도해 주세요.'] : [],
    implications: [evidence.focus === '국가별 수요 특징' ? '국가별 규모와 비중을 같은 기간으로 비교하세요. 방문 목적·소비 구조와 참가자 국적은 현재 자료로 판단할 수 없습니다.' : evidence.focus === '정책·마케팅 시사점' ? '예시 자료의 변화만으로 예산이나 운영 인력을 결정할 수 없습니다. 실제 월별 통계와 현장 수요를 확인한 뒤 대응 시점과 우선 시장을 검토하세요.' : '실제 통계가 연동되면 전년 동월과 전월 변화를 함께 비교하고, 증가·감소 원인은 별도 근거로 확인하세요.', v.note, '검증된 전망과 소비 자료는 미연동 상태이며, 이 리포트는 향후 수요를 예측하지 않습니다.'],
  }
}
