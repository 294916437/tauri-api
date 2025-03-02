"use client"

import { useState } from "react"

// 修正导入路径
import { useImageClassification } from "@/hooks/useImageClassification"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import ImageUploader from "./components/ImageUploader"
import ResultDisplay from "./components/ResultDisplay"

export default function VisionPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const { classify, result, isLoading, error, reset } = useImageClassification()

  const handleImageSelect = async (imageFile: File) => {
    setSelectedImage(URL.createObjectURL(imageFile))
    reset()
    await classify(imageFile)
  }

  const handleReset = () => {
    setSelectedImage(null)
    reset()
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-8 text-center text-3xl font-bold">图像识别演示</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>上传图片进行分类识别</CardTitle>
          <CardDescription>
            支持识别的类别：飞机、汽车、鸟类、猫、鹿、狗、青蛙、马、船、卡车
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUploader
            onImageSelect={handleImageSelect}
            disabled={isLoading}
          />
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex flex-col items-center space-y-4 py-10">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-500"></div>
          <p className="text-slate-700">正在分析图像...</p>
        </div>
      )}

      {selectedImage && result && !isLoading && (
        <ResultDisplay
          imageSrc={selectedImage}
          result={result}
          onReset={handleReset}
        />
      )}

      {error && (
        <Card className="mt-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="font-medium text-red-600">错误：{error}</p>
            <p className="mt-2 text-sm text-slate-600">
              请尝试上传其他图片或稍后再试
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
