import { useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MessageSquare, Send, CheckCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Textarea } from '../components/ui'
import { useApi, endpoints } from '../services/api'
import type { Feedback as FeedbackType, CreateFeedbackInput } from '../types'

export function Feedback() {
  const { user } = useUser()
  const api = useApi()
  const queryClient = useQueryClient()

  const [name, setName] = useState(user?.fullName || '')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; message?: string }>({})

  const { data: pastFeedback } = useQuery({
    queryKey: ['feedback'],
    queryFn: () => api.get<FeedbackType[]>(endpoints.feedback.list),
  })

  const mutation = useMutation({
    mutationFn: (input: CreateFeedbackInput) =>
      api.post<FeedbackType>(endpoints.feedback.create, input),
    onSuccess: () => {
      setSubmitted(true)
      setMessage('')
      setErrors({})
      queryClient.invalidateQueries({ queryKey: ['feedback'] })
    },
  })

  function validate(): boolean {
    const newErrors: { name?: string; message?: string } = {}
    if (!name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!message.trim()) {
      newErrors.message = 'Feedback message is required'
    } else if (message.trim().length < 10) {
      newErrors.message = 'Please write at least 10 characters'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(false)
    if (!validate()) return
    mutation.mutate({ name: name.trim(), message: message.trim() })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Feedback
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Help us improve LogBook. Your feedback shapes what we build next.
        </p>
      </div>

      {/* Feedback form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Send Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submitted && !mutation.isPending ? (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  Thank you for your feedback!
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-0.5">
                  We read every submission and use it to make LogBook better.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-sm text-green-700 dark:text-green-300 underline mt-2 hover:no-underline"
                >
                  Send another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Name"
                placeholder="Your name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
                }}
                error={errors.name}
              />
              <Textarea
                label="Your feedback"
                placeholder="What's working well? What could be better? Any features you'd like to see?"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value)
                  if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }))
                }}
                error={errors.message || (mutation.isError ? 'Failed to submit. Please try again.' : undefined)}
                rows={5}
              />
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {message.length}/2000
                </p>
                <Button
                  type="submit"
                  isLoading={mutation.isPending}
                  leftIcon={<Send className="h-4 w-4" />}
                >
                  Submit Feedback
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Past feedback */}
      {pastFeedback && pastFeedback.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Your Previous Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pastFeedback.map((fb) => (
              <div
                key={fb.id}
                className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              >
                <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                  {fb.message}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  {new Date(fb.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
