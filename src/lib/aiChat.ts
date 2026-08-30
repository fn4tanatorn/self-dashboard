import { supabase } from "./push";

export interface AnthropicToolSchema {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export type AnthropicContentBlock =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
  | { type: "tool_result"; tool_use_id: string; content: string; is_error?: boolean };

export interface AnthropicMessage {
  role: "user" | "assistant";
  content: string | AnthropicContentBlock[];
}

interface AnthropicResponse {
  content: AnthropicContentBlock[];
  stop_reason: string;
  error?: { message: string };
}

export async function callAiChat(args: {
  system: string;
  messages: AnthropicMessage[];
  tools: AnthropicToolSchema[];
}): Promise<AnthropicResponse> {
  const { data, error } = await supabase.functions.invoke("ai-chat", { body: args });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error.message ?? "AI request failed");
  return data as AnthropicResponse;
}
