function LoadingIndicator({ label = 'Loading...' }) {
  return (
    <div className="loading-wrap" role="status" aria-live="polite">
      <span className="loading-spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  )
}

export default LoadingIndicator
