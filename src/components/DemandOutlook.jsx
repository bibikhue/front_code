import { useState } from 'react'
import MiceCalendar from './MiceCalendar'
import { monthLabel } from '../data/visitorDemo'
import { koreaDate, nextCalendarMonth } from '../data/miceEvents'

export default function DemandOutlook({ onOpen }) {
  const [ranking, setRanking] = useState('volume')
  const today = koreaDate()
  const month = nextCalendarMonth(today)
  return <div className="dashboard-outlook-grid">
    <section className="overview-panel dashboard-forecast" aria-labelledby="forecast-title">
      <div className="panel-heading"><div><p className="dashboard-small-eyebrow">NEXT MONTH</p><h2 id="forecast-title">다음 달 주목할 국가</h2><p>{monthLabel(month)} 전망</p></div><span className="panel-badge">예측 준비 중</span></div>
      <div className="chart-view-toggle forecast-ranking-toggle" aria-label="예측 순위 기준"><button aria-pressed={ranking === 'volume'} onClick={() => setRanking('volume')}>예상 방문 규모</button><button aria-pressed={ranking === 'growth'} onClick={() => setRanking('growth')}>예상 증가율</button></div>
      <div className="dashboard-forecast-empty"><span className="forecast-empty-mark" aria-hidden="true">↗</span><h3>{ranking === 'volume' ? '많이 방문할 국가를 미리 확인하세요' : '방문 수요가 늘어날 국가를 살펴보세요'}</h3><p>{ranking === 'volume' ? '국가별 예상 방문객 수와 예측 범위를 함께 보여드립니다.' : '예상 전월 대비 증가율과 방문 규모를 함께 비교합니다.'}</p><span>현재는 검증된 예측 결과가 없어 국가 순위를 제공하지 않습니다.</span></div>
      <button className="dashboard-detail-link" onClick={() => onOpen('국가별 방문객 전망')}>국가별 전망 구성 안내 ↗</button>
    </section>
    <MiceCalendar />
  </div>
}
