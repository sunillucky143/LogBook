import { useRef } from 'react'
import type { Editor } from '@tiptap/react'
import {
  Bold, Italic, Strikethrough, Code,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, CodeSquare,
  Link, Image, Minus,
} from 'lucide-react'

interface ToolbarProps {
  editor: Editor | null
  onImageUpload?: (file: File) => void
}

interface ToolbarButton {
  icon: React.ReactNode
  title: string
  action: () => void
  isActive?: () => boolean
}

export function Toolbar({ editor, onImageUpload }: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!editor) return null

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onImageUpload) {
      onImageUpload(file)
    }
    // Reset so same file can be selected again
    e.target.value = ''
  }

  const handleLinkClick = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('Enter URL:', previousUrl)
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }

  const groups: ToolbarButton[][] = [
    // Text formatting
    [
      { icon: <Bold className="h-4 w-4" />, title: 'Bold', action: () => editor.chain().focus().toggleBold().run(), isActive: () => editor.isActive('bold') },
      { icon: <Italic className="h-4 w-4" />, title: 'Italic', action: () => editor.chain().focus().toggleItalic().run(), isActive: () => editor.isActive('italic') },
      { icon: <Strikethrough className="h-4 w-4" />, title: 'Strikethrough', action: () => editor.chain().focus().toggleStrike().run(), isActive: () => editor.isActive('strike') },
      { icon: <Code className="h-4 w-4" />, title: 'Inline Code', action: () => editor.chain().focus().toggleCode().run(), isActive: () => editor.isActive('code') },
    ],
    // Headings
    [
      { icon: <Heading1 className="h-4 w-4" />, title: 'Heading 1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: () => editor.isActive('heading', { level: 1 }) },
      { icon: <Heading2 className="h-4 w-4" />, title: 'Heading 2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: () => editor.isActive('heading', { level: 2 }) },
      { icon: <Heading3 className="h-4 w-4" />, title: 'Heading 3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), isActive: () => editor.isActive('heading', { level: 3 }) },
    ],
    // Lists & blocks
    [
      { icon: <List className="h-4 w-4" />, title: 'Bullet List', action: () => editor.chain().focus().toggleBulletList().run(), isActive: () => editor.isActive('bulletList') },
      { icon: <ListOrdered className="h-4 w-4" />, title: 'Ordered List', action: () => editor.chain().focus().toggleOrderedList().run(), isActive: () => editor.isActive('orderedList') },
      { icon: <Quote className="h-4 w-4" />, title: 'Blockquote', action: () => editor.chain().focus().toggleBlockquote().run(), isActive: () => editor.isActive('blockquote') },
      { icon: <CodeSquare className="h-4 w-4" />, title: 'Code Block', action: () => editor.chain().focus().toggleCodeBlock().run(), isActive: () => editor.isActive('codeBlock') },
      { icon: <Minus className="h-4 w-4" />, title: 'Horizontal Rule', action: () => editor.chain().focus().setHorizontalRule().run() },
    ],
    // Media
    [
      { icon: <Link className="h-4 w-4" />, title: 'Link', action: handleLinkClick, isActive: () => editor.isActive('link') },
      { icon: <Image className="h-4 w-4" />, title: 'Image', action: handleImageClick },
    ],
  ]

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
      {groups.map((group, groupIndex) => (
        <div key={groupIndex} className="flex items-center gap-0.5">
          {groupIndex > 0 && (
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
          )}
          {group.map((button, buttonIndex) => (
            <button
              key={buttonIndex}
              type="button"
              title={button.title}
              onClick={button.action}
              className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                button.isActive?.()
                  ? 'bg-gray-200 dark:bg-gray-600 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {button.icon}
            </button>
          ))}
        </div>
      ))}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
