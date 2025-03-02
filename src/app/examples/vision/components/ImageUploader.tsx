import { useRef, useState } from "react"
import { CrossCircledIcon, ImageIcon, UploadIcon } from "@radix-ui/react-icons"

interface ImageUploaderProps {
  onImageSelect: (file: File) => void
  disabled?: boolean
}

export default function ImageUploader({
  onImageSelect,
  disabled = false,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onImageSelect(event.target.files[0])
    }
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragging(true)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled) return

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      const isImage = file.type.match("image.*")

      if (isImage) {
        onImageSelect(file)
      }
    }
  }

  const borderClass = isDragging ? "border-blue-500" : "border-slate-300"

  return (
    <>
      <div
        className={`border-2 border-dashed ${borderClass} rounded-lg p-6 transition-colors duration-200 
          ${
            disabled
              ? "cursor-not-allowed bg-slate-50 opacity-60"
              : "cursor-pointer hover:border-blue-400"
          }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <div className="flex min-h-[140px] flex-col items-center justify-center text-center">
          {isDragging ? (
            <UploadIcon className="mb-4 h-10 w-10 text-blue-500" />
          ) : (
            <ImageIcon className="mb-4 h-10 w-10 text-slate-400" />
          )}

          <p className="mb-2 text-lg font-medium">拖放图片至此处或点击上传</p>
          <p className="text-sm text-slate-500">
            支持PNG、JPEG格式，文件大小不超过5MB
          </p>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className={`rounded-md bg-slate-100 px-4 py-2 transition-colors hover:bg-slate-200
            ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
        >
          选择图片
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        onChange={handleFileChange}
        disabled={disabled}
        className="sr-only"
      />
    </>
  )
}
