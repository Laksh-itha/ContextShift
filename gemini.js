console.log("ContextShift Gemini content script loaded");

const observer = new MutationObserver(() => {
  const turns = document.querySelectorAll(
    "user-query, model-response"
  );

  if (turns.length === 0) {
    return;
  }

  const conversation = [];

  turns.forEach((turn) => {
    const content = turn.innerText?.trim();

    // Skip elements that haven't finished rendering
    if (!content) {
      return;
    }

    if (turn.matches("user-query")) {
      conversation.push({
        role: "user",
        content: content
      });
    }

    if (turn.matches("model-response")) {
      conversation.push({
        role: "assistant",
        content: content
      });
    }
  });

  // Only send when we actually have content
  if (conversation.length >= 2) {
    console.log("Gemini conversation loaded!");
    console.log("Messages found:", conversation.length);

    console.table(conversation);

    chrome.runtime.sendMessage({
      type: "CONVERSATION",
      conversation: conversation
    });

    observer.disconnect();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});