import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { getRandomInterviewCover } from "@/lib/utils";
import { db } from "@/firebase/admin";

interface SavedMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you." }, { status: 200 });
}

export async function POST(request: Request) {
  const { messages, userid }: { messages: SavedMessage[]; userid: string } =
    await request.json();

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return Response.json(
      { success: false, error: "Missing or invalid messages array." },
      { status: 400 }
    );
  }

  try {
    // Compose a prompt from the message array
    const prompt =
      messages.map((msg) => `[${msg.role}]: ${msg.content}`).join("\n") +
      `
      Extract the following fields from the conversation above and return a JSON object in this format:
      {
        "type": "",
        "role": "",
        "level": "",
        "techstack": "",
        "amount": ""
      }
      Return only the JSON object.`;

    const { text: aiResponse } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt,
      maxTokens: 1000,
    });

    // Try to parse the AI response as JSON
    let extractedData;
    try {
      let cleaned = aiResponse.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned
          .replace(/^```[a-zA-Z]*\n?/, "")
          .replace(/```$/, "")
          .trim();
      }
      extractedData = JSON.parse(cleaned);
    } catch (e) {
      return Response.json(
        {
          success: false,
          error: "Failed to parse AI response as JSON.",
          raw: aiResponse,
        },
        { status: 500 }
      );
    }

    const { type, role, level, techstack, amount } = extractedData;

    if (!type || !role || !level || !techstack || !amount || !userid) {
      return Response.json(
        { success: false, error: "Missing required fields." },
        { status: 400 }
      );
    }

    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        
        Thank you! <3
    `,
      maxTokens: 1000,
    });

    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(","),
      quesions: JSON.parse(questions),
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interview);

    return Response.json({ success: true, data: interview }, { status: 200 });
  } catch (error) {
    console.error("Error in POST /generate:", error);
    return Response.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
