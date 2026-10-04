chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "CONVERSATION") {
    console.log("Conversation received by extension:");
    console.log(message.conversation);

    if (!message.conversation || message.conversation.length === 0) {
      console.log("Empty conversation. Not saving.");
      return;
    }

    chrome.storage.local.set(
  {
    conversation: message.conversation,
    sourceAI: message.sourceAI
  },
      () => {
        console.log(
          "Saved to storage:",
          message.conversation.length,
          "messages"
        );
      }
    );
  }
});