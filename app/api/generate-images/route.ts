import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { script } = await request.json()

    if (!script) {
      return NextResponse.json({ error: 'Script is required' }, { status: 400 })
    }

    // Extract scenes from script
    const scenes = extractScenes(script)

    // Generate images using Stable Diffusion via Hugging Face
    const HF_API_KEY = process.env.HUGGINGFACE_API_KEY

    const images: string[] = []

    for (let i = 0; i < Math.min(scenes.length, 4); i++) {
      try {
        const imageUrl = await generateImage(scenes[i], HF_API_KEY)
        images.push(imageUrl)
      } catch (error) {
        console.error(`Failed to generate image ${i + 1}:`, error)
        // Use placeholder image
        images.push(`https://via.placeholder.com/1080x1920/4A5568/ffffff?text=Scene+${i + 1}`)
      }
    }

    return NextResponse.json({ images })
  } catch (error: any) {
    console.error('Error generating images:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate images' },
      { status: 500 }
    )
  }
}

function extractScenes(script: string): string[] {
  const scenes: string[] = []
  const lines = script.split('\n')

  let currentScene = ''
  for (const line of lines) {
    if (line.includes('[SCENE') || line.includes('[HOOK') || line.includes('Scene')) {
      if (currentScene) {
        scenes.push(currentScene.trim())
      }
      currentScene = ''
    } else if (line.trim() && !line.includes('[') && !line.includes(']')) {
      currentScene += line + ' '
    }
  }

  if (currentScene.trim()) {
    scenes.push(currentScene.trim())
  }

  // If no scenes found, use the whole script
  if (scenes.length === 0) {
    const words = script.split(' ')
    const chunkSize = Math.ceil(words.length / 3)
    for (let i = 0; i < 3; i++) {
      scenes.push(words.slice(i * chunkSize, (i + 1) * chunkSize).join(' '))
    }
  }

  return scenes
}

async function generateImage(prompt: string, apiKey?: string): Promise<string> {
  if (!apiKey) {
    // Return placeholder if no API key
    return `https://via.placeholder.com/1080x1920/667eea/ffffff?text=${encodeURIComponent(prompt.slice(0, 20))}`
  }

  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `${prompt}, cinematic, high quality, 9:16 aspect ratio, vertical video, professional photography`,
          parameters: {
            negative_prompt: 'blurry, low quality, distorted',
          }
        }),
      }
    )

    if (!response.ok) {
      throw new Error('Failed to generate image')
    }

    const blob = await response.blob()
    const arrayBuffer = await blob.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    return `data:image/jpeg;base64,${base64}`
  } catch (error) {
    console.error('Image generation error:', error)
    throw error
  }
}
