// Each rule: match (regex on the full URL) + transform (URL -> deep link).
// "verified" = well-known scheme; "guess" = plausible, test before trusting.

export const RULES = [
  {
    name: "Notion", status: "verified",
    match: /^https:\/\/(www\.)?notion\.(so|com)\//,
    transform: (url) => url.replace(/^https:/, "notion:"),
  },
  {
    name: "Spotify", status: "verified",
    match: /^https:\/\/open\.spotify\.com\/(track|album|playlist|artist|episode|show)\/([A-Za-z0-9]+)/,
    transform: (url, m) => `spotify:${m[1]}:${m[2]}`,
  },
  {
    name: "Zoom", status: "verified",
    match: /^https:\/\/([\w-]+\.)?zoom\.us\/j\/(\d+)/,
    transform: (url, m) => {
      const pwd = new URL(url).searchParams.get("pwd");
      return `zoommtg://zoom.us/join?confno=${m[2]}${pwd ? `&pwd=${pwd}` : ""}`;
    },
  },
  {
    name: "Slack", status: "verified",
    match: /^https:\/\/app\.slack\.com\/client\/(T\w+)\/([CDG]\w+)/,
    transform: (url, m) => `slack://channel?team=${m[1]}&id=${m[2]}`,
  },
  {
    name: "Figma", status: "guess",
    match: /^https:\/\/(www\.)?figma\.com\/(file|design|board|proto|slides)\//,
    transform: (url) => url.replace(/^https:\/\/(www\.)?figma\.com\//, "figma://"),
  },
  {
    name: "Linear", status: "guess",
    match: /^https:\/\/linear\.app\//,
    transform: (url) => url.replace(/^https:\/\/linear\.app\//, "linear://"),
  },
  {
    // From web/desktop_app/src/deeplink/install_url_deeplink.ts:
    // canva://url/<path> opens ${baseUrl}<path><search><hash> in a desktop tab.
    name: "Canva", status: "verified",
    match: /^https:\/\/www\.canva\.com\//,
    transform: (url) => url.replace(/^https:\/\/www\.canva\.com\//, "canva://url/"),
  },
];

export function deepLinkFor(url) {
  for (const rule of RULES) {
    const m = url.match(rule.match);
    if (m) return { rule, link: rule.transform ? rule.transform(url, m) : null };
  }
  return null;
}
