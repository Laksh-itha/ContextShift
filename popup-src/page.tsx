"use client";
import { useEffect, useState } from "react";
import Manual from "./Manual";
import { ArrowLeftRight, HelpCircle } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("Switch");
  const [usage, setUsage] = useState(0);
  const [summaryDepth, setSummaryDepth] = useState("Short");
  const [destination, setDestination] = useState("ChatGPT");
  const [screen, setScreen] = useState("switch");
  const [copied, setCopied] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [sourceAI, setSourceAI] = useState("");
  const [conversation, setConversation] = useState<
    { role: string; content: string }[]
  >([]);

  const [summary, setSummary] = useState("");
  const [expandedMessages, setExpandedMessages] = useState<number[]>([]);
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  useEffect(() => {
    const chromeApi = (window as any).chrome;

    console.log("ContextShift React popup loaded");

    if (!chromeApi?.storage?.local) {
      console.log("Chrome storage not available");
      return;
    }

    const loadConversation = () => {
      chromeApi.storage.local.get(
        "conversation",
        (result: any) => {
          console.log("Stored conversation:", result);

          const messages = result?.conversation;

          if (Array.isArray(messages)) {
            console.log("Messages loaded:", messages.length);

            setConversation(messages);
            setMessageCount(messages.length);
            setSourceAI(result?.sourceAI || "");

            const totalCharacters = messages.reduce(
              (total: number, message: any) =>
                total + (message.content?.length || 0),
              0
            );

            const calculatedUsage = Math.min(
              100,
              Math.ceil(totalCharacters / 100)
            );

            setUsage(calculatedUsage);
          }
        }
      );
    };

    loadConversation();

    const handleStorageChange = (
      changes: any,
      areaName: string
    ) => {
      if (
        areaName === "local" &&
        changes.conversation
      ) {
        const newConversation =
          changes.conversation.newValue;

        if (Array.isArray(newConversation)) {
          console.log(
            "New conversation received:",
            newConversation.length
          );

          setConversation(newConversation);
          setMessageCount(newConversation.length);

          setSourceAI(
            changes.sourceAI?.newValue || ""
          );

          const totalCharacters = newConversation.reduce(
            (total: number, message: any) =>
              total + (message.content?.length || 0),
            0
          );

          const calculatedUsage = Math.min(
            100,
            Math.ceil(totalCharacters / 100)
          );

          setUsage(calculatedUsage);
        }
      }
    };

    chromeApi.storage.onChanged.addListener(
      handleStorageChange
    );

    return () => {
      chromeApi.storage.onChanged.removeListener(
        handleStorageChange
      );
    };
  }, []);
  const openDestination = () => {
    const chromeApi = (window as any).chrome;

    const urls: Record<string, string> = {
      ChatGPT: "https://chatgpt.com",
      Gemini: "https://gemini.google.com",
      Copilot: "https://copilot.microsoft.com",
      Claude: "https://claude.ai",
    };

    const url = urls[destination];

    if (url && chromeApi?.tabs?.create) {
      chromeApi.tabs.create({ url });
    }
  }; const smartTruncate = (text: string, limit: number) => {
    if (text.length <= limit) return text;
    const truncated = text.slice(0, limit);

    const lastPeriod = Math.max(
      truncated.lastIndexOf(". "),
      truncated.lastIndexOf(".\n"),
      truncated.lastIndexOf("! "),
      truncated.lastIndexOf("? ")
    );
    if (lastPeriod > limit * 0.6) {
      return truncated.slice(0, lastPeriod + 1) + "..";
    }

    const lastSpace = truncated.lastIndexOf(" ");
    return truncated.slice(0, lastSpace) + "...";
  };
  const lengths: Record<string, string> = {
    Short: "about 5-6 lines. Cover only the main goal, where things stand now, and the user's latest request. No lists, no code.",
    Medium: "about 2-3 short paragraphs covering goal, key decisions, current progress and latest request.",
    Detailed: "a thorough chronological summary with sections: Goal, Requirements, Decisions Made, Technical Details (file names, code, commands), Current Progress, Unresolved Issues, Latest Request.",
  };

  const createSummary = async () => {
    if (!conversation.length) {
      setSummary("No conversation was detected.");
      setScreen("summary");
      return;
    }

    try {
      setSummary("Generating context...");
      setScreen("summary");

      const transcript = conversation
        .map((m, i) => `[${i + 1}] ${m.role.toUpperCase()}:\n${m.content}`)
        .join("\n\n");

      const key = (import.meta as any).env?.VITE_GEMINI_API_KEY;

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": key,
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{
                text:
                  `You summarize chat transcripts so the user can continue them in another AI. ` +
                  `Write the summary in chronological order, ${lengths[summaryDepth]} ` +
                  `Keep file names, code details and decisions exactly as written. Do not invent anything. ` +
                  `Output only the summary. Never repeat these instructions or the transcript.`,
              }],
            },
            contents: [{ role: "user", parts: [{ text: `Summarize this conversation:\n\n${transcript}` }] }],
          }),
        }
      );

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error?.message || "Gemini request failed");

      setSummary(data.candidates[0].content.parts[0].text.trim());
      setSummaryExpanded(false);
    } catch (error) {
      console.error("Summarization failed:", error);
      setSummary("Failed to generate summary. Check your Gemini API key and internet connection.");
    }
  };
  const toggleMessage = (index: number) => {
    setExpandedMessages((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index]
    );
  };
  return (
    <div className="flex">


      {screen === "switch" && (
        <div className="w-md h-md m-10 rounded-2xl border border-black p-3">

          <div className="flex items-center px-3 m-2">
            <div className="bg-blue-500 border border-blue-500 rounded">
              <ArrowLeftRight />
            </div>
            <div className="ml-3 text-lg font-semibold">ContextShift</div>
            <button
              onClick={() => setScreen("manual")}
              aria-label="Open user manual"
              className="ml-auto text-gray-500 hover:text-blue-600 cursor-pointer"
            >
              <HelpCircle />
            </button>
          </div>

          <div className="border-t border-gray-300 my-4 flex items-center gap-2"></div>

          <div>
            <div className="text-lg font-medium text-black">
              Messages detected: {messageCount}
            </div>

            <div className="mt-3 space-y-2">
              {conversation.map((message, index) => {
                const isExpanded = expandedMessages.includes(index);
                return (
                  <div key={index} className="border rounded-lg p-2">
                    <div className="font-medium text-gray-400 mb-1">
                      {message.role}
                    </div>
                    <div
                      className={
                        isExpanded
                          ? "text-xs mt-1 whitespace-pre-wrap text-gray-700"
                          : "text-xs mt-1 whitespace-pre-wrap line-clamp-3 text-gray-700"
                      }
                    >
                      {message.content}
                    </div>
                    <button
                      onClick={() => toggleMessage(index)}
                      className="text-blue-600 text-xs mt-1 cursor-pointer hover:underline"
                    >
                      {isExpanded ? "Show less" : "Show more"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-gray-300 mt-3">
            <div className="text-lg px-0 p-2 font-medium">Summary depth</div>
            <div className="flex justify-between gap-3 mt-1">
              <div
                onClick={() => setSummaryDepth("Short")}
                className={
                  summaryDepth === "Short"
                    ? "flex-1 text-center border border-blue-500 bg-blue-200 rounded-2xl py-2 m-2 cursor-pointer"
                    : "flex-1 text-center border border-gray-300 rounded-2xl py-2 m-2 cursor-pointer"
                }
              >
                Short
              </div>
              <div
                onClick={() => setSummaryDepth("Medium")}
                className={
                  summaryDepth === "Medium"
                    ? "flex-1 text-center border border-blue-500 bg-blue-200 rounded-2xl py-2 m-2 cursor-pointer"
                    : "flex-1 text-center border border-gray-300 rounded-2xl py-2 m-2 cursor-pointer"
                }
              >
                Medium
              </div>
              <div
                onClick={() => setSummaryDepth("Detailed")}
                className={
                  summaryDepth === "Detailed"
                    ? "flex-1 text-center border border-blue-500 bg-blue-200 rounded-2xl py-2 m-2 cursor-pointer"
                    : "flex-1 text-center border border-gray-300 rounded-2xl py-2 m-2 cursor-pointer"
                }
              >
                Detailed
              </div>
            </div>
          </div>

          <div className="border-t border-gray-300 mt-6 pt-4">
            <div className="text-lg font-medium">Switch to</div>
            <div className="flex flex-col gap-3 mt-4 p-3">
              {["ChatGPT", "Gemini", "Copilot", "Claude"].map((ai) => (
                <div
                  key={ai}
                  onClick={() => setDestination(ai)}
                  className={
                    destination === ai
                      ? "border border-blue-300 bg-blue-100 rounded-2xl px-4 py-2 cursor-pointer"
                      : "border border-gray-300 rounded-2xl px-4 py-2 cursor-pointer"
                  }
                >
                  <div className="font-semibold">{ai}</div>
                  <div className="text-gray-500 text-sm">
                    {ai === "ChatGPT" && "GPT-4o OpenAI"}
                    {ai === "Gemini" && "Gemini 1.5 Google"}
                    {ai === "Copilot" && "GPT-4 Microsoft"}
                    {ai === "Claude" && "Claude 3.5 Anthropic"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            onClick={createSummary}
            className="text-white p-4 text-lg font-medium rounded-2xl bg-blue-600 hover:bg-blue-700 cursor-pointer text-center w-full"
          >
            Summarize & switch to {destination}
          </div>

          <div className="border-t border-gray-300 mt-6 pt-4 text-center text-sm text-gray-500">
            ContextShift
          </div>

        </div>
      )}


      {screen === "summary" && (
        <div className="w-105 m-10 bg-white rounded-2xl overflow-hidden border">

          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-300">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white rounded-lg p-2">📋</div>
              <div>
                <div className="text-lg font-semibold">Summary ready</div>
              </div>
            </div>
          </div>

          <div className="px-4 py-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-gray-500">Context to carry over</div>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(summary);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm hover:bg-gray-100 cursor-pointer"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>

              </div>
            </div>

            <div className="bg-gray-100 border border-gray-300 rounded-xl p-3 text-gray-600 text-sm leading-6">
              <div className={summaryExpanded ? "whitespace-pre-wrap" : "whitespace-pre-wrap line-clamp-6"}>
                {summary || "No summary available."}
              </div>
              {summary && (
                <button
                  onClick={() => setSummaryExpanded((c) => !c)}
                  className="text-blue-600 text-xs mt-2 cursor-pointer hover:underline"
                >
                  {summaryExpanded ? "Show less" : "Show more"}
                </button>
              )}
            </div>

            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(summary);
                  openDestination();
                } catch (error) {
                  console.error("Copy failed:", error);
                }
              }}
              className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 font-semibold cursor-pointer"
            >
              ↗️ Copy + open {destination}
            </button>

            <button
              onClick={() => {
                const blob = new Blob([summary], { type: "text/markdown" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "contextshift-summary.md";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="w-full mt-2 border border-gray-300 rounded-xl py-2 text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              ⇩ Download as .md
            </button>
          </div>

          <div className="border-t border-gray-300 bg-gray-100 px-4 py-2 text-gray-500 text-xs">
            Summarized locally · not stored · never shared
          </div>

          <button
            onClick={() => setScreen("switch")}
            className="w-full border border-gray-300 rounded-xl py-2 mt-3 hover:bg-gray-100 cursor-pointer"
          >
            ← Back to Switch
          </button>

        </div>
      )}

      {screen === "manual" && <Manual onBack={() => setScreen("switch")} />}

    </div>
  );
}