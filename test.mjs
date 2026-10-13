// Run: node test.mjs
// [web URL, expected deep link (null = no rule should match)]
import { deepLinkFor } from "./rules.js";

const CASES = [
  // Notion
  ["https://www.notion.so/acme/Roadmap-1a2b3c4d5e6f", "notion://www.notion.so/acme/Roadmap-1a2b3c4d5e6f"],
  ["https://www.notion.com/acme/Roadmap-1a2b3c", "notion://www.notion.com/acme/Roadmap-1a2b3c"],
  ["https://acme.notion.site/Public-page-123", null],
  // Linear
  ["https://linear.app/acme/issue/ENG-123/fix-login", "linear://linear.app/acme/issue/ENG-123/fix-login"],
  ["https://linear.app/pricing", null],
  // Figma
  ["https://www.figma.com/design/AbC123/My-File?node-id=1-2", "figma://design/AbC123/My-File?node-id=1-2"],
  ["https://www.figma.com/board/XyZ/Jam", "figma://board/XyZ/Jam"],
  ["https://www.figma.com/pricing", null],
  // Canva
  ["https://www.canva.com/design/DAF123/edit", "canva://url/design/DAF123/edit"],
  // Office
  ["https://acme.sharepoint.com/sites/Team/Shared%20Documents/Plan.docx", "ms-word:ofe|u|https://acme.sharepoint.com/sites/Team/Shared%20Documents/Plan.docx"],
  ["https://acme-my.sharepoint.com/:x:/g/personal/jo/EaBc?e=1", "ms-excel:ofe|u|https://acme-my.sharepoint.com/:x:/g/personal/jo/EaBc?e=1"],
  ["https://acme.sharepoint.com/:p:/r/sites/T/Deck.pptx?d=w1", "ms-powerpoint:ofe|u|https://acme.sharepoint.com/:p:/r/sites/T/Deck.pptx?d=w1"],
  ["https://acme.sharepoint.com/sites/Team/SitePages/Home.aspx", null],
  // Slack
  ["https://app.slack.com/client/T0123ABC/C0456DEF", "slack://channel?team=T0123ABC&id=C0456DEF"],
  ["https://app.slack.com/client/T0123ABC/D0456DEF", "slack://channel?team=T0123ABC&id=D0456DEF"],
  ["https://app.slack.com/client/T0123ABC/U0456DEF", "slack://user?team=T0123ABC&id=U0456DEF"],
  ["https://app.slack.com/client/T0123ABC", "slack://open?team=T0123ABC"],
  // Zoom
  ["https://us02web.zoom.us/j/81234567890?pwd=abcDEF.1", "zoommtg://zoom.us/join?confno=81234567890&pwd=abcDEF.1"],
  ["https://zoom.us/j/81234567890", "zoommtg://zoom.us/join?confno=81234567890"],
  ["https://zoom.us/wc/join/81234567890", "zoommtg://zoom.us/join?confno=81234567890"],
  ["https://zoom.us/pricing", null],
  // Teams
  ["https://teams.microsoft.com/l/meetup-join/19%3ameeting_X%40thread.v2/0?context=%7b%7d", "msteams://teams.microsoft.com/l/meetup-join/19%3ameeting_X%40thread.v2/0?context=%7b%7d"],
  ["https://teams.microsoft.com/v2/", null],
  // Discord
  ["https://discord.com/channels/123/456", "discord://-/channels/123/456"],
  ["https://discord.com/channels/@me/456", "discord://-/channels/@me/456"],
  ["https://discord.com/invite/abc", null],
  // Telegram
  ["https://t.me/durov", "tg://resolve?domain=durov"],
  ["https://t.me/durov/42", "tg://resolve?domain=durov&post=42"],
  ["https://t.me/+AbCdEf123", "tg://join?invite=AbCdEf123"],
  ["https://t.me/joinchat/AbCdEf123", "tg://join?invite=AbCdEf123"],
  // WhatsApp
  ["https://wa.me/61400000000?text=hi%20there", "whatsapp://send?phone=61400000000&text=hi%20there"],
  // Claude
  ["https://claude.ai/chat/0b1c2d3e-aaaa-bbbb-cccc-123456789abc", "claude://claude.ai/chat/0b1c2d3e-aaaa-bbbb-cccc-123456789abc"],
  ["https://claude.ai/project/0b1c2d3e-aaaa", "claude://claude.ai/project/0b1c2d3e-aaaa"],
  ["https://claude.ai/new", "claude://claude.ai/new"],
  ["https://claude.ai/settings/profile", null],
  // Spotify
  ["https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC?si=xyz", "spotify:track:4uLU6hMCjMI75M1A2tKUQC"],
  ["https://open.spotify.com/intl-de/album/1DFixLWuPkv3KT3TnV35m3", "spotify:album:1DFixLWuPkv3KT3TnV35m3"],
  ["https://open.spotify.com/", null],
  // Apple
  ["https://music.apple.com/au/album/x/123?i=456", "music://music.apple.com/au/album/x/123?i=456"],
  ["https://podcasts.apple.com/us/podcast/x/id123", "podcasts://podcasts.apple.com/us/podcast/x/id123"],
  // Steam
  ["https://store.steampowered.com/app/413150/Stardew_Valley/", "steam://store/413150"],
  ["https://steamcommunity.com/id/someone", "steam://openurl/https://steamcommunity.com/id/someone"],
  // Raycast
  ["https://www.raycast.com/raycast/github", "raycast://extensions/raycast/github"],
  ["https://www.raycast.com/blog/some-post", null],
  ["https://www.raycast.com/changelog/1-80-0", null],
  // Unmapped
  ["https://github.com/joshuafodera/open-in-desktop-extension", null],
  ["https://docs.google.com/document/d/abc/edit", null],
];

let fail = 0;
for (const [url, want] of CASES) {
  const got = deepLinkFor(url)?.link ?? null;
  if (got !== want) {
    fail++;
    console.log(`✗ ${url}\n    want ${want}\n    got  ${got}`);
  }
}
console.log(`${CASES.length - fail}/${CASES.length} passed`);
process.exit(fail ? 1 : 0);
