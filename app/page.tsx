'use client'

import { useState } from 'react'
import WorkflowStep from './components/WorkflowStep'

interface WorkflowState {
  topic: string
  script: string
  images: string[]
  audio: string
  video: string
  currentStep: number
}

export default function Home() {
  const [workflow, setWorkflow] = useState<WorkflowState>({
    topic: '',
    script: '',
    images: [],
    audio: '',
    video: '',
    currentStep: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const steps = [
    { id: 0, name: 'Generate Script', description: 'AI writes your video script' },
    { id: 1, name: 'Generate Images', description: 'Create visuals from script' },
    { id: 2, name: 'Generate Audio', description: 'Text-to-speech narration' },
    { id: 3, name: 'Create Video', description: 'Combine everything' },
  ]

  const handleGenerateScript = async () => {
    if (!workflow.topic.trim()) {
      setError('Please enter a topic')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: workflow.topic }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to generate script')

      setWorkflow(prev => ({ ...prev, script: data.script, currentStep: 1 }))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateImages = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/generate-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: workflow.script }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to generate images')

      setWorkflow(prev => ({ ...prev, images: data.images, currentStep: 2 }))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateAudio = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: workflow.script }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to generate audio')

      setWorkflow(prev => ({ ...prev, audio: data.audio, currentStep: 3 }))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateVideo = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: workflow.images,
          audio: workflow.audio
        }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to generate video')

      setWorkflow(prev => ({ ...prev, video: data.video, currentStep: 4 }))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setWorkflow({
      topic: '',
      script: '',
      images: [],
      audio: '',
      video: '',
      currentStep: 0,
    })
    setError('')
  }

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">YouTube Shorts AI Workflow</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create complete YouTube Shorts using free AI tools
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-8">
        <div className="workflow-step">
          <h2 className="text-xl font-semibold mb-4">Step 1: Enter Your Topic</h2>
          <input
            type="text"
            value={workflow.topic}
            onChange={(e) => setWorkflow(prev => ({ ...prev, topic: e.target.value }))}
            placeholder="e.g., 5 Amazing Facts About Space"
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            disabled={loading || workflow.currentStep > 0}
          />
          <button
            onClick={handleGenerateScript}
            disabled={loading || workflow.currentStep > 0}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading && workflow.currentStep === 0 ? 'Generating...' : 'Generate Script'}
          </button>
        </div>
      </div>

      <WorkflowStep
        step={1}
        title="Script Generated"
        active={workflow.currentStep === 1}
        completed={workflow.currentStep > 1}
        content={workflow.script}
        onNext={handleGenerateImages}
        loading={loading && workflow.currentStep === 1}
        buttonText="Generate Images"
      />

      <WorkflowStep
        step={2}
        title="Images Generated"
        active={workflow.currentStep === 2}
        completed={workflow.currentStep > 2}
        content={workflow.images.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {workflow.images.map((img, idx) => (
              <img key={idx} src={img} alt={`Scene ${idx + 1}`} className="rounded-lg w-full" />
            ))}
          </div>
        ) : null}
        onNext={handleGenerateAudio}
        loading={loading && workflow.currentStep === 2}
        buttonText="Generate Audio"
      />

      <WorkflowStep
        step={3}
        title="Audio Generated"
        active={workflow.currentStep === 3}
        completed={workflow.currentStep > 3}
        content={workflow.audio ? (
          <audio controls src={workflow.audio} className="w-full" />
        ) : null}
        onNext={handleGenerateVideo}
        loading={loading && workflow.currentStep === 3}
        buttonText="Create Video"
      />

      <WorkflowStep
        step={4}
        title="Video Created"
        active={workflow.currentStep === 4}
        completed={workflow.currentStep === 4}
        content={workflow.video ? (
          <video controls src={workflow.video} className="w-full rounded-lg" />
        ) : null}
        onNext={handleReset}
        loading={loading && workflow.currentStep === 4}
        buttonText="Create Another"
      />
    </main>
  )
}
