"use client";

import { useState } from "react";

type Section = {
  title: string;
  steps?: string[];
  body?: string;
};

const sections: Section[] = [
  {
    title: "Getting started",
    steps: [
      "Pin ContextShift: click the puzzle icon in Chrome's toolbar, then the pin next to ContextShift.",
      "Open a chat on ChatGPT, Gemini, Copilot or Claude.",
      "Let the page finish loading. ContextShift reads the messages on screen.",
    ],
  },
  {
    title: "Switch to another AI",
    steps: [
      "Open the ContextShift popup while your chat is open. The message count shows how many messages were detected.",
      "Choose a summary depth: Short, Medium or Detailed.",
      "Under Switch to, pick the AI you want to continue in.",
      "Click Summarize & switch. Wait for the summary to appear.",
      "Click Copy + open. The summary is copied and the new AI opens in a new tab.",
      "Paste the summary into the new chat and keep going.",
    ],
  },
  {
    title: "Which summary depth to pick",
    steps: [
      "Short: about 5–6 lines with your goal, current status and latest request.",
      "Medium: 2–3 short paragraphs with key decisions and progress.",
      "Detailed: full sections including file names, code, commands and open issues. Best for coding chats.",
    ],
  },
  {
    title: "Save the summary",
    body: "On the summary screen, click Copy to copy it, or Download as .md to save it as a file named contextshift-summary.md. Use ← Back to Switch to change the depth and summarize again.",
  },
  {
    title: "Troubleshooting",
    steps: [
      "Messages detected shows 0: refresh the chat page, then open the popup again.",
      "Summary says it failed: check your internet connection and your Gemini API key.",
      "The summary is cut off: click Show more under the summary box.",
      "Copy + open did nothing: click inside the popup first, then try again. Chrome needs the popup to be focused to copy.",
    ],
  },
];

export default function Manual({ onBack }: { onBack: () => void }) {
  const [open, setOpen] = useState<number>(0);

  return (
    <div className="w-md m-10 bg-white rounded-2xl overflow-hidden border border-black">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-300">
        <div className="bg-blue-600 text-white rounded-lg p-2">📖</div>
        <div className="text-lg font-semibold">How to use ContextShift</div>
      </div>

      <div className="px-4 py-3 space-y-2">
        {sections.map((section, index) => {
          const isOpen = open === index;
          return (
            <div key={section.title} className="border border-gray-300 rounded-xl">
              <button
                onClick={() => setOpen(isOpen ? -1 : index)}
                aria-expanded={isOpen}
                className="w-full flex justify-between items-center px-3 py-2 text-left font-medium cursor-pointer hover:bg-gray-100 rounded-xl"
              >
                {section.title}
                <span className="text-gray-500">{isOpen ? "−" : "+"}</span>
              </button>

              {isOpen && (
                <div className="px-3 pb-3 text-sm text-gray-700 leading-6">
                  {section.steps && (
                    <ol className="list-decimal pl-5 space-y-1">
                      {section.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  )}
                  {section.body && <p>{section.body}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={onBack}
        className="w-[calc(100%-2rem)] mx-4 mb-4 border border-gray-300 rounded-xl py-2 hover:bg-gray-100 cursor-pointer"
      >
        ← Back to Switch
      </button>
    </div>
  );
}