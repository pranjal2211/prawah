export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const demandApiUrl = process.env.PYTHON_DEMAND_API_URL || "http://127.0.0.1:5000"
    const response = await fetch(`${demandApiUrl}/api/predict`, {
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
      { message: "Failed to connect to backend. Make sure the Flask server is running on port 5000." },
      { status: 500 }
    )
  }
}
