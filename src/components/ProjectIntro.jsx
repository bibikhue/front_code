import './ProjectIntro.css'

export default function ProjectIntro({ onOpen }) {
  return <div className="project-intro-page">
    <section className="busan-hero" aria-labelledby="hero-title">
      <div className="hero-content">
        <p className="hero-eyebrow"><span /> BUSAN TOURISM INSIGHTS</p>
        <h1 id="hero-title">부산의 흐름을 읽다.<br />관광의 내일을 보다.</h1>
        <p className="hero-description">바다 너머에서 시작된 여행, 데이터로 이어지는 인사이트.<br />부산 외국인 관광수요의 변화와 가능성을 살펴보세요.</p>
        <button className="hero-button" onClick={() => onOpen('전체 방문 현황')}>관광 데이터 살펴보기 <span aria-hidden="true">↗</span></button>
      </div>
      <div className="hero-bottom">
        <span className="hero-location"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>부산, 바다와 도시가 만나는 곳</span>
        <span className="hero-signature">TEAM MAPSOSA <span aria-hidden="true">/</span> TOURISM DATA ANALYTICS</span>
      </div>
    </section>
    <section className="project-about" aria-labelledby="project-about-title">
      <div className="project-about-heading"><p>ABOUT THE PROJECT</p><h2 id="project-about-title">감탄을 자아내는 인사이트,<br />팀 맙소사.</h2></div>
      <div className="project-about-copy"><p>부산을 방문하는 외국인 관광객의 수요 패턴과 변화를 분석하는 데이터 분석·시각화·대시보드 개발 프로젝트입니다.</p><p>방문 규모와 국가별 특성, 계절적 흐름을 살펴보고 향후 수요를 전망해 부산시 관광정책 담당자와 소상공인의 의사결정을 돕습니다.</p><div className="project-about-actions"><button onClick={() => onOpen('분석 범위 안내')}>분석 범위 안내 <span aria-hidden="true">↗</span></button><button onClick={() => onOpen('데이터 출처·기준')}>데이터 출처·기준 <span aria-hidden="true">↗</span></button></div></div>
    </section>
  </div>
}
