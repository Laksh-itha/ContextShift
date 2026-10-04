console.log("ContextShift Claude content script loaded");

const observer = new MutationObserver(() => {
  const rows = document.querySelectorAll(
    '[data-testid="transcript-row"]'
  );

  if (rows.length > 0) {
    console.log("Claude conversation loaded!");
    console.log("Messages found:", rows.length);

    observer.disconnect();

    const conversation = [];

    rows.forEach((row) => {
      const isUser = row.querySelector(
        '[data-testid="user-message"]'
      );

      conversation.push({
        role: isUser ? "user" : "assistant",
        content: row.innerText
      });
    });

    console.table(conversation);

    chrome.runtime.sendMessage({
      type: "CONVERSATION",
      conversation: conversation
    });
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});