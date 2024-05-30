/// <reference types="chrome-types" />

window.addEventListener("message", (event) => {
  if (event.source !== window) {
    return;
  }

  const { id, value } = event.data;

  if (id !== "nanotelemetry-devtools") {
    return;
  }

  chrome.runtime.sendMessage(value);

  console.log("[nanotelemetry]", value);
});
