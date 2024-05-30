/// <reference types="chrome-types" />

chrome.runtime.onMessage.addListener((message, sender) => {
  console.log(chrome);

  if (message.type === "init") {
    chrome.action.setIcon({
      path: {
        "128": "/icons/icon-128.png",
      },
    });
  }

  return true;
});
