import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json()

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    // Using Hugging Face Inference API (free tier)
    const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || 'hf_demo'

    const prompt = `Write a 30-second YouTube Shorts script about: ${topic}

Instructions:
- Keep it under 100 words
- Make it engaging and punchy
- Include a hook, 3 main points, and a call-to-action
- Format with clear scene breaks

Script:`

    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HF_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 250,
              temperature: 0.7,
              top_p: 0.9,
              return_full_text: false
            }
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Hugging Face API error')
      }

      const data = await response.json()
      let script = data[0]?.generated_text || ''

      // Clean up the script
      script = script.trim()

      if (!script) {
        // Fallback script generation
        script = generateFallbackScript(topic)
      }

      return NextResponse.json({ script })
    } catch (hfError) {
      // Fallback to local generation if API fails
      console.error('HF API failed, using fallback:', hfError)
      const script = generateFallbackScript(topic)
      return NextResponse.json({ script })
    }
  } catch (error: any) {
    console.error('Error generating script:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate script' },
      { status: 500 }
    )
  }
}

function generateFallbackScript(topic: string): string {
  return `[HOOK]
Did you know? Here's something amazing about ${topic}!

[SCENE 1]
First, let's understand what makes this so special.

[SCENE 2]
The most interesting part is how it affects our daily lives.

[SCENE 3]
Finally, here's the surprising truth most people don't know.

[CALL TO ACTION]
Like and follow for more fascinating facts! Which fact surprised you most? Comment below!`
}
