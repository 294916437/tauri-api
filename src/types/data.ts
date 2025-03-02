/**
 * 分类结果接口定义
 */
export interface ClassificationResult {
  prediction: string
  confidence: number
  class_probabilities: {
    [className: string]: number
  }
}
