function AppBrandHeader({ showImage = true }) {
  return (
    <div className="app-brand-header">
      {showImage && <img src="/header-pickleball.jpg" alt="Pickleball header" className="app-brand-image" />}
      <div>
        <p className="app-brand-kicker">SPORT FORUM</p>
        <p className="app-brand-title">PicklePulse</p>
        <p className="app-brand-subtitle">Pickleball Community Forum</p>
      </div>
    </div>
  )
}

export default AppBrandHeader
