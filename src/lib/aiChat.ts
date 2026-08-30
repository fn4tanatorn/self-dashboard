import { supabase } from "./push";

export const AI_MODELS = [
  { id: "claude-haiku-4-5-20251001", label: "Haiku 4.5 — fast & cheap" },
  { id: "claude-sonnet-5", label: "Sonnet 5 — balanced" },
  { id: "claude-opus-5", label: "Opus 5 — most capable" },
] as const;

const MODEL_KEY = "self.aiModel";

export function getAiModel(): string {
  return window.localStorage.getItem(MODEL_KEY) || AI_MODELS[0].id;
}

export function setAiModel(model: string): void {
  window.localStorage.setItem(MODEL_KEY, model);
}

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
  usage?: { input_tokens: number; output_tokens: number };
  error?: { message: string };
}

export async function callAiChat(args: {
  system: string;
  messages: AnthropicMessage[];
  tools: AnthropicToolSchema[];
  model?: string;
}): Promise<AnthropicResponse> {
  const { data, error } = await supabase.functions.invoke("ai-chat", { body: args });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error.message ?? "AI request failed");
  return data as AnthropicResponse;
}
