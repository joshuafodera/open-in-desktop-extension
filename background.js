import { deepLinkFor } from "./rules.js";

function flash(tabId, text, color) {
  chrome.action.setBadgeBackgroundColor({ tabId, color });
  chrome.action.setBadgeText({ tabId, text });
  setTimeout(() => chrome.action.setBadgeText({ tabId, text: "" }), 1500);
}

chrome.action.onClicked.addListener(async (tab) => {
  const hit = tab.url && deepLinkFor(tab.url);

  if (!hit) return flash(tab.id, "—", "#888");          // no mapping for this site
  if (!hit.link) return flash(tab.id, "?", "#d97706");  // mapped but scheme unknown

  // Fire the deep link from the page itself. If the app isn't installed,
  // nothing happens and the tab stays exactly as it was.
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (link) => { window.location.href = link; },
    args: [hit.link],
  });
  flash(tab.id, "↗", "#16a34a");
});
