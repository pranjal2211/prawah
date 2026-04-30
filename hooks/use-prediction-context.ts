"use client"

import { usePredictionStore } from "@/lib/prediction-store"

export function usePredictionContext() {
  const { selectedState, setSelectedState, predictions, addPrediction, clearPredictions } = usePredictionStore()

  return {
    selectedState,
    setSelectedState,
    predictions,
    addPrediction,
    clearPredictions,
  }
}
