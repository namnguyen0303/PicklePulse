const DEFAULT_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'
const DEFAULT_MODEL = 'gemini-flash-latest'

function getConfig() {
  const apiKey = import.meta.env.VITE_LLM_API_KEY
  const baseUrl = (import.meta.env.VITE_LLM_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '')
  const model = import.meta.env.VITE_LLM_MODEL || DEFAULT_MODEL

  if (!apiKey) {
    throw new Error('Missing VITE_LLM_API_KEY in your .env file.')
  }

  return { apiKey, baseUrl, model }
}

function fallbackSummary(post, comments) {
  const commentCount = comments.length
  const firstComment = comments[0]?.body
  const postBody = post.content || 'No extra post text was provided.'

  return {
    title: post.title || 'Untitled post',
    description: postBody.slice(0, 180),
    posts: postBody,
    upvotes: `This post currently has ${post.upvotes ?? 0} upvotes.`,
    comments:
      commentCount > 0
        ? `${commentCount} comments so far. Example comment: "${firstComment}".`
        : 'No comments have been added yet.',
    overallSummary: 'Auto-generated fallback summary because the AI response format was unexpected.',
  }
}

function extractJson(content) {
  if (!content) return null

  const fencedMatch = content.match(/```json\s*([\s\S]*?)```/i)
  const candidate = fencedMatch ? fencedMatch[1] : content

  try {
    return JSON.parse(candidate)
  } catch {
    return null
  }
}

function normalizeSummary(raw, post, comments) {
  if (!raw || typeof raw !== 'object') {
    return fallbackSummary(post, comments)
  }

  return {
    title: raw.title || post.title || 'Untitled post',
    description: raw.description || post.content || 'No description provided.',
    posts: raw.posts || post.content || 'No post body provided.',
    upvotes: raw.upvotes || `This post currently has ${post.upvotes ?? 0} upvotes.`,
    comments:
      raw.comments ||
      (comments.length
        ? `${comments.length} comments are attached to this post.`
        : 'No comments have been added yet.'),
    overallSummary:
      raw.overallSummary || raw.overall_summary || 'No overall summary returned by the model.',
  }
}

export async function generatePostSummary({ post, comments }) {
  const { apiKey, baseUrl, model } = getConfig()

  const commentPayload = comments.map((comment) => ({
    author: comment.author_email || 'Community member',
    body: comment.body || '',
    created_at: comment.created_at || '',
  }))

  const prompt = `
You are summarizing a forum post for a web app.
Return only valid JSON with exactly these keys:
title, description, posts, upvotes, comments, overallSummary

Data:
- title: ${post.title || ''}
- description: ${post.content || ''}
- posts: ${post.content || ''}
- upvotes: ${post.upvotes ?? 0}
- comments: ${JSON.stringify(commentPayload)}

Requirements:
- Keep each field concise and easy to read for users.
- "overallSummary" should be 2-4 sentences.
- Do not add markdown or extra keys.
`.trim()

  const response = await fetch(`${baseUrl}/models/${model}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`LLM request failed (${response.status}): ${errorText}`)
  }

  const data = await response.json()
  const content = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('\n')
  const parsed = extractJson(content)

  return normalizeSummary(parsed, post, comments)
}
