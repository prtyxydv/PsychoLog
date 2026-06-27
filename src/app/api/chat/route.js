import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_INSTRUCTION = `You are a highly empathetic, supportive, and active listener for a mental health platform called PsychoLog.
The user is checking in between therapy sessions. 

Your goals:
1. Validate their feelings and listen actively.
2. Ask 1 gentle, open-ended follow-up question if they are brief, to help them elaborate on their feelings or the event.
3. If they share a difficult situation, offer 1-2 possible practical, gentle suggestions or coping strategies, but do NOT give medical advice or pretend to be a doctor.
4. Keep your responses conversational, warm, and relatively brief (1-3 short paragraphs max).
5. Never break character. Be supportive and eager to understand.

Respond directly to the user's latest message based on the conversation history.`;

export async function POST(request) {
  try {
    const { messages } = await request.json();
    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: "Invalid messages array" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    // Convert OpenAI-style role messages to Gemini-style
    // Gemini expects role: "user" or "model"
    const contents = messages.map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // Gemini requires the conversation to start with a 'user' message
    if (contents.length > 0 && contents[0].role === "model") {
      contents.unshift({ role: "user", parts: [{ text: "Hello, I am ready to check in." }] });
    }

    const result = await model.generateContent({ contents });
    const responseText = result.response.text();

    return Response.json({ response: responseText });
  } catch (error) {
    console.error("[api/chat] Error:", error);
    return Response.json(
      { response: "I'm so sorry, I'm having trouble connecting right now. But I hear you, and your feelings are completely valid." },
      { status: 500 }
    );
  }
}
