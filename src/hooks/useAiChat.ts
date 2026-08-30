import { useState } from "react";
import { callAiChat, type AnthropicContentBlock, type AnthropicMessage } from "../lib/aiChat";
import { buildStateSnapshot, executeTool, TOOL_SCHEMAS, type ToolExecContext } from "../lib/aiChatTools";

export interface DisplayMessage {
  role: "user" | "assistant" | "system";
  text: string;
}

const SYSTEM_PROMPT =
  "You are a helpful assistant embedded in the user's personal \"Life OS\" dashboard app. " +
  "You can see the user's current tasks, goals, habits, and notes (summarized below) and take " +
  "actions on their behalf using the provided tools — add/complete tasks, add goals, update goal " +
  "progress, log habits, add notes. Always use a tool when the user asks you to create, change, or " +
  "complete something — don't just describe what you would do. Keep replies short and reply in the " +
  "same language the user writes in. Never invent data that isn't in the summary below.";

const MAX_TOOL_ROUNDS = 5;

export function useAiChat(ctx: ToolExecContext, model: string) {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [history, setHistory] = useState<AnthropicMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(userText: string) {
    const text = userText.trim();
    if (!text || sending) return;
    setSending(true);
    setError(null);
    setMessages((prev) => [...prev, { role: "user", text }]);

    let convo: AnthropicMessage[] = [...history, { role: "user", content: text }];
    const system = `${SYSTEM_PROMPT}\n\n${buildStateSnapshot(ctx)}`;

    try {
      for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
        const resp = await callAiChat({ system, messages: convo, tools: TOOL_SCHEMAS, model });
        convo = [...convo, { role: "assistant", content: resp.content }];

        const textBlocks = resp.content.filter(
          (b): b is { type: "text"; text: string } => b.type === "text",
        );
        if (textBlocks.length > 0) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", text: textBlocks.map((b) => b.text).join("\n") },
          ]);
        }

        const toolUseBlocks = resp.content.filter(
          (b): b is { type: "tool_use"; id: string; name: string; input: Record<string, unknown> } =>
            b.type === "tool_use",
        );
        if (resp.stop_reason !== "tool_use" || toolUseBlocks.length === 0) break;

        const toolResults: AnthropicContentBlock[] = [];
        for (const tb of toolUseBlocks) {
          const { result, isError } = await executeTool(tb.name, tb.input, ctx);
          setMessages((prev) => [...prev, { role: "system", text: result }]);
          toolResults.push({ type: "tool_result", tool_use_id: tb.id, content: result, is_error: isError });
        }
        convo = [...convo, { role: "user", content: toolResults }];
      }
      setHistory(convo);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  }

  return { messages, sending, error, send };
}
