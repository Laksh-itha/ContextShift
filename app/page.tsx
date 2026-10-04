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
      "Download the ContextShift extension ZIP file to your device.",
      "Extract the ZIP file to a folder on your device.",
      "Open your browser and go to the Extensions page.",
      "Turn on Developer mode.",
      "Click Load unpacked and select the extracted ContextShift folder.",
      "Pin ContextShift to your browser toolbar.",
      "The ContextShift extension is now loaded and ready to use.",
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

export default function Home() {
  const [open, setOpen] = useState<number>(0);

  return (
    <main className="min-h-screen bg-white flex flex-col items-center px-4 py-10">
      <h1 className="text-3xl font-bold text-black text-center">ContextShift</h1>
      <p className="mt-3 text-sm text-gray-600 text-center">
        Switch between AI tools without losing your context.
      </p>

      <a
        href="/ContextShift-extension.zip"
        download="ContextShift-extension.zip"
        className="mt-6 inline-block rounded-full border border-blue-600 px-6 py-2 text-sm text-blue-600 hover:bg-blue-50"
      >
        Download ContextShift Extension
      </a>

      <div className="mt-10 w-full max-w-md bg-white rounded-2xl overflow-hidden border border-black">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-300">
          <div className="bg-blue-600 text-white rounded-lg p-2">📖</div>
          <div className="text-lg font-semibold">How to use ContextShift</div>
        </div>

        <div className="px-4 py-3 space-y-2">
          {sections.map((section, index) => {
            const isOpen = open === index;
            return (
              <div
                key={section.title}
                className="border border-gray-300 rounded-xl"
              >
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
      </div>
    </main>
  );
}
