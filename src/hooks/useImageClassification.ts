import { useState } from "react"
import { invoke } from "@tauri-apps/api/tauri"

import type { ClassificationResult } from "@/types/data"

export function useImageClassification() {
  const [result, setResult] = useState<ClassificationResult | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setResult(null)
    setError(null)
  }

  const classify = async (imageFile: File): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)

      // 将文件转换为 Uint8Array (Tauri API需要)
      const arrayBuffer = await imageFile.arrayBuffer()
      const fileBytes = new Uint8Array(arrayBuffer)

      // 保存上传的图片到本地文件系统
      const imagePath = (await invoke("save_uploaded_image", {
        fileData: Array.from(fileBytes),
        fileName: imageFile.name,
      })) as string

      // 调用图像处理API
      const response = await invoke("process_image", {
        imagePath,
      })

      // 处理响应结果
      if (response && "error" in (response as any)) {
        throw new Error((response as any).error)
      }

      // 类型安全检查
      const classificationResult = response as ClassificationResult
      setResult(classificationResult)
    } catch (err) {
      console.error("Image classification error:", err)
      setError(err instanceof Error ? err.message : "图像处理失败")
    } finally {
      setIsLoading(false)
    }
  }

  return {
    classify,
    result,
    isLoading,
    error,
    reset,
  }
}
