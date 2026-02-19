import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import LinkExtension from '@tiptap/extension-link'
import ImageExtension from '@tiptap/extension-image'
import { ArrowLeft, Save, Clock, Loader2, Check } from 'lucide-react'
import { Card, CardContent, Button, Input } from '../components/ui'
import { Toolbar } from '../components/editor/Toolbar'
import { useApi, endpoints, ApiError } from '../services/api'
import type { Document, PresignedUrlResponse } from '../types/document'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function DocumentEditor() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const api = useApi()
  const apiRef = useRef(api)
  apiRef.current = api

  const isNew = id === 'new'
  const sessionIdFromQuery = searchParams.get('session')
  const dateFromQuery = searchParams.get('date')

  const [title, setTitle] = useState('')
  const [docId, setDocId] = useState<string | null>(isNew ? null : id!)
  const [logDate, setLogDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(!isNew)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [isPublishing, setIsPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isSavingRef = useRef(false)
  const contentRef = useRef<unknown>(null)
  const imageUploadRef = useRef<(file: File) => Promise<void>>(async () => { })
  const trackedImagesRef = useRef<Set<string>>(new Set())

  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkExtension.configure({ openOnClick: false }),
      ImageExtension.configure({ allowBase64: true }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none min-h-[400px] focus:outline-none',
      },
      handleDrop: (_view, event, _slice, moved) => {
        if (moved || !event.dataTransfer?.files?.length) return false
        const files = Array.from(event.dataTransfer.files)
        const imageFiles = files.filter((f) => f.type.startsWith('image/'))
        if (imageFiles.length === 0) return false
        event.preventDefault()
        imageFiles.forEach((file) => imageUploadRef.current(file))
        return true
      },
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files || [])
        const imageFiles = files.filter((f) => f.type.startsWith('image/'))
        if (imageFiles.length === 0) return false
        event.preventDefault()
        imageFiles.forEach((file) => imageUploadRef.current(file))
        return true
      },
    },
    onUpdate: ({ editor }) => {
      contentRef.current = editor.getJSON()

      // Detect removed images and delete from R2
      const currentImages = new Set<string>()
      editor.state.doc.descendants((node) => {
        if (node.type.name === 'image' && node.attrs.src) {
          currentImages.add(node.attrs.src as string)
        }
      })

      // Find images that were in the previous state but not in the current
      for (const src of trackedImagesRef.current) {
        if (!currentImages.has(src) && src.startsWith('http')) {
          // Fire-and-forget: delete removed image from R2
          apiRef.current.post(endpoints.upload.deleteByUrl, { url: src }).catch(() => { })
        }
      }
      trackedImagesRef.current = currentImages

      debouncedSave()
    },
  })

  // Load existing document
  useEffect(() => {
    if (isNew || !id) return
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        const doc = await apiRef.current.get<Document>(endpoints.documents.get(id!))
        if (cancelled) return
        setTitle(doc.title || '')
        setDocId(doc.id)
        setLogDate(doc.log_date)
        if (editor && doc.content) {
          editor.commands.setContent(doc.content)
          contentRef.current = doc.content
          // Initialize tracked images from loaded content
          const images = new Set<string>()
          editor.state.doc.descendants((node) => {
            if (node.type.name === 'image' && node.attrs.src) {
              images.add(node.attrs.src as string)
            }
          })
          trackedImagesRef.current = images
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Failed to load document')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [id, isNew, editor])

  const saveDocument = useCallback(async () => {
    if (isSavingRef.current) return
    const content = contentRef.current
    if (!content) return

    isSavingRef.current = true
    setSaveStatus('saving')
    setError(null)

    try {
      if (!docId) {
        // Create new document — use session date if available, otherwise today
        const docDate = dateFromQuery || new Date().toISOString().split('T')[0]
        const doc = await apiRef.current.post<Document>(endpoints.documents.create, {
          log_date: docDate,
          title: title || `Log - ${docDate}`,
          content,
          session_id: sessionIdFromQuery || undefined,
        })
        setDocId(doc.id)
        setLogDate(doc.log_date)
      } else {
        // Update existing document
        await apiRef.current.put<Document>(endpoints.documents.update(docId), {
          title: title || undefined,
          content,
        })
      }
      setSaveStatus('saved')
    } catch (err) {
      setSaveStatus('error')
      if (err instanceof ApiError && err.status === 409) {
        setError('Only one document allowed per day. Please edit the existing entry.')
      } else {
        setError('Failed to save document')
      }
    } finally {
      isSavingRef.current = false
    }
  }, [docId, title, sessionIdFromQuery, dateFromQuery])

  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveDocument()
    }, 2000)
  }, [saveDocument])

  // Also trigger save when title changes (debounced)
  useEffect(() => {
    if (!contentRef.current) return
    debouncedSave()
  }, [title, debouncedSave])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  const handlePublish = async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    setIsPublishing(true)
    setError(null)

    try {
      const content = contentRef.current || editor?.getJSON()
      if (!content) return

      if (!docId) {
        const docDate = dateFromQuery || new Date().toISOString().split('T')[0]
        await apiRef.current.post<Document>(endpoints.documents.create, {
          log_date: docDate,
          title: title || `Log - ${docDate}`,
          content,
          session_id: sessionIdFromQuery || undefined,
        })
      } else {
        await apiRef.current.put<Document>(endpoints.documents.update(docId), {
          title: title || undefined,
          content,
        })
      }
      navigate('/documents')
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('Only one document allowed per day. Please edit the existing entry.')
      } else {
        setError(err instanceof ApiError ? err.message : 'Failed to publish document')
      }
    } finally {
      setIsPublishing(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    if (!editor) return
    setError(null)

    try {
      // Get presigned URL
      const presign = await api.post<PresignedUrlResponse>(endpoints.upload.presign, {
        file_name: file.name,
        file_type: file.type,
        file_size_bytes: file.size,
      })

      // Upload file to R2
      await fetch(presign.upload_url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })

      // Confirm upload if we have a document ID
      if (docId) {
        await api.post(endpoints.upload.confirm, {
          storage_key: presign.storage_key,
          document_id: docId,
          file_name: file.name,
          file_type: file.type,
          size_bytes: file.size,
        })
      }

      // Insert image into editor
      editor.chain().focus().setImage({ src: presign.public_url, alt: file.name }).run()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to upload image')
    }
  }

  imageUploadRef.current = handleImageUpload

  const getSaveStatusDisplay = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </span>
        )
      case 'saved':
        return (
          <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
            <Check className="h-4 w-4" />
            Saved
          </span>
        )
      case 'error':
        return (
          <span className="text-sm text-red-500 flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Save failed
          </span>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/documents">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {isNew ? 'New Entry' : 'Edit Entry'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {(() => {
                const dateStr = logDate || dateFromQuery || new Date().toISOString()
                const datePart = dateStr.split('T')[0]
                const [year, month, day] = datePart.split('-').map(Number)
                return new Date(year, month - 1, day).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
              })()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getSaveStatusDisplay()}
          <Button
            onClick={handlePublish}
            disabled={isPublishing}
            leftIcon={isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          >
            {isPublishing ? 'Publishing...' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Title input */}
      <Input
        placeholder="Entry title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-lg font-medium"
      />

      {/* Editor */}
      <Card>
        <CardContent>
          <Toolbar editor={editor} onImageUpload={handleImageUpload} />
          <EditorContent editor={editor} />
        </CardContent>
      </Card>

      {/* Session info */}
      {sessionIdFromQuery && (
        <Card>
          <CardContent className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Linked to active session
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This entry will be associated with your current work session.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
