import { supabase } from './supabase'

const IMAGE_BUCKET = 'post-images'

export async function uploadPostImage(file, userId) {
  if (!file) return null
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file.')
  }

  const extension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg'
  const safeExt = extension?.toLowerCase() || 'jpg'
  const filePath = `${userId}/${Date.now()}-${crypto.randomUUID()}.${safeExt}`

  const { error: uploadError } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(filePath)
  return data.publicUrl
}

