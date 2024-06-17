import { ChatAnthropic } from "@langchain/anthropic";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export const generateAnswer = async (question: string): Promise<string | null> => {
  try {
    // Get the Anthropic API key
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY || "";
    if (!anthropicApiKey) {
      throw new Error("Anthropic API key is not provided.");
    }

    // Create the ChatAnthropic instance
    const chat = new ChatAnthropic({
      apiKey: anthropicApiKey,
      model: "claude-3-sonnet-20240229", 
    });

    // Create the system and human messages
    const systemMessage = new SystemMessage(
      "You are a helpful assistant for any query or question you have to answer. Your name is Samarth, and you were developed by Shivkumar Raghuwanshi."
    );
    const humanMessage = new HumanMessage(question);

    // Combine the messages into an array
    const messages = [systemMessage, humanMessage];

    // Invoke the ChatAnthropic model and await its response
    const response = await chat.invoke(messages);

    // Extract the content from the response
    const answer = response.content;

    return typeof answer === "string" ? answer : null;
  } catch (error) {
    console.error("Error generating answer:", error);
    return null;
  }
};