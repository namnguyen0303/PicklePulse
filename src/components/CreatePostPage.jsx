import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppBrandHeader from './AppBrandHeader'
import NavBar from './NavBar'
import { supabase } from '../lib/supabase'
import { uploadPostImage } from '../lib/uploadPostImage'

function CreatePostPage({ session }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [postFlag, setPostFlag] = useState('General')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const createPost = async (event) => {
    event.preventDefault()
    setLoading(true)
    setNotice('')

    let finalImageUrl = imageUrl || null
    if (imageFile) {
      try {
        finalImageUrl = await uploadPostImage(imageFile, session.user.id)
      } catch (error) {
        setNotice(error.message)
        setLoading(false)
        return
      }
    }

    const { data, error } = await supabase
      .from('Posts')
      .insert({
        title,
        content: content || null,
        image_url: finalImageUrl,
        post_flag: postFlag,
        user_id: session.user.id,
        author_email: session.user.email,
      })
      .select('id')
      .single()

    if (error) {
      setNotice(error.message)
      setLoading(false)
      return
    }

    navigate(`/posts/${data.id}`)
  }

  return (
    <main className="page">
      <AppBrandHeader />
      <NavBar showSearch={false} />
      <section className="panel">
        <h2>Create a New Post</h2>
        <form className="stack-form" onSubmit={createPost}>
          <label>
            Title (required)
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required />
          </label>
          <label>
            Content
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} />
          </label>
          <label>
            Image URL
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} type="url" placeholder="https://..." />
          </label>
          <label>
            Upload image file
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
          </label>
          <label>
            Post type
            <select value={postFlag} onChange={(e) => setPostFlag(e.target.value)}>
              <option value="General">General</option>
              <option value="Question">Question</option>
              <option value="Opinion">Opinion</option>
            </select>
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Posting...' : 'Post'}
          </button>
        </form>
        {notice && <p className="notice">{notice}</p>}
      </section>
    </main>
  )
}

export default CreatePostPage
