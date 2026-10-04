console.log("ContextShift Copilot content script loaded");

const observer = new MutationObserver(() => {
  const userMessages = document.querySelectorAll(
    '[data-content="user-message"]'
  );

  const assistantMessages = document.querySelectorAll(
    '[data-testid="ai-message-body"]'
  );

  if (userMessages.length === 0 || assistantMessages.length === 0) {
    return;
  }

  const conversation = [];

  const chatPage = document.querySelector(
    '[data-testid="chat-page"]'
  );

  if (!chatPage) {
    return;
  }

  const turns = chatPage.querySelectorAll(
    '[data-content="user-message"], [data-testid="ai-message"]'
  );

  turns.forEach((turn) => {
    if (turn.matches('[data-content="user-message"]')) {
      const content = turn.innerText?.trim();

      if (content) {
        conversation.push({
          role: "user",
          content: content
        });
      }
    }

    if (turn.matches('[data-testid="ai-message"]')) {
      const body = turn.querySelector(
        '[data-testid="ai-message-body"]'
      );

      const content = body?.innerText?.trim();

      if (content) {
        conversation.push({
          role: "assistant",
          content: content
        });
      }
    }
  });

  if (conversation.length >= 2) {
    console.log("Copilot conversation loaded!");
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
