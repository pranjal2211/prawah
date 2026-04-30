import { create } from "zustand"

interface PredictionState {
  selectedState: string
  setSelectedState: (state: string) => void
  predictions: any[]
  addPrediction: (prediction: any) => void
  clearPredictions: () => void
}

export const usePredictionStore = create<PredictionState>((set) => ({
  selectedState: "Maharashtra",
  setSelectedState: (state) => set({ selectedState: state }),
  predictions: [],
  addPrediction: (prediction) =>
    set((state) => ({
      predictions: [prediction, ...state.predictions].slice(0, 50),
    })),
  clearPredictions: () => set({ predictions: [] }),
}))
