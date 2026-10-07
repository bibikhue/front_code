import { useState } from 'react'
import { getOverview, selectableMonths, monthLabel, numberLabel, rateLabel } from '../data/visitorDemo'
import './VisitorOverview.css'

function OverviewIcon({ name }) {
  const paths = {
    visitors: <><circle cx="9" cy="8" r="3" /><path d="M3 21v-3a6 6 0 0 1 12 0v3M17 5a3 3 0 0 1 0 6m1 4a5 5 0 0 1 3 5" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M7 3v4m10-4v4M3 11h18m-13 4h2m4 0h2" /></>,
    trend: <><path d="m3 17 6-6 4 4 8-10m-6 0h6v6" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18" /></>,
    download: <><path d="M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4" /></>,
  }
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

export function MetricCard({ icon, label, value, unit, detail, change, accent }) {
  return <article className={`overview-metric ${accent ? 'overview-metric-accent' : ''}`}>
    <div className="metric-heading"><span>{label}</span><span className="metric-icon"><OverviewIcon name={icon} /></span></div>
    <p className="metric-value">{value}<span>{unit}</span></p>
    <div className="metric-detail">{change !== undefined && <span className={change < 0 ? 'metric-change decrease' : 'metric-change'}>{rateLabel(change)}</span>}<span>{detail}</span></div>
  </article>
}

export function MonthlyChart({ rows, compare }) {
  const [hoveredMonth, setHoveredMonth] = useState(null)
  const selected = rows.find((row) => row.month === hoveredMonth) || rows.at(-1)
  const width = 760, height = 275, left = 48, right = 20, top = 20, bottom = 38
  const max = Math.ceil(Math.max(...rows.map((row) => Math.max(row.visitors, compare ? row.previousYear || 0 : 0))) / 100000) * 100000
  const x = (index) => rows.length === 1 ? (width + left - right) / 2 : left + index * (width - left - right) / (rows.length - 1)
  const y = (value) => height - bottom - value / max * (height - top - bottom)
  const points = rows.map((row, i) => `${x(i)},${y(row.visitors)}`).join(' ')
  const area = `M${x(0)} ${height - bottom} L${points.replaceAll(',', ' ')} L${x(rows.length - 1)} ${height - bottom} Z`
  return <>
    <div className="chart-readout"><span>{monthLabel(selected.month)}</span><strong>{numberLabel(selected.visitors)} <small>명</small></strong><span className="chart-readout-growth">전년 동월 {rateLabel(selected.yoy)}</span></div>
    <svg className="monthly-chart" viewBox={`0 0 ${width} ${height}`} role="group" aria-label="예시 데이터의 월별 외국인 방문객 추이. 차트와 표 전환에서 수치를 확인할 수 있습니다.">
      <defs><linearGradient id="visitor-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1687ca" stopOpacity=".2" /><stop offset="100%" stopColor="#1687ca" stopOpacity=".01" /></linearGradient></defs>
      {[0, 1, 2, 3, 4].map((tick) => <g key={tick}><line x1={left} x2={width - right} y1={y(max * tick / 4)} y2={y(max * tick / 4)} stroke="#e9eef3" strokeDasharray={tick ? '3 4' : undefined} /><text x={left - 10} y={y(max * tick / 4) + 4} textAnchor="end" fill="#8595a4" fontSize="11">{max * tick / 4 / 10000}만</text></g>)}
      <path d={area} fill="url(#visitor-area)" />
      {compare && <polyline points={rows.map((row, i) => `${x(i)},${y(row.previousYear || 0)}`).join(' ')} fill="none" stroke="#a8b9ca" strokeWidth="2" strokeDasharray="5 5" />}
      <polyline points={points} fill="none" stroke="#1687ca" strokeWidth="3" strokeLinejoin="round" />
      {rows.map((row, i) => <g key={row.month}>
        {(i % Math.ceil(rows.length / 6) === 0 || i === rows.length - 1) && <text x={x(i)} y={height - 10} textAnchor="middle" fill="#8595a4" fontSize="11">{row.month.replace('-', '.')}</text>}
        <circle cx={x(i)} cy={y(row.visitors)} r={selected.month === row.month ? 5 : 3} fill="white" stroke="#1687ca" strokeWidth="2" />
        <circle cx={x(i)} cy={y(row.visitors)} r="13" fill="transparent" tabIndex="0" aria-label={`${monthLabel(row.month)}, ${numberLabel(row.visitors)}명, 전년 동월 대비 ${rateLabel(row.yoy)}`} onMouseEnter={() => setHoveredMonth(row.month)} onMouseLeave={() => setHoveredMonth(null)} onFocus={() => setHoveredMonth(row.month)} onBlur={() => setHoveredMonth(null)}><title>{monthLabel(row.month)} · {numberLabel(row.visitors)}명</title></circle>
      </g>)}
    </svg>
    <div className="chart-legend"><span><i className="legend-current" />선택 기간</span>{compare && <span><i className="legend-previous" />전년 동월</span>}<span className="chart-unit">단위: 명 · 예시 데이터</span></div>
  </>
}

export default function VisitorOverview({ onOpen }) {
  const [start, setStart] = useState('2025-01')
  const [end, setEnd] = useState('2025-12')
  const [compare, setCompare] = useState(true)
  const [display, setDisplay] = useState('chart')
  const { rows, total, totalGrowth, latest, countries, peak } = getOverview(start, end)
  const topCountry = countries.find((country) => country.code !== 'ETC')
  const chartCountries = [...countries.filter((country) => country.code !== 'ETC'), countries.find((country) => country.code === 'ETC')]
  let position = 0
  const donutStops = chartCountries.map((country) => { const from = position; position += country.share; return `${country.color} ${from}% ${position}%` }).join(', ')
  const chooseRange = (months) => {
    const endIndex = selectableMonths.indexOf(end)
    setStart(selectableMonths[Math.max(0, endIndex - months + 1)])
  }
  const reset = () => { setStart('2025-01'); setEnd('2025-12'); setCompare(true) }
  const download = () => {
    const lines = ['데이터 구분,기준월,방문객 수(명),전년 동월 방문객 수(명),전년 동월 대비(%),전월 대비(%)', ...rows.map((row) => ['화면 미리보기용 예시 데이터', row.month, row.visitors, row.previousYear ?? '', row.yoy?.toFixed(1) ?? '', row.mom?.toFixed(1) ?? ''].join(','))]
    const url = URL.createObjectURL(new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a'); link.href = url; link.download = `맙소사_방문현황_예시_${start}_${end}.csv`; link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return <div className="visitor-overview">
    <div className="overview-container">
      <nav className="overview-breadcrumb" aria-label="현재 위치"><a href="#/">홈</a><span aria-hidden="true">›</span><span>부산 관광 한눈에</span><span aria-hidden="true">›</span><span aria-current="page">전체 방문 현황</span></nav>
      <div className="overview-title-row"><div><p className="overview-eyebrow">BUSAN VISITOR OVERVIEW</p><h1>전체 방문 현황</h1><p className="overview-subtitle">부산을 찾는 외국인 관광객, 그 흐름을 한눈에 살펴보세요.</p></div><span className="overview-region"><OverviewIcon name="globe" />부산광역시 전체</span></div>
      <div className="overview-demo-notice"><span>미리보기</span><p>현재 수치는 화면 구성을 위한 <strong>예시 데이터</strong>입니다. 실제 관광 통계와 다릅니다.</p><button onClick={() => onOpen('데이터 출처·기준')}>데이터 안내 ↗</button></div>
      <section className="overview-filters" aria-label="조회 조건">
        <div className="overview-filter-fields"><span className="filter-label"><OverviewIcon name="calendar" />조회 기간</span><label><span className="visually-hidden">시작 월</span><select value={start} onChange={(event) => { setStart(event.target.value); if (event.target.value > end) setEnd(event.target.value) }}>{selectableMonths.map((month) => <option key={month} value={month}>{monthLabel(month)}</option>)}</select></label><span className="filter-range-divider">—</span><label><span className="visually-hidden">종료 월</span><select value={end} onChange={(event) => { setEnd(event.target.value); if (event.target.value < start) setStart(event.target.value) }}>{selectableMonths.map((month) => <option key={month} value={month}>{monthLabel(month)}</option>)}</select></label></div>
        <div className="overview-filter-actions"><button className="range-preset" onClick={() => chooseRange(6)}>6개월</button><button className="range-preset" onClick={() => chooseRange(12)}>12개월</button><button className="filter-reset" onClick={reset}>초기화</button></div>
      </section>
      <div className="overview-period-caption"><span>{monthLabel(start)} — {monthLabel(end)} <strong>· {rows.length}개월</strong></span><button onClick={download}><OverviewIcon name="download" />예시 데이터 CSV</button></div>
      <section className="overview-metrics" aria-label="주요 방문 지표">
        <MetricCard icon="visitors" label={`${monthLabel(end)} 방문객`} value={numberLabel(latest.visitors)} unit="명" change={latest.yoy} detail="전년 동월 대비" accent />
        <MetricCard icon="calendar" label="조회 기간 누적 방문객" value={(total / 10000).toFixed(1)} unit="만 명" change={totalGrowth} detail="전년 동일 기간 대비" />
        <MetricCard icon="trend" label="전월 대비 변화" value={rateLabel(latest.mom)} detail={`${monthLabel(end)} 기준`} />
        <MetricCard icon="globe" label="조회 기간 주요 방문 국가" value={topCountry.name} unit={`${topCountry.share.toFixed(1)}%`} detail="조회 기간 전체 방문객 중 비중" />
      </section>
      <div className="overview-chart-grid">
        <section className="overview-panel trend-panel" aria-labelledby="trend-title">
          <div className="panel-heading"><div><h2 id="trend-title">월별 방문객 추이</h2><p>방문 흐름을 전년 같은 달과 비교해 보세요.</p></div><div className="chart-view-toggle" aria-label="보기 방식"><button aria-pressed={display === 'chart'} onClick={() => setDisplay('chart')}>차트</button><button aria-pressed={display === 'table'} onClick={() => setDisplay('table')}>표</button></div></div>
          <label className="chart-compare"><input type="checkbox" checked={compare} onChange={(event) => setCompare(event.target.checked)} />전년 동월 함께 보기</label>
          {display === 'chart' ? <MonthlyChart rows={rows} compare={compare} /> : <div className="overview-table-scroll"><table className="overview-table"><caption className="visually-hidden">선택 기간 월별 방문객 예시 데이터</caption><thead><tr><th scope="col">기준 월</th><th scope="col">방문객 수</th>{compare && <th scope="col">전년 동월</th>}<th scope="col">전년 대비</th></tr></thead><tbody>{rows.map((row) => <tr key={row.month}><th scope="row">{row.month.replace('-', '.')}</th><td>{numberLabel(row.visitors)}명</td>{compare && <td>{numberLabel(row.previousYear)}명</td>}<td>{rateLabel(row.yoy)}</td></tr>)}</tbody></table></div>}
          <p className="panel-footnote">월별 방문객을 합산한 값으로, 기간 전체의 중복 제거 인원과는 다릅니다.</p>
        </section>
        <section className="overview-panel country-panel" aria-labelledby="country-title">
          <div className="panel-heading"><div><h2 id="country-title">주요 방문 국가</h2><p>조회 기간 누적 방문객 기준</p></div><span className="panel-badge">예시</span></div>
          <div className="country-donut" style={{ background: `conic-gradient(${donutStops})` }} role="img" aria-label={`예시 데이터 국가별 비중: ${chartCountries.map((country) => `${country.name} ${country.share.toFixed(1)}%`).join(', ')}`}><div><span>전체 방문객</span><strong>100<small>%</small></strong></div></div>
          <ul className="country-ranking">{chartCountries.map((country) => <li key={country.code}><span className="country-color" style={{ background: country.color }} /><span className="country-name">{country.name}</span><span className="country-count">{(country.visitors / 10000).toFixed(1)}만 명</span><strong>{country.share.toFixed(1)}%</strong></li>)}</ul>
        </section>
      </div>
      <section className="overview-insight" aria-labelledby="insight-title"><span className="insight-icon"><OverviewIcon name="trend" /></span><div><h2 id="insight-title">선택 기간을 읽는 포인트 <span>예시 데이터 기준</span></h2><p>조회 기간 중 방문객이 가장 많은 달은 <strong>{monthLabel(peak.month)}</strong>이며, <strong>{numberLabel(peak.visitors)}명</strong>입니다. 주요 방문 국가는 <strong>{topCountry.name}({topCountry.share.toFixed(1)}%)</strong>으로 나타납니다.</p></div></section>
      <div className="overview-source-note"><span>데이터 상태: 실제 자료 연동 전 · 화면 미리보기용 예시</span><button onClick={() => onOpen('분석 범위 안내')}>분석 범위 확인 ↗</button></div>
    </div>
  </div>
}
