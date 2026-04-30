export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ")
}

export function formatNumber(value: number, decimals = 2): string {
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatDemand(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)} GW`
  }
  return `${value} MW`
}

export function calculateAccuracy(predicted: number, actual: number): number {
  const error = Math.abs(predicted - actual) / actual
  return Math.round((1 - error) * 10000) / 100
}

export function calculateMAE(predictions: number[], actuals: number[]): number {
  const errors = predictions.map((p, i) => Math.abs(p - actuals[i]))
  return errors.reduce((a, b) => a + b, 0) / errors.length
}

export function calculateRMSE(predictions: number[], actuals: number[]): number {
  const squaredErrors = predictions.map((p, i) => Math.pow(p - actuals[i], 2))
  const mse = squaredErrors.reduce((a, b) => a + b, 0) / squaredErrors.length
  return Math.sqrt(mse)
}

export function getTrendDirection(current: number, previous: number): "up" | "down" | "neutral" {
  if (current > previous) return "up"
  if (current < previous) return "down"
  return "neutral"
}
