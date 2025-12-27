import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { script } = await request.json()

    if (!script) {
      return NextResponse.json({ error: 'Script is required' }, { status: 400 })
    }

    // Clean script for TTS
    const cleanScript = script
      .replace(/\[.*?\]/g, '') // Remove scene markers
      .replace(/\n\n+/g, '. ') // Replace double newlines with periods
      .trim()

    const HF_API_KEY = process.env.HUGGINGFACE_API_KEY

    try {
      if (!HF_API_KEY) {
        throw new Error('No API key')
      }

      // Using Facebook's MMS TTS model (free)
      const response = await fetch(
        'https://api-inference.huggingface.co/models/facebook/mms-tts-eng',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HF_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: cleanScript.slice(0, 500), // Limit length
          }),
        }
      )

      if (!response.ok) {
        throw new Error('TTS API error')
      }

      const blob = await response.blob()
      const arrayBuffer = await blob.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')
      const audio = `data:audio/wav;base64,${base64}`

      return NextResponse.json({ audio })
    } catch (error) {
      console.error('HF TTS failed, using browser TTS fallback:', error)

      // Return script for browser-based TTS
      return NextResponse.json({
        audio: '',
        useClientTTS: true,
        text: cleanScript
      })
    }
  } catch (error: any) {
    console.error('Error generating audio:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate audio' },
      { status: 500 }
    )
  }
}
