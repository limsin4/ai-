export type DeepSeekRole = "system" | "user" | "assistant";

export type DeepSeekMessage = {
  role: DeepSeekRole;
  content: string;
};

export type DeepSeekOptions = {
  model?: string;
  temperature?: number;
  timeoutMs?: number;
  systemPrompt?: string;
};

type DeepSeekChoice = {
  message?: {
    content?: string;
  };
};

type DeepSeekApiResponse = {
  choices?: DeepSeekChoice[];
};

const DEFAULT_API_BASE = "https://api.deepseek.com";
const DEFAULT_MODEL = "deepseek-chat";
const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_SYSTEM_PROMPT = "你是严谨的中文 AI 圆桌讨论助手。请遵循用户 Prompt 的 JSON 输出约束。";

function getDeepSeekConfig(options: DeepSeekOptions = {}) {
  const apiKey = process.env.DEEPSEEK_KEY ?? process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("DEEPSEEK_KEY is not configured");
  }

  return {
    apiKey,
    apiBase: process.env.DEEPSEEK_API_BASE ?? DEFAULT_API_BASE,
    model: options.model ?? process.env.DEEPSEEK_MODEL ?? DEFAULT_MODEL,
    temperature: options.temperature ?? 0.7,
    timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  };
}

function buildChatMessages(prompt: string, options: DeepSeekOptions = {}): DeepSeekMessage[] {
  if (!prompt.trim()) {
    throw new Error("prompt cannot be empty");
  }

  return [
    {
      role: "system",
      content: options.systemPrompt ?? DEFAULT_SYSTEM_PROMPT
    },
    {
      role: "user",
      content: prompt
    }
  ];
}

async function readErrorBody(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

function extractJsonText(content: string): string {
  const trimmed = content.trim();

  if (!trimmed) {
    throw new Error("DeepSeek returned an empty response");
  }

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const firstObject = trimmed.indexOf("{");
  const lastObject = trimmed.lastIndexOf("}");
  const firstArray = trimmed.indexOf("[");
  const lastArray = trimmed.lastIndexOf("]");

  const objectCandidate =
    firstObject >= 0 && lastObject > firstObject ? trimmed.slice(firstObject, lastObject + 1) : "";
  const arrayCandidate = firstArray >= 0 && lastArray > firstArray ? trimmed.slice(firstArray, lastArray + 1) : "";

  if (objectCandidate && (!arrayCandidate || firstObject < firstArray)) {
    return objectCandidate;
  }

  if (arrayCandidate) {
    return arrayCandidate;
  }

  return trimmed;
}

export async function callDeepSeek(messages: DeepSeekMessage[], options: DeepSeekOptions = {}): Promise<string> {
  if (messages.length === 0) {
    throw new Error("messages cannot be empty");
  }

  const { apiKey, apiBase, model, temperature, timeoutMs } = getDeepSeekConfig(options);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${apiBase}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages,
        temperature
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const errorBody = await readErrorBody(response);
      throw new Error(`DeepSeek request failed with ${response.status}: ${errorBody || response.statusText}`);
    }

    const data = (await response.json()) as DeepSeekApiResponse;
    const content = data.choices?.[0]?.message?.content;

    if (!content?.trim()) {
      throw new Error("DeepSeek response did not include message content");
    }

    return content;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`DeepSeek request timed out after ${timeoutMs}ms`);
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("DeepSeek request failed with an unknown error");
  } finally {
    clearTimeout(timeout);
  }
}

export async function callDeepSeekText(prompt: string, options: DeepSeekOptions = {}): Promise<string> {
  return callDeepSeek(buildChatMessages(prompt, options), options);
}

export async function callDeepSeekJson<T = unknown>(prompt: string, options: DeepSeekOptions = {}): Promise<T> {
  const content = await callDeepSeekText(prompt, options);
  const jsonText = extractJsonText(content);

  try {
    return JSON.parse(jsonText) as T;
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown parse error";
    throw new Error(`DeepSeek returned invalid JSON: ${reason}`);
  }
}
