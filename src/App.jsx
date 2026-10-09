import { useEffect, useState } from 'react'
import './App.css'
import VisitorOverview from './components/VisitorOverview'
import ProjectIntro from './components/ProjectIntro'
import DashboardHome from './components/DashboardHome'
import DataChatbot from './components/DataChatbot'
import AnalysisReport from './components/AnalysisReport'
import EventCalendarPage from './components/EventCalendarPage'
import CountryTourism from './components/CountryTourism'
1
const menus = [
  ['부산 관광 한눈에', '핵심 지표 요약', '월별 방문 추이', '지역별 현황', '업종별 소비'],
  ['국가별 관광', '국가 비교', '국가별 상세', '계절성 비교', '언어권별 관심 관광지'],
  ['관광수요 전망', '부산 방문객 전망', '국가별 방문객 전망', '예측 정확도'],
  ['분석 리포트', '자동 리포트', '관광수요 주요 변화', '국가별 수요 특징', '정책·마케팅 시사점'],
  ['부산 행사 캘린더', '부산 행사 캘린더'],
  ['프로젝트 소개', '프로젝트 소개', '팀 맙소사 소개', '분석 범위 안내', '데이터 출처·기준'],
]
const visitorRoutes = { '핵심 지표 요약': 'kpi', '월별 방문 추이': 'trend', '지역별 현황': 'region', '업종별 소비': 'industry' }
const visitorFocus = hash => { const focus = new URLSearchParams(hash.split('?')[1] || '').get('focus'); return Object.values(visitorRoutes).includes(focus) ? focus : 'kpi' }
const countryRoutes = { '국가 비교': 'compare', '국가별 상세': 'detail', '계절성 비교': 'season', '언어권별 관심 관광지': 'interest' }
const countryFocus = hash => { const focus = new URLSearchParams(hash.split('?')[1] || '').get('focus'); return Object.values(countryRoutes).includes(focus) ? focus : 'compare' }
const countryCode = hash => new URLSearchParams(hash.split('?')[1] || '').get('country')
const reportRoutes = { '자동 리포트': 'overview', '관광수요 주요 변화': 'overview', '국가별 수요 특징': 'markets', '국가별 분석 결과': 'markets', '정책·마케팅 시사점': 'implications' }
const reportFocus = (hash) => new URLSearchParams(hash.split('?')[1] || '').get('focus') || 'overview'
const getPage = () => window.location.hash === '#/events' ? 'events' : window.location.hash.startsWith('#/reports') ? 'reports' : window.location.hash === '#/project' ? 'project' : window.location.hash.split('?')[0] === '#/visitors' ? 'visitors' : window.location.hash.split('?')[0] === '#/countries' ? 'countries' : 'dashboard'

const notice = '부산 외국인 관광수요의 흐름을 읽고, 변화와 다음 수요를 전망합니다.'
const analysisDescriptions = {
  '관광수요 주요 변화': '부산 외국인 관광수요의 주요 흐름과 변화를 종합해 설명합니다. 분석 과정에서 발견한 특이 변화는 시점과 근거, 해석의 한계를 함께 정리합니다.',
  '국가별 수요 특징': '국가별 계절성, 수요 변동과 방문 비중을 종합해 각 시장의 특징을 설명합니다. 개별 지표를 넘어 국가 간 공통점과 차이점을 분석 결과로 정리합니다.',
  '정책·마케팅 시사점': '분석 결과를 바탕으로 관광정책 담당자와 소상공인이 참고할 수 있는 대응 시점, 우선순위와 마케팅 활용 방향을 정리합니다.',
  '전체 방문 현황': '부산 전체의 월별 외국인 방문객 수, 전년 동월 대비 증감률, 주요 국가 비중을 한 화면에서 비교합니다.',
  '월별 방문객 추이': '기간을 선택해 부산 외국인 방문객 수의 흐름과 계절적 특징을 살펴봅니다.',
  '방문객 증감률': '전월 대비와 전년 동월 대비 증감률을 함께 살펴보고, 계절적 변화와 성장 흐름을 구분합니다.',
  '국가별 방문 규모': '같은 기간의 국가별 방문객 규모와 성장률을 비교합니다.',
  '국가별 관광 특성': '국가별 방문 추이와 계절적 특징, 수요의 변동성을 종합합니다. 방문목적과 관광객 특성은 부산 단위 자료 확보 여부에 따라 추가합니다.',
  '국가별 방문 비중': '부산 외국인 방문객 중 각 국가가 차지하는 비중과 그 변화를 비교하고, 주요 국가에 대한 수요 의존도를 살펴봅니다.',
  '국가별 분석 결과': '국가별 방문 흐름을 분석한 결과와 해석을 정리합니다. 계절성·변동성과 분석 과정에서 파악한 특이 변화는 관련 결과의 설명에 포함합니다.',
  '부산 방문객 전망': '과거 월별 방문객 데이터를 바탕으로 향후 수요를 예측하고, 전망 범위와 기준 시점을 함께 제공합니다.',
  '국가별 방문객 전망': '홈에서 다음 달 예상 방문 규모와 예상 증가율을 각각 비교할 수 있도록 구성합니다. 국가별 월별 시계열 자료와 검증된 예측 결과가 확보되면 예상 방문객 수, 예측 범위, 기준월과 모델 검증 결과를 함께 제공합니다.',
  '예측 정확도': '과거 시점에서 미래 구간을 예측하는 방식으로 검증하고, 전년 동월 기준 예측과 성능을 비교합니다.',
}

function Icon({ name }) {
  const paths = {
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
    login: <><path d="M14 4h5v16h-5M3 12h11m-4-4 4 4-4 4" /></>,
    user: <><circle cx="9" cy="7" r="3" /><path d="M3 20v-3a6 6 0 0 1 12 0v3M19 7v6m-3-3h6" /></>,
    newsletter: <><rect x="5" y="5" width="14" height="16" rx="2" /><path d="M9 3h6v5H9zM8 12h8M8 16h6" /></>,
    chevron: <path d="m5 9 7 7 7-7" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
  }
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function Logo() {
  return <a className="brand" href="#/" aria-label="팀 맙소사 관광수요 분석 홈">
    <img className="header-logo" src="/brand/mapsosa-logo-clean.png" alt="맙소사 · TOURISM DATA ANALYTICS" width="1035" height="1131" />
    <span className="brand-description">부산 외국인<br />관광수요 분석</span>
  </a>
}

function Footer({ onOpen }) {
  return <footer className="site-footer">
    <div className="footer-inner">
      <div className="footer-content">
        <div className="footer-intro">
          <a className="footer-brand" href="#/" aria-label="팀 맙소사 홈">
            <img className="footer-logo" src="/brand/mapsosa-logo-clean.png" alt="맙소사 · TOURISM DATA ANALYTICS" width="1035" height="1131" />
          </a>
          <div className="footer-brand-copy">
            <p className="footer-eyebrow">TEAM MAPSOSA</p>
            <p className="footer-tagline">감탄을 자아내는 인사이트.</p>
            <p className="footer-description">데이터에 담긴 부산의 여행을 이해하고,<br />관광의 다음 가능성을 발견합니다.</p>
          </div>
        </div>
        <dl className="footer-project-info">
          <div><dt>프로젝트</dt><dd>부산 외국인 관광수요 패턴 및 변화 분석</dd></div>
          <div><dt>제작</dt><dd>팀 맙소사 · 데이터 분석·시각화·대시보드 개발</dd></div>
          <div><dt>활용 대상</dt><dd>부산시 관광정책 담당자 및 소상공인</dd></div>
        </dl>
      </div>
      <p className="footer-data-note">자료별 기준 시점과 집계 방식이 다를 수 있으며, 예측 결과는 의사결정을 돕는 참고 정보입니다.</p>
      <div className="footer-bottom">
        <p className="footer-copyright">© Team Mapsosa. Tourism Data Analytics.</p>
        <div className="footer-utilities">
          <button onClick={() => onOpen('데이터 출처·기준')}>데이터 출처·기준</button>
          <span className="footer-utility-divider" aria-hidden="true" />
          <button className="footer-top-button" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}>맨 위로<Icon name="chevron" /></button>
        </div>
      </div>
    </div>
  </footer>
}

function App() {
  const [activeMenu, setActiveMenu] = useState(null)
  const [dialog, setDialog] = useState(null)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(getPage)
  const [pageHash, setPageHash] = useState(() => window.location.hash)
  useEffect(() => {
    document.title = page === 'events' ? '부산 행사 캘린더 | 맙소사' : page === 'reports' ? '자동 분석 리포트 | 맙소사' : page === 'project' ? '프로젝트 소개 | 맙소사' : page === 'visitors' ? '부산 관광 한눈에 | 맙소사' : page === 'countries' ? '국가별 관광 | 맙소사' : '맙소사 | 부산 관광 대시보드'
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
    const close = (event) => { if (event.key === 'Escape') { setActiveMenu(null); setDialog(null) } }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [])
  const openCountryHash = destination => {
    setDialog(null)
    const hash = destination.startsWith('#') ? destination : `#${destination}`
    if (window.location.hash === hash) {
      requestAnimationFrame(() => {
        const section = document.getElementById(`country-${countryFocus(hash)}`)
        section?.scrollIntoView({ block: 'start', behavior: 'instant' })
        section?.focus({ preventScroll: true })
      })
    } else window.location.hash = hash.slice(1)
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
      } else window.location.hash = destination
      return
    }
    if (Object.hasOwn(countryRoutes, title) || title === '국가별 방문 규모') {
      openCountryHash(`/countries?focus=${countryRoutes[title] || 'compare'}`)
      return
    }
    if (title === '부산 행사 캘린더') {
      setDialog(null)
      setPage('events')
      window.location.hash = '/events'
      window.scrollTo({ top: 0, behavior: 'instant' })
      return
    }
    if (Object.hasOwn(reportRoutes, title)) {
      setDialog(null)
      setPage('reports')
      window.location.hash = `/reports?focus=${reportRoutes[title]}`
      window.scrollTo({ top: 0, behavior: 'instant' })
      return
    }
    if (title === '전체 방문 현황' || title === '프로젝트 소개' || title === '팀 맙소사 소개') {
      setDialog(null)
      const destination = title === '전체 방문 현황' ? 'visitors' : 'project'
      setPage(destination)
      window.location.hash = `/${destination}`
      window.scrollTo({ top: 0, behavior: 'instant' })
      return
    }
    setDialog(title)
  }

  return <>
    <header className="site-header">
      <div className="header-top">
        <div className="utility-links">
          <button onClick={() => openDialog('데이터 출처·기준')}>데이터 출처·기준</button><span className="utility-divider" />
          <button onClick={() => openDialog('사이트맵')}>사이트맵</button>
        </div>
        <div className="header-main">
          <Logo />
          <div className="header-actions">
            <form className="search-box" role="search" onSubmit={(event) => { event.preventDefault(); if (query.trim()) openDialog('검색 결과') }}>
              <input aria-label="통합 검색" placeholder="검색어를 입력해 주세요." value={query} onChange={(event) => setQuery(event.target.value)} />
              <button type="submit" aria-label="검색"><Icon name="search" /></button>
            </form>
            <div className="account-actions">
              <button onClick={() => openDialog('로그인')}><Icon name="login" />로그인</button>
              <button onClick={() => openDialog('회원가입')}><Icon name="user" />회원가입</button>
              <button onClick={() => openDialog('뉴스레터 구독')}><Icon name="newsletter" />뉴스레터 구독</button>
            </div>
          </div>
        </div>
      </div>
      <nav className="main-navigation" aria-label="주 메뉴">
        <div className="navigation-inner">
          {menus.map(([title, ...items], index) => <div className="navigation-item" key={title}>
            <button className={`navigation-button ${activeMenu === index ? 'active' : ((page === 'visitors' && title === '부산 관광 한눈에') || (page === 'countries' && title === '국가별 관광') || (page === 'project' && title === '프로젝트 소개') || (page === 'reports' && title === '분석 리포트') || (page === 'events' && title === '부산 행사 캘린더')) ? 'current' : ''}`} aria-current={((page === 'countries' && title === '국가별 관광') || (page === 'events' && title === '부산 행사 캘린더')) ? 'page' : undefined} aria-expanded={title === '부산 행사 캘린더' ? undefined : activeMenu === index} aria-controls={title === '부산 행사 캘린더' ? undefined : `menu-${index}`} onClick={() => title === '부산 행사 캘린더' ? openDialog(title) : setActiveMenu(activeMenu === index ? null : index)}>{title}{title !== '부산 행사 캘린더' && <Icon name="chevron" />}</button>
            {activeMenu === index && <div className="dropdown" id={`menu-${index}`}>{items.map((item) => <button key={item} onClick={() => openDialog(item)}>{item}</button>)}</div>}
          </div>)}
        </div>
      </nav>
      <div className="notice-bar"><div className="notice-inner">
        <span className="notice-badge">알림 <span aria-hidden="true">i</span></span>
        <button className="notice-title" onClick={() => openDialog('분석 범위 안내')}>{notice}</button>
        <button className="notice-more" onClick={() => openDialog('분석 범위 안내')}>자세히 보기 <span aria-hidden="true">›</span></button>
      </div></div>
    </header>
    <main className="dashboard-main" aria-label="대시보드" onClick={() => setActiveMenu(null)}>
      {page === 'events' ? <EventCalendarPage /> : page === 'reports' ? <AnalysisReport key={pageHash} initialFocus={reportFocus(pageHash)} /> : page === 'project' ? <ProjectIntro onOpen={openDialog} /> : page === 'visitors' ? <VisitorOverview onOpen={openDialog} focus={visitorFocus(pageHash)} navigationKey={pageHash} /> : page === 'countries' ? <CountryTourism focus={countryFocus(pageHash)} country={countryCode(pageHash)} navigationKey={pageHash} onOpen={openDialog} /> : <DashboardHome onOpen={openDialog} />}
    </main>
    <Footer onOpen={openDialog} />
    <DataChatbot />
    {dialog && <div className="modal-backdrop" onClick={() => setDialog(null)}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-heading"><h1 id="dialog-title">{dialog}</h1><button autoFocus aria-label="닫기" onClick={() => setDialog(null)}><Icon name="close" /></button></div>
        {dialog === '사이트맵' ? <div className="sitemap">{menus.map(([title, ...items]) => <div key={title}><h2>{title}</h2>{items.map((item) => <button key={item} onClick={() => openDialog(item)}>{item}</button>)}</div>)}</div>
          : dialog === '데이터 출처·기준' ? <><p>프로젝트 자료에 제시된 활용 예정 데이터입니다. 실제 화면 연동 시 자료별 기간, 갱신 시점과 집계 기준을 표시합니다.</p><ul className="data-source-list"><li><strong>부산관광공사</strong><span>외국인 관광객 부산 방문 동향 · 월별 방문객 자료</span></li><li><strong>한국관광 데이터랩</strong><span>부산 월별·국적별 외국인 방문자 자료</span></li><li><strong>관광지식정보시스템</strong><span>외래관광객조사 · 체류기간 등 특성 자료</span></li><li><strong>출입국·외국인정책본부</strong><span>비자별 외국인 입국자 · 전국 단위 참고 자료</span></li></ul><p>서로 다른 출처의 방문자 수는 집계 방식 확인 없이 합산하지 않습니다. 전국 입국 자료는 부산 방문객의 특성으로 직접 해석하지 않습니다.</p></>
          : dialog === '분석 범위 안내' ? <><p><strong>1차 분석 대상은 부산 전체의 외국인 관광수요입니다.</strong> 월별 방문객 수를 중심으로 국가별 특성, 계절성·변동성, 시장구조, 이상수요와 향후 수요를 분석합니다.</p><p>관광소비는 현재 데이터 확보 단계입니다. 부산 단위 국가별·업종별 소비 비중의 기간과 집계 기준을 확인한 뒤, 소비 구조가 비슷한 국가를 묶는 분석을 검토합니다. 개인 관광객의 소비 유형 군집은 개인별 자료가 확보된 경우에 진행합니다. 출발 국가의 권역 비교와 부산 내 구·군 비교는 구분하며, 구·군·성별·연령·체류기간은 자료 확보 후 확장합니다.</p></>
          : dialog === '팀 맙소사 소개' ? <><p className="project-tagline">감탄을 자아내는 인사이트, 팀 맙소사.</p><p>외국인 관광수요 패턴 및 변화 분석을 통해 부산 관광의 구조적 변화와 잠재 리스크를 살펴보는 데이터 분석·시각화·대시보드 개발 프로젝트입니다.</p><p>부산시 관광정책 담당자와 소상공인이 수요 변화를 이해하고 대응 시점과 우선순위를 판단할 수 있도록 돕습니다.</p></>
          : analysisDescriptions[dialog] ? <><p>{analysisDescriptions[dialog]}</p><p className="analysis-status">분석 화면 구성안입니다. 실제 지표와 차트는 검증된 데이터 연동 후 제공합니다.</p></>
          : dialog === '검색 결과' ? <><p>“{query}” 메뉴 검색 결과</p>{menus.flatMap((menu) => menu.slice(1)).filter((item) => item.includes(query.trim())).map((item) => <button className="search-result" key={item} onClick={() => openDialog(item)}>{item}<span>›</span></button>)}{!menus.some((menu) => menu.slice(1).some((item) => item.includes(query.trim()))) && <p>일치하는 메뉴가 없습니다. 다른 검색어를 입력해 주세요.</p>}</>
          : <p>{dialog} 서비스는 준비 중입니다.</p>}
      </section>
    </div>}
  </>
}
export default App
