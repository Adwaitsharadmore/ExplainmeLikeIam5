import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { apiKey, text, voiceId = "pNInz6obpgDQGcFmaJgB" } = await request.json()

    if (!apiKey || !text) {
      return NextResponse.json({ error: "Missing required parameters: apiKey and text are required" }, { status: 400 })
    }

    // Make the request to ElevenLabs API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.75,
          style: 0.6,
          use_speaker_boost: true,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("ElevenLabs API error:", errorText)
      return NextResponse.json(
        { error: `ElevenLabs API returned ${response.status}: ${errorText}` },
        { status: response.status },
      )
    }

    // Get the audio data as an ArrayBuffer
    const audioData = await response.arrayBuffer()

    // Return the audio data with the correct content type
    return new NextResponse(audioData, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    })
  } catch (error) {
    console.error("Error in ElevenLabs proxy:", error)
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 },
    )
  }
}
