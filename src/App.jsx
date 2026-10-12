import { useEffect, useRef, useState } from 'react'
import './App.css'
import VisitorOverview from './components/VisitorOverview'
import ProjectIntro from './components/ProjectIntro'
import DashboardHome from './components/DashboardHome'
import DataChatbot from './components/DataChatbot'
import AnalysisReport from './components/AnalysisReport'
import EventCalendarPage from './components/EventCalendarPage'
import CountryTourism from './components/CountryTourism'
import ForecastOutlook from './components/ForecastOutlook'
import { loadTourismOverviewData } from './data/tourismOverviewData'
import { monthLabel } from './data/visitorDemo'

const menus = [
  ['부산 관광 한눈에', '핵심 지표 요약', '월별 방문 추이', '지역별 현황', '업종별 소비'],
  ['국가별 관광', '국가 비교', '국가별 상세', '계절성 비교', '언어권별 관심 관광지'],
  ['관광수요 전망', '부산 방문객 전망', '국가별 방문객 전망', '예측 정확도'],
  ['분석 리포트', '자동 리포트', '관광수요 주요 변화', '국가별 수요 특징', '정책·마케팅 시사점'],
  ['부산 행사 캘린더', '부산 행사 캘린더'],
  ['프로젝트 소개', '프로젝트 소개', '분석 범위 안내', '데이터 출처·기준'],
]
const menuDescriptions = {
  '핵심 지표 요약': '최근 한 달 방문객 수와 소비액',
  '월별 방문 추이': '월별 방문객 수의 변화',
  '지역별 현황': '구·군별 방문객과 소비액',
  '업종별 소비': '업종별 소비액과 비중',
  '국가 비교': '국가별 방문객 수와 1인당 소비액',
  '국가별 상세': '국가별 방문 추이와 소비 특성',
  '계절성 비교': '국가별 성수기와 비수기',
  '언어권별 관심 관광지': '언어권별 관광지 검색 순위',
  '부산 방문객 전망': '향후 12개월 방문객 예측',
  '국가별 방문객 전망': '다음 달 국가별 방문객 예측',
  '예측 정확도': '예측값과 실제값의 비교',
  '자동 리포트': '기간과 국가를 골라 만드는 요약 보고서',
  '관광수요 주요 변화': '선택 기간의 주요 변화 요약',
  '국가별 수요 특징': '국가별 수요 규모와 비중',
  '정책·마케팅 시사점': '분석 결과에 따른 대응 방향',
  '프로젝트 소개': '프로젝트의 목적과 메뉴 구성',
  '분석 범위 안내': '제공 범위와 해석 시 유의사항',
  '데이터 출처·기준': '데이터 출처와 용어 설명',
}
const pendingMenus = new Set(['언어권별 관심 관광지'])
const menuPages = ['visitors', 'countries', 'outlook', 'reports', 'events', 'project']
const visitorRoutes = { '핵심 지표 요약': 'kpi', '월별 방문 추이': 'trend', '지역별 현황': 'region', '업종별 소비': 'industry' }
const visitorFocus = hash => { const focus = new URLSearchParams(hash.split('?')[1] || '').get('focus'); return Object.values(visitorRoutes).includes(focus) ? focus : 'kpi' }
const countryRoutes = { '국가 비교': 'compare', '국가별 상세': 'detail', '계절성 비교': 'season', '언어권별 관심 관광지': 'interest' }
const countryFocus = hash => { const focus = new URLSearchParams(hash.split('?')[1] || '').get('focus'); return Object.values(countryRoutes).includes(focus) ? focus : 'compare' }
const countryCode = hash => new URLSearchParams(hash.split('?')[1] || '').get('country')
const outlookRoutes = { '부산 방문객 전망': 'busan', '국가별 방문객 전망': 'countries', '예측 정확도': 'accuracy' }
const outlookFocus = hash => { const focus = new URLSearchParams(hash.split('?')[1] || '').get('focus'); return Object.values(outlookRoutes).includes(focus) ? focus : 'busan' }
const projectRoutes = { '프로젝트 소개': 'about', '분석 범위 안내': 'scope', '데이터 출처·기준': 'data' }
const projectFocus = hash => { const focus = new URLSearchParams(hash.split('?')[1] || '').get('focus'); return Object.values(projectRoutes).includes(focus) ? focus : 'about' }
const reportRoutes = { '자동 리포트': 'overview', '관광수요 주요 변화': 'overview', '국가별 수요 특징': 'markets', '국가별 분석 결과': 'markets', '정책·마케팅 시사점': 'implications' }
const reportFocus = (hash) => new URLSearchParams(hash.split('?')[1] || '').get('focus') || 'overview'
const getPage = () => window.location.hash === '#/events' ? 'events' : window.location.hash.startsWith('#/reports') ? 'reports' : window.location.hash.split('?')[0] === '#/project' ? 'project' : window.location.hash.split('?')[0] === '#/visitors' ? 'visitors' : window.location.hash.split('?')[0] === '#/countries' ? 'countries' : window.location.hash.split('?')[0] === '#/outlook' ? 'outlook' : 'dashboard'

function Icon({ name }) {
  const paths = {
    chevron: <path d="m5 9 7 7 7-7" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
  }
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function Logo() {
  return <a className="brand" href="#/" aria-label="팀 맙소사 홈">
    <img className="brand-emblem" src="/brand/mapsosa-emblem-clear.png" alt="" width="64" height="64" />
    <span className="brand-copy"><strong>맙소사</strong><span>데이터로 읽는 부산 관광</span></span>
  </a>
}

function Footer({ onOpen, dataStatus }) {
  return <footer className="site-footer">
    <div className="footer-inner">
      <div className="footer-top">
        <a className="footer-brand" href="#/" aria-label="팀 맙소사 홈">
          <img className="footer-emblem" src="/brand/mapsosa-emblem-clear.png" alt="" width="44" height="44" />
          <span className="footer-brand-copy"><strong>맙소사</strong><span>데이터로 읽는 부산 관광</span></span>
        </a>
        <nav className="footer-links" aria-label="푸터 메뉴">
          <a href="#/project?focus=about" onClick={event => { event.preventDefault(); onOpen('프로젝트 소개') }}>프로젝트 소개</a>
          <a href="#/project?focus=scope" onClick={event => { event.preventDefault(); onOpen('분석 범위 안내') }}>분석 범위 안내</a>
          <a className="footer-data-link" href="#/project?focus=data" onClick={event => { event.preventDefault(); onOpen('데이터 출처·기준') }}>데이터 출처·기준</a>
          <button onClick={() => onOpen('사이트맵')}>사이트맵</button>
        </nav>
      </div>
      <div className="footer-bottom">
        <p className="footer-copyright">© 2026 팀 맙소사</p>
        <p className="footer-data-note"><span className="footer-data-desktop">방문객·소비 {dataStatus?.isMock ? '예시 자료' : '자료'}{dataStatus?.asOf ? `(기준 ${monthLabel(dataStatus.asOf)})` : '(기준 확인 중)'} · 행사 일정 부산 MICE 플랫폼 · 예측은 참고 정보</span><span className="footer-data-mobile">방문객·소비 {dataStatus?.isMock ? '예시 자료' : '자료'}({dataStatus?.asOf ? monthLabel(dataStatus.asOf) : '기준 확인 중'}) · 부산 MICE · 예측 참고</span></p>
        <button className="footer-top-button" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}>맨 위로 <span aria-hidden="true">↑</span></button>
      </div>
    </div>
  </footer>
}

function App() {
  const [activeMenu, setActiveMenu] = useState(null)
  const [dialog, setDialog] = useState(null)
  const [dataStatus, setDataStatus] = useState(null)
  const [page, setPage] = useState(getPage)
  const [pageHash, setPageHash] = useState(() => window.location.hash)
  const menuButtons = useRef([])
  const navigation = useRef(null)
  useEffect(() => {
    const controller = new AbortController()
    loadTourismOverviewData({ signal: controller.signal }).then(data => {
      setDataStatus({ isMock: data.isMock, asOf: data.asOf })
    }).catch(error => { if (error.name !== 'AbortError') console.error('데이터 상태를 불러오지 못했습니다.', error) })
    return () => controller.abort()
  }, [])
  useEffect(() => {
    document.title = page === 'events' ? '부산 행사 캘린더 | 맙소사' : page === 'reports' ? '자동 분석 리포트 | 맙소사' : page === 'project' ? '프로젝트 소개 | 맙소사' : page === 'visitors' ? '부산 관광 한눈에 | 맙소사' : page === 'countries' ? '국가별 관광 | 맙소사' : page === 'outlook' ? '관광수요 전망 | 맙소사' : '맙소사 | 부산 관광 대시보드'
  }, [page])
  useEffect(() => {
    const updatePage = () => {
      setPage(getPage())
      setPageHash(window.location.hash)
      setActiveMenu(null)
      setDialog(null)
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    window.addEventListener('hashchange', updatePage)
    return () => window.removeEventListener('hashchange', updatePage)
  }, [])
  useEffect(() => {
    const close = (event) => {
      if (event.key !== 'Escape') return
      if (activeMenu !== null && navigation.current?.contains(document.activeElement)) menuButtons.current[activeMenu]?.focus()
      setActiveMenu(null)
      setDialog(null)
    }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [activeMenu])
  const openCountryHash = destination => {
    setDialog(null)
    const hash = destination.startsWith('#') ? destination : `#${destination}`
    if (window.location.hash === hash) {
      requestAnimationFrame(() => {
        const section = document.getElementById(`country-${countryFocus(hash)}`)
        section?.scrollIntoView({ block: 'start', behavior: 'instant' })
        section?.focus({ preventScroll: true })
      })
    } else window.location.assign(hash)
  }
  const openDialog = (title) => {
    setActiveMenu(null)
    if (title.startsWith('#/countries')) {
      openCountryHash(title)
      return
    }
    if (Object.hasOwn(visitorRoutes, title)) {
      setDialog(null)
      setPage('visitors')
      const destination = `/visitors?focus=${visitorRoutes[title]}`
      if (window.location.hash === `#${destination}`) {
        requestAnimationFrame(() => { const section = document.getElementById(`visitor-${visitorRoutes[title]}`); section?.scrollIntoView({ block: 'start', behavior: 'instant' }); section?.focus({ preventScroll: true }) })
      } else window.location.assign(`#${destination}`)
      return
    }
    if (Object.hasOwn(countryRoutes, title) || title === '국가별 방문 규모') {
      openCountryHash(`/countries?focus=${countryRoutes[title] || 'compare'}`)
      return
    }
    if (Object.hasOwn(outlookRoutes, title)) {
      setDialog(null)
      const destination = `/outlook?focus=${outlookRoutes[title]}`
      if (window.location.hash === `#${destination}`) {
        requestAnimationFrame(() => { const section = document.getElementById(`outlook-${outlookRoutes[title]}`); section?.scrollIntoView({ block: 'start', behavior: 'instant' }); section?.focus({ preventScroll: true }) })
      } else window.location.assign(`#${destination}`)
      return
    }
    if (Object.hasOwn(projectRoutes, title)) {
      setDialog(null)
      const destination = `/project?focus=${projectRoutes[title]}`
      if (window.location.hash === `#${destination}`) {
        requestAnimationFrame(() => { const section = document.getElementById(`project-${projectRoutes[title]}`); section?.scrollIntoView({ block: 'start', behavior: 'instant' }); section?.focus({ preventScroll: true }) })
      } else window.location.assign(`#${destination}`)
      return
    }
    if (title === '부산 행사 캘린더') {
      setDialog(null)
      setPage('events')
      window.location.assign('#/events')
      window.scrollTo({ top: 0, behavior: 'instant' })
      return
    }
    if (Object.hasOwn(reportRoutes, title)) {
      setDialog(null)
      setPage('reports')
      window.location.assign(`#/reports?focus=${reportRoutes[title]}`)
      window.scrollTo({ top: 0, behavior: 'instant' })
      return
    }
    if (title === '전체 방문 현황') {
      setDialog(null)
      setPage('visitors')
      window.location.assign('#/visitors')
      window.scrollTo({ top: 0, behavior: 'instant' })
      return
    }
    if (title === '사이트맵') setDialog(title)
  }

  return <>
    <header className="site-header">
      <div className="header-main">
        <Logo />
        <div className="header-status">
          {dataStatus?.isMock && <span className="status-badge">예시 자료</span>}
          <span className="status-description">방문객 자료 기준 <strong>{dataStatus?.asOf ? monthLabel(dataStatus.asOf) : '확인 중'}</strong></span>
          <a className="status-source" href="#/project?focus=data" onClick={event => { event.preventDefault(); openDialog('데이터 출처·기준') }}>데이터 출처·기준</a>
        </div>
      </div>
      <nav className="main-navigation" aria-label="주 메뉴" ref={navigation}>
          <div className="navigation-inner">
            {menus.map(([title, ...items], index) => {
              const current = page === menuPages[index]
              const expanded = activeMenu === index
              return <div className="navigation-item" key={title}>
                <button ref={element => { menuButtons.current[index] = element }} className={`navigation-button${current ? ' current' : ''}${expanded ? ' active' : ''}`} aria-current={current ? 'page' : undefined} aria-expanded={title === '부산 행사 캘린더' ? undefined : expanded} aria-controls={title === '부산 행사 캘린더' ? undefined : `menu-${index}`} onClick={() => title === '부산 행사 캘린더' ? openDialog(title) : setActiveMenu(expanded ? null : index)}>{title}{title !== '부산 행사 캘린더' && <Icon name="chevron" />}</button>
                {expanded && <div className="dropdown" id={`menu-${index}`}>{items.map(item => <button key={item} onClick={() => openDialog(item)}><span className="dropdown-copy"><strong>{item}</strong><span>{menuDescriptions[item]}</span></span>{pendingMenus.has(item) && <span className="dropdown-pending">준비 중</span>}</button>)}</div>}
              </div>
            })}
          </div>
      </nav>
      <div className="status-mobile-bar">
        <span className="status-mobile"><span>{dataStatus?.isMock ? '미리보기용 수치' : '방문객·소비 수치'} · 기준 {dataStatus?.asOf ? monthLabel(dataStatus.asOf) : '확인 중'} · </span><a href="#/project?focus=data" onClick={event => { event.preventDefault(); openDialog('데이터 출처·기준') }}>출처 보기</a></span>
      </div>
    </header>
    <main className="dashboard-main" aria-label="대시보드" onClick={() => setActiveMenu(null)}>
      {page === 'events' ? <EventCalendarPage /> : page === 'reports' ? <AnalysisReport key={pageHash} initialFocus={reportFocus(pageHash)} /> : page === 'project' ? <ProjectIntro focus={projectFocus(pageHash)} navigationKey={pageHash} /> : page === 'visitors' ? <VisitorOverview onOpen={openDialog} focus={visitorFocus(pageHash)} navigationKey={pageHash} /> : page === 'countries' ? <CountryTourism focus={countryFocus(pageHash)} country={countryCode(pageHash)} navigationKey={pageHash} onOpen={openDialog} /> : page === 'outlook' ? <ForecastOutlook focus={outlookFocus(pageHash)} navigationKey={pageHash} /> : <DashboardHome onOpen={openDialog} />}
    </main>
    <Footer onOpen={openDialog} dataStatus={dataStatus} />
    <div className="footer-chatbot-space" aria-hidden="true" />
    <DataChatbot />
    {dialog && <div className="modal-backdrop" onClick={() => setDialog(null)}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-heading"><h1 id="dialog-title">{dialog}</h1><button autoFocus aria-label="닫기" onClick={() => setDialog(null)}><Icon name="close" /></button></div>
        {dialog === '사이트맵' && <div className="sitemap">{menus.map(([title, ...items]) => <div key={title}><h2>{title}</h2>{items.map((item) => <button key={item} onClick={() => openDialog(item)}>{item}</button>)}</div>)}</div>}
      </section>
    </div>}
  </>
}
export default App
