import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import AppBrandHeader from './AppBrandHeader'
import LoadingIndicator from './LoadingIndicator'
import NavBar from './NavBar'
import { supabase } from '../lib/supabase'

const PAGE_SIZE = 6

function HomePage() {
  const [posts, setPosts] = useState([])
  const [sortBy, setSortBy] = useState('created_at')
  const [flagFilter, setFlagFilter] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const sentinelRef = useRef(null)
  const hasLoadedOnceRef = useRef(false)

  const loadPosts = useCallback(async (targetPage = 0, append = false) => {
    const showInitialLoader = !append && !hasLoadedOnceRef.current

    if (append) {
      setLoadingMore(true)
    } else if (showInitialLoader) {
      setLoading(true)
      setHasMore(true)
    }

    let query = supabase
      .from('Posts')
      .select('id, created_at, title, upvotes')

    if (sortBy) {
      query = query.order(sortBy, { ascending: false })
    }

    if (searchTerm.trim()) {
      query = query.ilike('title', `%${searchTerm.trim()}%`)
    }

    if (flagFilter) {
      query = query.eq('post_flag', flagFilter)
    }

    const from = targetPage * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    const { data, error } = await query.range(from, to)

    if (error) {
      setNotice(error.message)
    } else {
      const nextBatch = data ?? []
      setPosts((current) => (append ? [...current, ...nextBatch] : nextBatch))
      setHasMore(nextBatch.length === PAGE_SIZE)
      setPage(targetPage)
      hasLoadedOnceRef.current = true
    }

    if (showInitialLoader) {
      setLoading(false)
    }
    setLoadingMore(false)
  }, [flagFilter, searchTerm, sortBy])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadPosts(0, false)
  }, [loadPosts])

  useEffect(() => {
    if (!sentinelRef.current || loading || loadingMore || !hasMore) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first?.isIntersecting) {
          void loadPosts(page + 1, true)
        }
      },
      { threshold: 0.3 },
    )

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, loadPosts, loading, loadingMore, page])

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) setNotice(error.message)
  }

  const toggleSort = (value) => {
    setSortBy((current) => (current === value ? null : value))
  }

  const toggleFlag = (value) => {
    setFlagFilter((current) => (current === value ? null : value))
  }

  return (
    <main className="page">
      <AppBrandHeader showImage={false} />
      <NavBar searchValue={searchTerm} onSearchChange={setSearchTerm} />

      <header className="feed-header">
        <p>Welcome, this app is created by Nam Nguyen z23539620</p>
        <button className="secondary" onClick={logout}>Log out</button>
      </header>

      <section className="panel">
        <div className="feed-controls">
          <h2>Home Feed</h2>
          <div className="control-row">
            <div className="sort-group" role="group" aria-label="Sort posts">
              <span className="sort-label">Sort by:</span>
              <button
                type="button"
                className={`sort-pill ${sortBy === 'created_at' ? 'active' : ''}`}
                onClick={() => toggleSort('created_at')}
              >
                Newest
              </button>
              <button
                type="button"
                className={`sort-pill ${sortBy === 'upvotes' ? 'active' : ''}`}
                onClick={() => toggleSort('upvotes')}
              >
                Most Popular
              </button>
            </div>
            <div className="flag-group right-corner" role="group" aria-label="Filter by post type">
              <span className="sort-label">Flag:</span>
              {['General', 'Question', 'Opinion'].map((flag) => (
                <button
                  key={flag}
                  type="button"
                  className={`sort-pill ${flagFilter === flag ? 'active' : ''}`}
                  onClick={() => toggleFlag(flag)}
                >
                  {flag}
                </button>
              ))}
            </div>
          </div>
        </div>
        {loading ? <LoadingIndicator label="Loading posts..." /> : (
          <>
            <div className="post-list">
              {posts.map((post) => (
                <Link key={post.id} className="post-card" to={`/posts/${post.id}`}>
                  <h3>{post.title}</h3>
                  <div className="post-meta">
                    <p>{new Date(post.created_at).toLocaleString()}</p>
                    <p>{post.upvotes} upvotes</p>
                  </div>
                </Link>
              ))}
              {!posts.length && <p>No posts found.</p>}
            </div>
            <div ref={sentinelRef} className="feed-sentinel" aria-hidden="true" />
            {loadingMore && <LoadingIndicator label="Loading more posts..." />}
            {!hasMore && posts.length > 0 && <p className="feed-end">You reached the end of the feed.</p>}
          </>
        )}
      </section>
      {notice && <p className="notice">{notice}</p>}
    </main>
  )
}

export default HomePage
