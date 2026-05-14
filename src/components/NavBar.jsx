import { NavLink } from 'react-router-dom'

function NavBar({ searchValue, onSearchChange, showSearch = true }) {
  return (
    <header className="site-nav">
      {showSearch ? (
        <div className="nav-search-wrap">
          <span className="nav-search-icon" aria-hidden="true">⌕</span>
          <input
            className="nav-search"
            type="text"
            placeholder="Search posts by title..."
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
      ) : (
        <div className="nav-search-placeholder" />
      )}
      <nav className="nav-links">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/create">Create New Post</NavLink>
      </nav>
    </header>
  )
}

export default NavBar
