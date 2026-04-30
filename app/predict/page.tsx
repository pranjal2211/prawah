import PredictionForm from "@/components/prediction-form"

export const metadata = {
  title: "Prediction | प्रवाह",
  description: "Get electricity demand predictions for Indian states",
}

export default function PredictPage() {
  return (
    <main className="min-h-screen gradient-soft">
      <PredictionForm />
    </main>
  )
}
