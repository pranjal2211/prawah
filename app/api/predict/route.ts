export async function POST(request: Request) {
  try {
    const body = await request.json()
  
const DEMAND_API_URL = process.env.PYTHON_DEMAND_API_URL || "http://localhost:8000"
const response = await fetch(`${DEMAND_API_URL}/predict_with_weather`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return Response.json(
        { message: errorData.message || "Prediction failed" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("API route error:", error)
    return Response.json(
      { message: "Failed to connect to backend. Make sure the FastAPI server is running on port 8000." },
      { status: 500 }
    )
  }
}
