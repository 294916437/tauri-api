import Image from "next/image"
import { ReloadIcon } from "@radix-ui/react-icons"

import type { ClassificationResult } from "@/types/data"
import { cn } from "@/lib/utils" // 导入cn工具函数用于条件类名
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface ResultDisplayProps {
  imageSrc: string
  result: ClassificationResult
  onReset: () => void
}

export default function ResultDisplay({
  imageSrc,
  result,
  onReset,
}: ResultDisplayProps) {
  // 将对象转换为数组以便进行排序
  const sortedProbabilities = Object.entries(result.class_probabilities)
    .map(([className, probability]) => ({
      className,
      probability,
    }))
    .sort((a, b) => b.probability - a.probability)

  // 根据置信度选择颜色
  const getConfidenceVariant = (
    confidence: number
  ): "default" | "secondary" | "destructive" | "outline" => {
    if (confidence > 0.8) return "default" // shadcn使用default代替success
    if (confidence > 0.5) return "secondary"
    if (confidence > 0.3) return "outline"
    return "destructive"
  }

  const getProgressColor = (
    confidence: number,
    isTopClass: boolean
  ): string => {
    if (!isTopClass) return "bg-slate-300"
    if (confidence > 0.8) return "bg-green-500"
    if (confidence > 0.5) return "bg-blue-500"
    if (confidence > 0.3) return "bg-amber-500"
    return "bg-red-500"
  }

  const confidenceVariant = getConfidenceVariant(result.confidence)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b pb-4 pt-6">
        <CardTitle className="text-xl">识别结果</CardTitle>
        <Badge variant={confidenceVariant}>
          置信度: {(result.confidence * 100).toFixed(2)}%
        </Badge>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-6 flex flex-col items-center">
          <div className="relative mb-6 h-[260px] w-[260px] overflow-hidden rounded-lg">
            <Image
              src={imageSrc}
              alt="上传的图片"
              fill
              style={{ objectFit: "cover" }}
              className="rounded-lg"
            />
          </div>

          <h3 className="mb-6 text-center text-xl font-semibold">
            预测类别: {result.prediction}
          </h3>

          <div className="w-full">
            <p className="mb-3 font-medium">各类别概率:</p>

            {sortedProbabilities.map(({ className, probability }) => (
              <div key={className} className="mb-3">
                <div className="mb-1 flex justify-between">
                  <span className="text-sm">{className}</span>
                  <span className="text-sm text-slate-500">
                    {(probability * 100).toFixed(2)}%
                  </span>
                </div>
                {/* 修复Progress组件，shadcn的Progress没有indicatorClassName属性 */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn(
                      "h-full transition-all",
                      getProgressColor(
                        probability,
                        className === result.prediction
                      )
                    )}
                    style={{ width: `${probability * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-4">
        <Button
          variant="outline"
          onClick={onReset}
          className="flex items-center"
        >
          <ReloadIcon className="mr-2 h-4 w-4" /> 重新上传图片
        </Button>
      </CardFooter>
    </Card>
  )
}
