// Each rule: match (regex on the full URL) + transform (URL -> deep link).
// "verified" = documented by the vendor (or read from the app's source);
// "guess" = community-reported, test before trusting.
// Order matters: the first matching rule wins.

const swapScheme = (scheme) => (url) => url.replace(/^https:/, `${scheme}:`);

export const RULES = [
  // ── Work & docs ────────────────────────────────────────────────
  {
    name: "Notion", status: "verified",
    match: /^https:\/\/(www\.)?notion\.(so|com)\//,
    transform: swapScheme("notion"),
  },
  {
    // linear.app/docs/get-the-app: linear:// + the rest of the URL.
    name: "Linear", status: "verified",
    match: /^https:\/\/linear\.app\/[\w-]+\//,
    transform: swapScheme("linear"),
  },
  {
    name: "Figma", status: "guess",
    match: /^https:\/\/(www\.)?figma\.com\/(file|design|board|proto|slides)\//,
    transform: (url) => url.replace(/^https:\/\/(www\.)?figma\.com\//, "figma://"),
  },
  {
    // From web/desktop_app/src/deeplink/install_url_deeplink.ts:
    // canva://url/<path> opens ${baseUrl}<path><search><hash> in a desktop tab.
    name: "Canva", status: "verified",
    match: /^https:\/\/www\.canva\.com\//,
    transform: (url) => url.replace(/^https:\/\/www\.canva\.com\//, "canva://url/"),
  },
  {
    // Office URI schemes (learn.microsoft.com/office/client-developer/office-uri-schemes).
    // Direct file paths and /:w:/ /:x:/ /:p:/ share links on SharePoint/OneDrive.
    name: "Microsoft Office", status: "verified",
    match: /^https:\/\/[\w-]+(-my)?\.sharepoint\.com\/(?::([wxp]):\/|.*\.(docx?|xlsx?|pptx?)(?:[?#]|$))/i,
    transform: (url, m) => {
      const kind = (m[2] || m[3]).toLowerCase()[0];
      const app = { w: "ms-word", d: "ms-word", x: "ms-excel", p: "ms-powerpoint" }[kind];
      return `${app}:ofe|u|${url}`;
    },
  },

  // ── Chat & meetings ────────────────────────────────────────────
  {
    name: "Slack", status: "verified",
    match: /^https:\/\/app\.slack\.com\/client\/(T\w+)(?:\/([CDGU]\w+))?/,
    transform: (url, m) =>
      !m[2] ? `slack://open?team=${m[1]}`
      : m[2][0] === "U" ? `slack://user?team=${m[1]}&id=${m[2]}`
      : `slack://channel?team=${m[1]}&id=${m[2]}`,
  },
  {
    name: "Zoom", status: "verified",
    match: /^https:\/\/([\w-]+\.)?zoom\.us\/(?:j|wc(?:\/join)?)\/(\d+)/,
    transform: (url, m) => {
      const pwd = new URL(url).searchParams.get("pwd");
      return `zoommtg://zoom.us/join?confno=${m[2]}${pwd ? `&pwd=${pwd}` : ""}`;
    },
  },
  {
    // Teams docs: replace https:// with msteams:// on teams.microsoft.com/l/ links.
    name: "Microsoft Teams", status: "verified",
    match: /^https:\/\/teams\.microsoft\.com\/l\//,
    transform: swapScheme("msteams"),
  },
  {
    name: "Discord", status: "guess",
    match: /^https:\/\/(?:www\.|ptb\.|canary\.)?discord(?:app)?\.com\/channels\/(.+)/,
    transform: (url, m) => `discord://-/channels/${m[1]}`,
  },
  {
    // core.telegram.org/api/links
    name: "Telegram", status: "verified",
    match: /^https:\/\/t\.me\/(?:(?:joinchat\/|\+)([\w-]+)|([A-Za-z]\w{3,})(?:\/(\d+))?)\/?(?:[?#]|$)/,
    transform: (url, m) =>
      m[1] ? `tg://join?invite=${m[1]}`
      : `tg://resolve?domain=${m[2]}${m[3] ? `&post=${m[3]}` : ""}`,
  },
  {
    name: "WhatsApp", status: "verified",
    match: /^https:\/\/wa\.me\/(\d+)/,
    transform: (url, m) => {
      const text = new URL(url).searchParams.get("text");
      return `whatsapp://send?phone=${m[1]}${text ? `&text=${encodeURIComponent(text)}` : ""}`;
    },
  },
  {
    // support.claude.com/en/articles/14729294
    name: "Claude", status: "verified",
    match: /^https:\/\/claude\.ai\/(new|chat\/[\w-]+|project\/[\w-]+)(?:[?#]|$)/,
    transform: swapScheme("claude"),
  },

  // ── Media & games ──────────────────────────────────────────────
  {
    name: "Spotify", status: "verified",
    match: /^https:\/\/open\.spotify\.com\/(?:intl-[\w-]+\/)?(track|album|playlist|artist|episode|show|user)\/([A-Za-z0-9]+)/,
    transform: (url, m) => `spotify:${m[1]}:${m[2]}`,
  },
  {
    name: "Apple Music", status: "verified",
    match: /^https:\/\/music\.apple\.com\//,
    transform: swapScheme("music"),
  },
  {
    name: "Apple Podcasts", status: "verified",
    match: /^https:\/\/podcasts\.apple\.com\//,
    transform: swapScheme("podcasts"),
  },
  {
    // developer.valvesoftware.com/wiki/Steam_browser_protocol
    name: "Steam", status: "verified",
    match: /^https:\/\/store\.steampowered\.com\/app\/(\d+)/,
    transform: (url, m) => `steam://store/${m[1]}`,
  },
  {
    name: "Steam Community", status: "verified",
    match: /^https:\/\/steamcommunity\.com\//,
    transform: (url) => `steam://openurl/${url}`,
  },

  // ── Dev & tools ────────────────────────────────────────────────
  {
    name: "Raycast Store", status: "guess",
    // Store pages are raycast.com/<owner>/<extension>; skip Raycast's own sections.
    match: /^https:\/\/(?:www\.)?raycast\.com\/(?!(?:blog|changelog|store|pro|teams|ai|developers|careers|legal|press|core-features|windows|ios)\/)([\w-]+)\/([\w-]+)\/?(?:[?#]|$)/,
    transform: (url, m) => `raycast://extensions/${m[1]}/${m[2]}`,
  },
];

export function deepLinkFor(url) {
  for (const rule of RULES) {
    const m = url.match(rule.match);
    if (m) return { rule, link: rule.transform ? rule.transform(url, m) : null };
  }
  return null;
}
