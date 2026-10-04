console.log("ContextShift content script loaded");

const observer = new MutationObserver(() => {
  const messages = document.querySelectorAll(
    '[data-message-author-role]'
  );

  console.log("Messages currently found:", messages.length);

  if (messages.length === 0) {
    return;
  }

  console.log("Conversation loaded!");

  const conversation = [];

  messages.forEach((message) => {
  const content = message.innerText?.trim();
  const role = message.getAttribute("data-message-author-role");

  if (!content) {
    return;
  }

  conversation.push({
    role: role,
    content: content
  });
});

  console.log("CONTEXTSHIFT EXTRACTED CHAT:", conversation);
  chrome.runtime.sendMessage({
  type: "CONVERSATION",
  sourceAI: "ChatGPT",
  conversation: conversation
});

  observer.disconnect();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});