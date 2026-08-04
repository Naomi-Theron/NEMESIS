const { cmd } = require('../lib/command');
const axios = require('axios');
const fs = require('fs');
const { yts } = require('@distube/yts'); // if you use yts, otherwise import your own

// ---------- helpers ----------
function isUrl(str) {
  return /^https?:\/\/\S+/.test(str);
}
function example(url) {
  return `Example: .command ${url}`;
}
function newsletterContext(sender) {
  return {
    mentionedJid: [sender],
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363404529319592@newsletter",
      newsletterName: "Airbyte Synergetic Labs🪀",
      serverMessageId: 143
    }
  };
}

// ============================================================
//  DOWNLOADERS
// ============================================================

cmd({
  pattern: "ssweb",
  react: "🌋",
  desc: "Screenshot a website",
  category: "download",
  use: ".ssweb <url>",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  if (!q || !isUrl(q)) return reply(example("https://ridzcoder.zone.id"));
  const { screenshotV2 } = require('getscreenshot.js');
  const data = await screenshotV2(q);
  await conn.sendMessage(from, { image: data, mimetype: "image/png" }, { quoted: mek });
});

cmd({
  pattern: "repo",
  react: "📂",
  desc: "Get info about the NEMESIS-MD repo",
  category: "info",
  filename: __filename
}, async (conn, mek, m, { reply }) => {
  const repoURL = "https://github.com/Ridzcoder/NEMESIS-MD";
  const match = repoURL.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return reply("Invalid repo URL");
  const [, owner, repo] = match;
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
    const json = await res.json();
    if (!json.name) return reply("Repository not found");
    reply(`📂 *Repository Info*\n\n📛 Name: ${json.name}\n👤 Owner: ${json.owner.login}\n⭐ Stars: ${json.stargazers_count}\n🍴 Forks: ${json.forks_count}\n👀 Watchers: ${json.watchers_count}\n🐞 Issues: ${json.open_issues_count}\n💻 Language: ${json.language || "Unknown"}\n\n🔗 ${json.html_url}\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ Rɪᴅᴢ Cᴏᴅᴇʀ`);
  } catch {
    reply("Error fetching repository");
  }
});

cmd({
  pattern: "gitinfo",
  react: "📊",
  alias: ["github"],
  desc: "Get GitHub user stats",
  category: "info",
  use: ".gitinfo <username>",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  if (!q) return reply("Example: .gitinfo Ridzcoder");
  try {
    const res = await fetch(`https://api.github.com/users/${q}`);
    const json = await res.json();
    reply(`📊 *GitHub Stats*\n\n👤 Username: ${json.login}\n📦 Public Repos: ${json.public_repos}\n👥 Followers: ${json.followers}\n➡️ Following: ${json.following}\n⭐ Bio: ${json.bio || "None"}\n🔗 ${json.html_url}`);
  } catch {
    reply("Error fetching GitHub stats");
  }
});

cmd({
  pattern: "gitclone",
  react: "📥",
  desc: "Download a public GitHub repo as zip",
  category: "download",
  use: ".gitclone <repo-url>",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  if (!q) return reply("Example: .gitclone https://github.com/user/repo");
  try {
    const repoPath = q.replace("https://github.com/", "");
    const zipUrl = `https://github.com/${repoPath}/archive/refs/heads/main.zip`;
    await conn.sendMessage(from, {
      document: { url: zipUrl },
      fileName: `${repoPath.split("/")[1]}.zip`,
      mimetype: "application/zip"
    }, { quoted: mek });
  } catch {
    reply("Failed to download repo");
  }
});

// --------------------------------------

cmd({
  pattern: "wordofday",
  react: "📖",
  desc: "Get a random word of the day",
  category: "fun",
  filename: __filename
}, async (conn, mek, m, { reply }) => {
  try {
    const res = await fetch("https://random-word-api.herokuapp.com/word");
    const json = await res.json();
    reply(`📖 *Word of the Day*\n${json[0]}`);
  } catch {
    reply("Error fetching word");
  }
});

cmd({
  pattern: "historyfact",
  react: "📜",
  desc: "Get a random history fact",
  category: "fun",
  filename: __filename
}, async (conn, mek, m, { reply }) => {
  try {
    const res = await fetch("https://history.muffinlabs.com/date");
    const json = await res.json();
    const fact = json.data.Events[Math.floor(Math.random() * json.data.Events.length)];
    reply(`📜 *History Fact*\n${fact.year} - ${fact.text}`);
  } catch {
    reply("Error fetching history");
  }
});

// ============================================================
//  APK / LYRICS
// ============================================================

cmd({
  pattern: "apk",
  react: "📥",
  desc: "Search and download APK from HappyMod",
  category: "download",
  use: ".apk <app name>",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  if (!q) return reply("Example: .apk whatsapp");
  try {
    const res = await axios.get(`https://kayiza-apis.zone.id/discovery/happymod?query=${encodeURIComponent(q)}`);
    const json = res.data;
    if (!json.result || json.result.length === 0) return reply("App not found");
    const app = json.result[0];
    const caption = `📥 *HappyMod Download*\n\n📛 Name: ${app.name}\n📦 Size: ${app.size}\n⭐ Rating: ${app.rating}\n📥 Downloads: ${app.download}\n🔗 Download: ${app.link}\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ Rɪᴅᴢ Cᴏᴅᴇʀ`;
    await conn.sendMessage(from, {
      image: { url: app.icon },
      caption: caption,
      document: { url: app.link },
      fileName: `${app.name}.apk`,
      mimetype: "application/vnd.android.package-archive"
    }, { quoted: mek });
  } catch {
    reply("Error fetching app");
  }
});

cmd({
  pattern: "lyrics",
  react: "🎵",
  desc: "Get song lyrics",
  category: "search",
  use: ".lyrics <song title>",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  if (!q) return reply("Example: .lyrics already dead juice wrld");
  try {
    const res = await axios.get(`https://kayiza-apis.zone.id/search/lyrics?query=${encodeURIComponent(q)}`);
    const json = res.data;
    if (!json.result) return reply("Lyrics not found");
    const data = json.result;
    reply(`🎵 *Lyrics*\n\n🎤 Title: ${data.title}\n👤 Artist: ${data.artist}\n\n${data.lyrics}\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ Rɪᴅᴢ Cᴏᴅᴇʀ`);
  } catch {
    reply("Error fetching lyrics");
  }
});

// ============================================================
//  SOCIAL MEDIA DOWNLOADERS
// ============================================================

cmd({
  pattern: "instagram",
  react: "🌋",
  alias: ["insta", "ig"],
  desc: "Download Instagram posts/reels",
  category: "download",
  use: ".ig <url>",
  filename: __filename
}, async (conn, mek, m, { from, q, reply, sender }) => {
  const url = q || mek.quoted?.text;
  if (!url || !url.includes("instagram.com")) return reply("Provide Instagram link");
  try {
    const api = `https://api-aswin-sparky.koyeb.app/api/downloader/igdl?url=${encodeURIComponent(url)}`;
    const res = await axios.get(api);
    for (const item of res.data.data) {
      const caption = `📶 *Instagram Downloader*\n❤‍🩹 Quality: HD\n\n> © Powered by Ridz Coder x Kevin Tech`;
      await conn.sendMessage(from, {
        [item.type === 'video' ? 'video' : 'image']: { url: item.url },
        caption: caption,
        contextInfo: newsletterContext(sender)
      }, { quoted: mek });
    }
  } catch {
    reply("Download failed");
  }
});

cmd({
  pattern: "instagram2",
  react: "🌋",
  alias: ["ig2"],
  desc: "Alternative Instagram reels downloader",
  category: "download",
  use: ".ig2 <url>",
  filename: __filename
}, async (conn, mek, m, { from, q, reply, sender }) => {
  if (!q || !q.includes("instagram.com")) return reply("Invalid link");
  try {
    const api = `https://jawad-tech.vercel.app/downloader?url=${encodeURIComponent(q)}`;
    const { data } = await axios.get(api);
    const video = data.result[0];
    const caption = `📥 *Instagram Reel Downloader*\n> Powered by Ridz Coder`;
    await conn.sendMessage(from, {
      video: { url: video },
      caption: caption,
      contextInfo: newsletterContext(sender)
    }, { quoted: mek });
  } catch {
    reply("Failed");
  }
});

cmd({
  pattern: "facebook",
  react: "🌋",
  alias: ["fbdl"],
  desc: "Download Facebook videos",
  category: "download",
  use: ".fbdl <url>",
  filename: __filename
}, async (conn, mek, m, { from, q, reply, sender }) => {
  if (!q || !q.includes("facebook.com")) return reply("Invalid Facebook link");
  try {
    const api = `https://apis.davidcyriltech.my.id/facebook?url=${encodeURIComponent(q)}`;
    const { data } = await axios.get(api);
    const dl = data.result.downloads.hd?.url || data.result.downloads.sd.url;
    const quality = data.result.downloads.hd ? "HD" : "SD";
    const caption = `🎥 *Facebook Video Downloader*\nQuality: ${quality}\n\n> Powered by Ridz Coder`;
    await conn.sendMessage(from, {
      video: { url: dl },
      caption: caption,
      contextInfo: newsletterContext(sender)
    }, { quoted: mek });
  } catch {
    reply("Failed downloading video");
  }
});

// ============================================================
//  INFO / ABOUT
// ============================================================

cmd({
  pattern: "support",
  react: "🌋",
  desc: "Show support info",
  category: "info",
  filename: __filename
}, async (conn, mek, m, { from, sender, reply }) => {
  const dec = `⟣──────────────────⟢\n▧ *ᴄʀᴇᴀᴛᴏʀ* : *Ridz Coder X Kevin tech*\n▧ *ᴍᴏᴅᴇ* : *public*\n▧ *ᴘʀᴇғɪx* : .\n▧ *ᴠᴇʀsɪᴏɴ* : *2.0.0*\n⟣──────────────────⟢\n\n> NEMESIS MD \nhttps://github.com/Ridzcoder/NEMESIS-MD\n\n⟣──────────────────⟢\n> CHANNEL\nhttps://whatsapp.com/channel/0029Vb73EYZFXUujAoHFor1i\n\n> GROUP\nhttps://chat.whatsapp.com/KQzM54TU1LmGwIGc2TcOGi?mode=gi_t`;
  await conn.sendMessage(from, {
    image: { url: "https://files.catbox.moe/qhl7st.png" },
    caption: dec,
    contextInfo: newsletterContext(sender)
  }, { quoted: mek });
});

cmd({
  pattern: "family",
  react: "🌋",
  desc: "Show family members",
  category: "info",
  filename: __filename
}, async (conn, mek, m, { from, sender, reply }) => {
  const caption = `      *╭┈──[ • RIDZ TECH 𝖥𝖠𝖬𝖨𝖫𝖸 • ]───•*\n      *│  ◦* *▢➠*\n      *│  ◦* *▢➠ Kelvin tech*\n      *│  ◦* *▢➠ Jinx*\n      *│  ◦* *▢➠ Terri Dev*\n      *│  ◦* *▢➠ Rivozn Coder*\n      *│  ◦* *▢➠ And You*\n      *╰┈───────────────•*\n        *•────────────•⟢*\n      Family is not about blood,It's about the people who choose to be there for you, support you, and love you unconditionally, no matter what. They're the ones who show up, who listen, and who care 🤗`;
  await conn.sendMessage(from, {
    image: { url: "https://files.catbox.moe/qhl7st.png" },
    caption: caption,
    contextInfo: newsletterContext(sender)
  }, { quoted: mek });
});

cmd({
  pattern: "ridzcoder",
  react: "🌋",
  alias: ["kayiza"],
  desc: "About Ridz Coder",
  category: "info",
  filename: __filename
}, async (conn, mek, m, { from, sender, reply }) => {
  const caption = `╭━━〔 ʀɪᴅᴢ ᴄᴏᴅᴇʀ ɪɴғᴏ〕━━┈⊷\n┃★\n┃★ •ʜᴇʟʟᴏ There 👋, ɪ ᴀᴍ ʀɪᴅᴢ ᴄᴏᴅᴇʀ.\n┃★ •ɪ ʟᴀᴜɢʜ ᴀᴛ ᴇᴠᴇʀʏᴏɴᴇ ᴡʜᴏ ʟᴀᴜɢʜs ᴀᴛ ᴍᴇ.\n┃★ •ɪ ᴀᴍ ᴛʜᴇ ʟᴀsᴛ ᴛʜɪᴇғ, ʙᴜᴛ ᴅᴏɴ'ᴛ ᴄʜᴀsᴇ ᴀғᴛᴇʀ ᴍᴇ\n┃★ •ʙᴇᴄᴀᴜsᴇ ɪ ᴡɪʟʟ ᴄʜᴀɴɢᴇ ᴍʏsᴇʟғ\n┃★ •ᴀsᴋ ᴛʜᴇᴍ ᴀʟʟ ᴀɴᴅ ᴛʜᴇʏ ᴡɪʟʟ ᴛᴇʟʟ ʏᴏᴜ:\n┃★ •ɪғ ʏᴏᴜ sᴛᴀɴᴅ ʙᴇʜɪɴᴅ ᴍᴇ, ɪ ᴘʀᴏᴛᴇᴄᴛ ʏᴏᴜ.\n┃★ •ɪғ ʏᴏᴜ sᴛᴀɴᴅ ʙᴇsɪᴅᴇ ᴍᴇ, ɪ ʀᴇsᴘᴇᴄᴛ ʏᴏᴜ.\n┃★ •ʙᴜᴛ ɪғ ʏᴏᴜ sᴛᴀɴᴅ ᴀɢᴀɪɴsᴛ ᴍᴇ, ɪ sʜᴏᴡ ɴᴏ ᴍᴇʀᴄʏ.\n┃★\n╰━━━━━━━━━━━━━━━┈⊷\n\n> *ᴀ sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ᴅᴇᴠᴇʟᴘᴏʀ*\n\n*╭━━━〔 • MY TOP FRIENDS• 〕━━━┈⊷*\n*┃★╭──────────────*\n*┃★│* *▢KEVIN TECH*\n*┃★│* *▢JINX*\n*┃★│* *▢TERRI DEV*\n*┃★│* *▢KING ORMAN*\n*┃★╰──────────────*\n*╰━━━━━━━━━━━━━━━┈⊷*\n\n*•────────────•⟢*\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ Rɪᴅᴢ Cᴏᴅᴇʀ\n*•────────────•⟢*`;
  await conn.sendMessage(from, {
    image: { url: "https://files.catbox.moe/qhl7st.png" },
    caption: caption,
    contextInfo: newsletterContext(sender)
  }, { quoted: mek });
});

cmd({
  pattern: "pair",
  react: "🌋",
  alias: ["pair2"],
  desc: "Pairing info",
  category: "info",
  filename: __filename
}, async (conn, mek, m, { from, sender, reply }) => {
  const caption = `ohh 😯 No, to pair your number contact Ridz Coder on +237678687593\n\n*•────────────•⟢*\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ Rɪᴅᴢ Cᴏᴅᴇʀ\n*•────────────•⟢*`;
  await conn.sendMessage(from, {
    image: { url: "https://files.catbox.moe/qhl7st.png" },
    caption: caption,
    contextInfo: newsletterContext(sender)
  }, { quoted: mek });
});

// ============================================================
//  MUSIC
// ============================================================

cmd({
  pattern: "play",
  react: "🌋",
  alias: ["song"],
  desc: "Download audio from YouTube",
  category: "download",
  use: ".play <song name>",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  if (!q) return reply("❌ Please provide a song name!\nExample: `.play Lilly Alan Walker`");
  try {
    const { videos } = await yts(q);
    if (!videos || videos.length === 0) {
      await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
      return reply("⚠️ No results found for your query!");
    }
    const video = videos[0];
    await conn.sendMessage(from, { react: { text: "⬇️", key: mek.key } });
    await conn.sendMessage(from, {
      image: { url: video.thumbnail },
      caption: `🎵 *${video.title}*\n\n⬇️ NEMESIS MD is Downloading audio...`
    }, { quoted: mek });

    const apiUrl = `https://yt-dl.officialhectormanuel.workers.dev/?url=${encodeURIComponent(video.url)}`;
    const response = await axios.get(apiUrl);
    const data = response.data;
    if (!data?.status || !data.audio) {
      await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
      return reply("🚫 Download failed. Try again later.");
    }
    await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    await conn.sendMessage(from, {
      document: { url: data.audio },
      mimetype: "audio/mpeg",
      fileName: `${data.title || video.title}.mp3`,
      caption: `🎵 ${data.title || video.title}`
    }, { quoted: mek });
  } catch (error) {
    console.error(error);
    await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    reply("❌ Download failed. Please try again later.");
  }
});

// ============================================================
//  RELIGIOUS
// ============================================================

cmd({
  pattern: "bible",
  react: "🌋",
  desc: "Get a Bible verse",
  category: "religion",
  use: ".bible <book chapter:verse>",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  if (!q) return reply("Example: .bible john 3:16");
  try {
    const res = await fetch(`https://bible-api.com/${encodeURIComponent(q)}`);
    const json = await res.json();
    if (json.error) return reply("Verse not found");
    const verse = json.verses.map(v => `${v.book_name} ${v.chapter}:${v.verse}\n${v.text}`).join("\n");
    reply(`📖 *Bible*\n\n${verse}`);
  } catch {
    reply("Error fetching Bible verse");
  }
});

cmd({
  pattern: "biblelist",
  react: "🌋",
  desc: "List all Bible books",
  category: "religion",
  filename: __filename
}, async (conn, mek, m, { reply }) => {
  reply(`📖 *NEMESIS MD BIBLE BOOKS*\n\n╭──⧼♛ *Old Testament* ♛⧽──≽\n│┃ ♛Genesis\n│┃ ♛ Exodus\n│┃ ♛Leviticus\n│┃ ♛Numbers\n│┃ ♛ Deuteronomy\n│┃ ♛Joshua\n│┃ ♛Judges\n│┃ ♛Ruth\n│┃ ♛1 Samuel\n│┃ ♛ 2 Samuel\n│┃ ♛1 Kings\n│┃ ♛ 2 Kings\n│┃ ♛ 1 Chronicles\n│┃ ♛ 2 Chronicles\n│┃ ♛Ezra\n│┃ ♛ Nehemiah\n│┃ ♛ Esther\n│┃ ♛ Job\n│┃ ♛ Psalms\n│┃ ♛Proverbs\n│┃ ♛ Ecclesiastes\n│┃ ♛ Song of Solomon\n│┃ ♛Isaiah\n│┃ ♛ Jeremiah\n│┃ ♛ Lamentations\n│┃ ♛ Ezekiel\n│┃ ♛Daniel\n│┃ ♛ Hosea\n│┃ ♛ Joel\n│┃ ♛ Amos\n│┃ ♛ Obadiah\n│┃ ♛Jonah\n│┃ ♛ Micah\n│┃ ♛ Nahum\n│┃ ♛ Habakkuk\n│┃ ♛ Zephaniah\n│┃ ♛Haggai\n│┃ ♛ Zechariah\n│┃ ♛ Malachi\n╰──────────────────≽\n\n╭──⧼ *♛New Testament* ♛⧽──≽\n│┃ ♛Matthew\n│┃ ♛ Mark\n│┃ ♛ Luke\n│┃ ♛ John\n│┃ ♛ Act\n│┃ ♛Romans\n│┃ ♛ 1 Corinthians\n│┃ ♛ 2 Corinthians\n│┃ ♛Galatians\n│┃ ♛ Ephesians\n│┃ ♛ Philippians\n│┃ ♛ Colossians\n│┃ ♛1 Thessalonians\n│┃ ♛ 2 Thessalonians\n│┃ ♛1 Timothy\n│┃ ♛ 2 Timothy\n│┃ ♛ Titus\n│┃ ♛ Philemon\n│┃ ♛Hebrews\n│┃ ♛ James\n│┃ ♛ 1 Peter\n│┃ ♛ 2 Peter\n│┃ ♛1 John\n│┃ ♛ 2 John\n│┃ ♛ 3 John\n│┃ ♛ Jude\n│┃ ♛ Revelation\n╰──────────────────≽\nᴘᴏᴡᴇʀᴇᴅ ʙʏ Rɪᴅᴢ Cᴏᴅᴇʀ`);
});

cmd({
  pattern: "quran",
  react: "🌋",
  desc: "Get a Quran verse",
  category: "religion",
  use: ".quran <surah:ayah>",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  if (!q) return reply("Example: .quran 1:1");
  try {
    const res = await fetch(`https://api.alquran.cloud/v1/ayah/${q}/en.asad`);
    const json = await res.json();
    if (json.status !== "OK") return reply("Verse not found");
    reply(`📜 *Quran*\nSurah ${json.data.surah.englishName} (${json.data.surah.number})\nAyah ${json.data.numberInSurah}\n\n${json.data.text}\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ Rɪᴅᴢ Cᴏᴅᴇʀ`);
  } catch {
    reply("Error fetching Quran verse");
  }
});

cmd({
  pattern: "quranlist",
  react: "🌋",
  desc: "List all Quran surahs",
  category: "religion",
  filename: __filename
}, async (conn, mek, m, { reply }) => {
  try {
    const res = await fetch("https://api.alquran.cloud/v1/surah");
    const json = await res.json();
    const list = json.data.map(s => `${s.number}. ${s.englishName} (${s.name})`).join("\n");
    reply(`📜 *Quran Surahs*\n\n${list}`);
  } catch {
    reply("Error fetching surah list");
  }
});

// ============================================================
//  FUN / INTERACTIVE
// ============================================================

cmd({
  pattern: "fact",
  react: "🌋",
  desc: "Get a random useless fact",
  category: "fun",
  filename: __filename
}, async (conn, mek, m, { reply }) => {
  const res = await fetch("https://uselessfacts.jsph.pl/api/v2/facts/random");
  const json = await res.json();
  reply(`🧠 ${json.text}`);
});

cmd({
  pattern: "roast",
  react: "🌋",
  desc: "Get a random insult",
  category: "fun",
  filename: __filename
}, async (conn, mek, m, { reply }) => {
  const res = await fetch("https://evilinsult.com/generate_insult.php?lang=en&type=json");
  const json = await res.json();
  reply(`🔥 ${json.insult}`);
});

cmd({
  pattern: "compliment",
  react: "🌋",
  desc: "Get a random compliment",
  category: "fun",
  filename: __filename
}, async (conn, mek, m, { reply }) => {
  const res = await fetch("https://complimentr.com/api");
  const json = await res.json();
  reply(`💖 ${json.compliment}`);
});

cmd({
  pattern: "truth",
  react: "🌋",
  desc: "Get a random truth question",
  category: "fun",
  filename: __filename
}, async (conn, mek, m, { reply }) => {
  const res = await fetch("https://api.truthordarebot.xyz/v1/truth");
  const json = await res.json();
  reply(`🎯 Truth:\n${json.question}`);
});

cmd({
  pattern: "dare",
  react: "🌋",
  desc: "Get a random dare",
  category: "fun",
  filename: __filename
}, async (conn, mek, m, { reply }) => {
  const res = await fetch("https://api.truthordarebot.xyz/v1/dare");
  const json = await res.json();
  reply(`🎯 Dare:\n${json.question}`);
});

cmd({
  pattern: "riddle",
  react: "🌋",
  desc: "Get a riddle with answer",
  category: "fun",
  filename: __filename
}, async (conn, mek, m, { reply }) => {
  const res = await fetch("https://riddles-api.vercel.app/random");
  const json = await res.json();
  reply(`🧩 Riddle:\n${json.riddle}\n\n💡 Answer:\n${json.answer}`);
});

cmd({
  pattern: "coin",
  react: "🪙",
  desc: "Flip a coin",
  category: "fun",
  filename: __filename
}, async (conn, mek, m, { reply }) => {
  reply(Math.random() < 0.5 ? "🪙 Heads" : "🪙 Tails");
});

cmd({
  pattern: "dice",
  react: "🎲",
  desc: "Roll a dice",
  category: "fun",
  filename: __filename
}, async (conn, mek, m, { reply }) => {
  reply(`🎲 You rolled: ${Math.floor(Math.random() * 6) + 1}`);
});

cmd({
  pattern: "8ball",
  react: "🎱",
  desc: "Ask the magic 8-ball",
  category: "fun",
  filename: __filename
}, async (conn, mek, m, { reply }) => {
  const answers = ["Yes", "No", "Maybe", "Definitely", "Ask again later", "I don't think so"];
  reply(`🎱 ${answers[Math.floor(Math.random() * answers.length)]}`);
});

cmd({
  pattern: "meme",
  react: "🌋",
  desc: "Get a random meme",
  category: "fun",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  const res = await fetch("https://meme-api.com/gimme");
  const json = await res.json();
  await conn.sendMessage(from, { image: { url: json.url }, caption: "> ᴘᴏᴡᴇʀᴇᴅ ʙʏ Rɪᴅᴢ Cᴏᴅᴇʀ" }, { quoted: mek });
});

cmd({
  pattern: "anime",
  react: "🌋",
  desc: "Get a random anime image",
  category: "fun",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  const res = await fetch("https://api.waifu.pics/sfw/waifu");
  const json = await res.json();
  await conn.sendMessage(from, { image: { url: json.url }, caption: "🌸 Anime" }, { quoted: mek });
});

// ============================================================
//  ACTION COMMANDS (hug, kiss, etc.)
// ============================================================

const actions = ['hug', 'kiss', 'cuddle', 'pat', 'poke', 'slap', 'bite', 'kill', 'blush', 'cry', 'smile'];
for (const action of actions) {
  cmd({
    pattern: action,
    react: "🌋",
    desc: `Send a ${action} animation`,
    category: "interaction",
    use: `.${action} @user or reply`,
    filename: __filename
  }, async (conn, mek, m, { from, quoted, reply, sender }) => {
    const target = mek.mentionedJid?.[0] || quoted?.sender;
    if (!target) return reply("Tag or reply to someone");
    try {
      const res = await fetch(`https://api.waifu.pics/sfw/${action}`);
      const json = await res.json();
      await conn.sendMessage(from, {
        image: { url: json.url },
        caption: `😆 *${action.toUpperCase()}* @${target.split("@")[0]}`,
        mentions: [target]
      }, { quoted: mek });
    } catch {
      reply(`Failed to fetch ${action} image`);
    }
  });
}

// ============================================================
//  SHORTLINK
// ============================================================

cmd({
  pattern: "shortlink",
  react: "🌋",
  alias: ["shorturl"],
  desc: "Shorten a URL using TinyURL",
  category: "utility",
  use: ".shortlink <url>",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  if (!q || !isUrl(q)) return reply(example("https://ridzcoder.zone.id"));
  try {
    const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(q)}`);
    reply(`*𝙷𝚎𝚛𝚎 𝚒𝚜 𝚢𝚘𝚞𝚛 𝚜𝚑𝚘𝚛𝚢 𝚕𝚒𝚗𝚔*\n${res.data.toString()}`);
  } catch {
    reply("Error shortening URL");
  }
});