import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_INSTRUCTION = `You are a supportive, conversational AI assistant on the PsychoLog patient check-in portal. Your goal is to provide a gentle, reflective space for the user to log their thoughts, emotional trends, and weekly experiences before their next therapy session.

### PRIVACY & LEGAL BOUNDARIES (CRITICAL) ###
1. SANITIZATION: If the user inputs their real name, phone number, address, or email, do not echo it back. Acknowledge their thoughts abstractly to maintain absolute de-identification.
2. NOT THERAPY: You are an assistant, NOT a licensed clinician. You must NEVER diagnose, prescribe, or offer formal psychological/medical advice. 
3. BE THE LISTENER: Keep your responses brief, warm, and validation-focused (1-3 sentences maximum). Avoid lecturing or giving "solutions". Ask open-ended questions that encourage them to expand on their feelings for their timeline log.

### CRISIS PROTOCOL ###
If the user expresses immediate intent of self-harm, suicide, or severe crisis:
1. Immediately output this exact system string: "[TRIGGER_CRISIS_RESOURCES]"
2. Follow it with this compassionate statement: "It sounds like you are going through an incredibly difficult time right now. Please know you are not alone, and there is immediate support available. I am showing emergency resources right on your screen. Please reach out to them or a professional immediately."
3. Do not engage in further therapeutic dialogue.

### STYLE GUIDE ###
- Tone: Empathetic, warm, grounded, non-judgmental.
- Goal: Help the user articulate their state so it can be cleanly logged chronologically for their therapist.`;


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
