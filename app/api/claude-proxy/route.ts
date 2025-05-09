import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { apiKey, prompt, model = "claude-3-haiku-20240307", maxTokens = 150 } = await request.json()

    if (!apiKey || !prompt) {
      return NextResponse.json(
        { error: "Missing required parameters: apiKey and prompt are required" },
        { status: 400 },
      )
    }

    // Make the request to Anthropic API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Anthropic API error:", errorText)
      return NextResponse.json(
        { error: `Anthropic API returned ${response.status}: ${errorText}` },
        { status: response.status },
      )
    }

    const data = await response.json()

    // Return just the text content to simplify the response
    return NextResponse.json({ text: data.content[0].text })
  } catch (error) {
    console.error("Error in Claude proxy:", error)
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 },
    )
  }
}
