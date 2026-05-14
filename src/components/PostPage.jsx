import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import LoadingIndicator from './LoadingIndicator'
import NavBar from './NavBar'
import { generatePostSummary } from '../lib/generatePostSummary'
import { supabase } from '../lib/supabase'
import { uploadPostImage } from '../lib/uploadPostImage'

function PostPage({ session }) {
  const { postId } = useParams()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ title: '', content: '', image_url: '', post_flag: 'General' })
  const [draftImageFile, setDraftImageFile] = useState(null)
  const [notice, setNotice] = useState('')
  const [summary, setSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const isOwner = useMemo(() => post?.user_id === session.user.id, [post?.user_id, session.user.id])

  const loadPostData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true)
    const postQuery = supabase.from('Posts').select('*').eq('id', postId).single()
    const commentsQuery = supabase
      .from('Comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    const [{ data: postData, error: postError }, { data: commentData, error: commentError }] = await Promise.all([postQuery, commentsQuery])

    if (postError) {
      setNotice(postError.message)
      if (showLoader) setLoading(false)
      return
    }
    if (commentError) setNotice(commentError.message)

    setPost(postData)
    setDraft({
      title: postData.title ?? '',
      content: postData.content ?? '',
      image_url: postData.image_url ?? '',
      post_flag: postData.post_flag ?? 'General',
    })
    setComments(commentData ?? [])
    if (showLoader) setLoading(false)
  }, [postId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadPostData()
  }, [loadPostData])

  const upvote = async () => {
    if (!post) return
    const { error } = await supabase.rpc('increment_post_upvotes', { target_post_id: post.id })
    if (error) setNotice(error.message)
    else await loadPostData(false)
  }

  const saveEdit = async () => {
    let finalImageUrl = draft.image_url || null
    if (draftImageFile) {
      try {
        finalImageUrl = await uploadPostImage(draftImageFile, session.user.id)
      } catch (error) {
        setNotice(error.message)
        return
      }
    }

    const { error } = await supabase
      .from('Posts')
      .update({
        title: draft.title,
        content: draft.content || null,
        image_url: finalImageUrl,
        post_flag: draft.post_flag,
      })
      .eq('id', postId)

    if (error) setNotice(error.message)
    else {
      setEditing(false)
      setDraftImageFile(null)
      await loadPostData()
    }
  }

  const deletePost = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this post? This action cannot be undone.')
    if (!confirmed) return

    const { error } = await supabase.from('Posts').delete().eq('id', postId)
    if (error) setNotice(error.message)
    else navigate('/')
  }

  const addComment = async (event) => {
    event.preventDefault()
    const { error } = await supabase.from('Comments').insert({
      post_id: postId,
      body: commentText,
      user_id: session.user.id,
      author_email: session.user.email,
    })
    if (error) setNotice(error.message)
    else {
      setCommentText('')
      await loadPostData()
    }
  }

  const handleGenerateSummary = async () => {
    if (!post) return

    setSummaryLoading(true)
    setSummaryError('')
    try {
      const nextSummary = await generatePostSummary({ post, comments })
      setSummary(nextSummary)
    } catch (error) {
      setSummaryError(error.message)
    } finally {
      setSummaryLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="page">
        <NavBar showSearch={false} />
        <LoadingIndicator label="Loading post..." />
        {notice && <p className="notice">{notice}</p>}
      </main>
    )
  }

  if (!post) {
    return (
      <main className="page">
        <NavBar showSearch={false} />
        <p>Post not found.</p>
        {notice && <p className="notice">{notice}</p>}
      </main>
    )
  }

  return (
    <main className="page">
      <NavBar showSearch={false} />
      <Link className="link-btn" to="/">← Back to feed</Link>
      <section className="panel">
        {editing ? (
          <div className="stack-form">
            <h2>Edit post</h2>
            <label>
              Title
              <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </label>
            <label>
              Content
              <textarea value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} rows={5} />
            </label>
            <label>
              Image URL
              <input value={draft.image_url} onChange={(e) => setDraft({ ...draft, image_url: e.target.value })} />
            </label>
            <label>
              Upload image file
              <input type="file" accept="image/*" onChange={(e) => setDraftImageFile(e.target.files?.[0] ?? null)} />
            </label>
            <label>
              Post type
              <select value={draft.post_flag} onChange={(e) => setDraft({ ...draft, post_flag: e.target.value })}>
                <option value="General">General</option>
                <option value="Question">Question</option>
                <option value="Opinion">Opinion</option>
              </select>
            </label>
            <div className="inline-buttons">
              <button onClick={saveEdit}>Save</button>
              <button className="secondary" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            {post.post_flag && <span className="post-flag">{post.post_flag}</span>}
            <h2>{post.title}</h2>
            <p>Created: {new Date(post.created_at).toLocaleString()}</p>
            <p>{post.content || 'No extra content.'}</p>
            {post.image_url && <img className="post-image" src={post.image_url} alt={post.title} />}
            <div className="post-actions">
              <button className="action-btn upvote-btn" onClick={upvote}>
                <span aria-hidden="true">👍</span> Upvote ({post.upvotes})
              </button>
              {isOwner && (
                <div className="owner-actions">
                  <button className="action-btn edit-btn" onClick={() => setEditing(true)}>
                    <span aria-hidden="true">✏️</span> Edit
                  </button>
                  <button className="action-btn delete-btn" onClick={deletePost}>
                    <span aria-hidden="true">🗑️</span> Delete
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {!editing && (
        <section className="panel">
          <div className="summary-header">
            <h3>AI Post Summary</h3>
            <button
              className="action-btn summary-btn"
              onClick={handleGenerateSummary}
              disabled={summaryLoading}
            >
              {summaryLoading ? 'Generating...' : summary ? 'Regenerate Summary' : 'Generate Summary'}
            </button>
          </div>
          <p className="summary-subtitle">
            Uses title, description, post details, upvotes, and comments to generate an overall summary.
          </p>
          {summaryError && <p className="notice">{summaryError}</p>}
          {summary && (
            <div className="summary-grid">
              <article className="summary-card">
                <h4>Title</h4>
                <p>{summary.title}</p>
              </article>
              <article className="summary-card">
                <h4>Description</h4>
                <p>{summary.description}</p>
              </article>
              <article className="summary-card">
                <h4>Posts</h4>
                <p>{summary.posts}</p>
              </article>
              <article className="summary-card">
                <h4>Upvotes</h4>
                <p>{summary.upvotes}</p>
              </article>
              <article className="summary-card">
                <h4>Comments</h4>
                <p>{summary.comments}</p>
              </article>
              <article className="summary-card summary-card-wide">
                <h4>Overall Summary</h4>
                <p>{summary.overallSummary}</p>
              </article>
            </div>
          )}
          {!summary && !summaryLoading && !summaryError && (
            <p className="summary-placeholder">Generate a summary to see key insights for this post.</p>
          )}
        </section>
      )}

      {!editing && (
        <section className="panel">
          <h3>Comments</h3>
          <form className="stack-form" onSubmit={addComment}>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={3}
              placeholder="Leave a comment..."
              required
            />
            <button type="submit">Add comment</button>
          </form>
          <div className="comment-list">
            {comments.map((comment) => (
              <article key={comment.id} className="comment-card">
                <div className="comment-head">
                  <div className="comment-avatar">
                    {(comment.author_email?.[0] || '?').toUpperCase()}
                  </div>
                  <div className="comment-meta">
                    <strong>{comment.author_email || 'Community member'}</strong>
                    <small>{new Date(comment.created_at).toLocaleString()}</small>
                  </div>
                </div>
                <p className="comment-body">{comment.body}</p>
              </article>
            ))}
            {!comments.length && <p>No comments yet.</p>}
          </div>
        </section>
      )}
      {notice && <p className="notice">{notice}</p>}
    </main>
  )
}

export default PostPage
