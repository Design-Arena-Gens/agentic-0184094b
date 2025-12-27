import React from 'react'

interface WorkflowStepProps {
  step: number
  title: string
  active: boolean
  completed: boolean
  content: React.ReactNode
  onNext?: () => void
  loading?: boolean
  buttonText?: string
}

export default function WorkflowStep({
  step,
  title,
  active,
  completed,
  content,
  onNext,
  loading,
  buttonText = 'Next'
}: WorkflowStepProps) {
  if (!active && !completed) return null

  return (
    <div className={`mb-8 workflow-step ${active ? 'active' : completed ? 'completed' : ''}`}>
      <div className="flex items-center mb-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
          completed ? 'bg-green-500' : active ? 'bg-blue-500' : 'bg-gray-300'
        } text-white font-semibold`}>
          {completed ? '✓' : step}
        </div>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>

      {content && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          {typeof content === 'string' ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            content
          )}
        </div>
      )}

      {active && onNext && (
        <button
          onClick={onNext}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : buttonText}
        </button>
      )}

      {completed && step === 4 && onNext && (
        <button
          onClick={onNext}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          {buttonText}
        </button>
      )}
    </div>
  )
}
