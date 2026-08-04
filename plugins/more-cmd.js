const { cmd } = require('../lib/command');
const axios = require('axios');
const fs = require('fs');
const { yts } = require('yts-search'); // adjust import
const googleTTS = require('google-tts-api'); // or your TTS lib
const acr = require('acrcloud'); // or your ACRCloud instance
// … other imports (ephoto, AI functions, etc.) are expected to be defined elsewhere

// ============================================================
//  SEARCH & UTILITY
// ============================================================

cmd({
  pattern: "yts",
  react: "🌋",
  desc: "Search YouTube videos",
  category: "search",
  use: ".yts <query>",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  if (!q) return reply("❌ Give search text");
  const { videos } = await yts(q);
  if (!videos.length) return reply("❌ No results");
  let msg = `🔍 *YouTube Search*\n\n`;
  videos.slice(0, 9).forEach((v, i) => {
    msg += `${i + 1}. ${v.title}\n⏱ ${v.timestamp}\n🔗 ${v.url}\n\n`;
  });
  reply(msg);
});

// ============================================================
//  EPHOTO360 TEXT EFFECTS
// ============================================================
// (All use a common pattern – we need the 'ephoto' function defined elsewhere)

const ephotoEffects = [
  { pattern: "advancedglow", link: "https://en.ephoto360.com/advanced-glow-effects-74.html" },
  { pattern: "blackpinklogo", link: "https://en.ephoto360.com/create-blackpink-logo-online-free-607.html" },
  { pattern: "blackpinkstyle", link: "https://en.ephoto360.com/online-blackpink-style-logo-maker-effect-711.html" },
  { pattern: "cartoonstyle", link: "https://en.ephoto360.com/create-a-cartoon-style-graffiti-text-effect-online-668.html" },
  { pattern: "deadpool", link: "https://en.ephoto360.com/create-light-effects-green-neon-online-429.html" },
  { pattern: "effectclounds", link: "https://en.ephoto360.com/write-text-effect-clouds-in-the-sky-online-619.html" }, // typo kept
  { pattern: "flagtext", link: "https://en.ephoto360.com/nigeria-3d-flag-text-effect-online-free-753.html" },
  { pattern: "freecreate", link: "https://en.ephoto360.com/free-create-a-3d-hologram-text-effect-441.html" },
  { pattern: "galaxystyle", link: "https://en.ephoto360.com/create-galaxy-style-free-name-logo-438.html" },
  { pattern: "galaxywallpaper", link: "https://en.ephoto360.com/create-galaxy-wallpaper-mobile-online-528.html" },
  { pattern: "makingneon", link: "https://en.ephoto360.com/making-neon-light-text-effect-with-galaxy-style-521.html" },
  { pattern: "matrix", link: "https://en.ephoto360.com/matrix-text-effect-154.html" },
  { pattern: "royaltext", link: "https://en.ephoto360.com/royal-text-effect-online-free-471.html" },
  { pattern: "sand", link: "https://en.ephoto360.com/write-in-sand-summer-beach-online-576.html" },
  { pattern: "summerbeach", link: "https://en.ephoto360.com/write-in-sand-summer-beach-online-free-595.html" },
  { pattern: "topography", link: "https://en.ephoto360.com/create-typography-text-effect-on-pavement-online-774.html" },
  { pattern: "typography", link: "https://en.ephoto360.com/create-typography-text-effect-on-pavement-online-774.html" },
  { pattern: "luxurygold", link: "https://en.ephoto360.com/create-a-luxury-gold-text-effect-online-594.html" }
];

for (const effect of ephotoEffects) {
  cmd({
    pattern: effect.pattern,
    react: "🌋",
    desc: `Generate a "${effect.pattern}" text effect`,
    category: "image",
    use: `.${effect.pattern} <text>`,
    filename: __filename
  }, async (conn, mek, m, { from, q, reply }) => {
    if (!q) return reply(`*Example: ${prefix || '.'}${effect.pattern} Ridz Coder*`);
    try {
      const result = await ephoto(effect.link, q); // ephoto() must be defined
      await conn.sendMessage(from, { image: { url: result }, caption: `> ${global.wm || 'NEMESIS MD'}` }, { quoted: mek });
    } catch (error) {
      console.error(`Error in ${effect.pattern}:`, error);
      reply("*An error occurred while generating the effect.*");
    }
  });
}

// ============================================================
//  IMDB / MOVIE
// ============================================================

cmd({
  pattern: "imdb",
  react: "🌋",
  alias: ["movie"],
  desc: "Get movie/series info from IMDB",
  category: "search",
  use: ".imdb <title>",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  if (!q) return reply("Provide a movie or series name.");
  try {
    const { data } = await axios.get(`http://www.omdbapi.com/?apikey=742b2d09&t=${q}&plot=full`);
    if (data.Response === "False") throw new Error();
    const imdbText = `🎬 *IMDB SEARCH*\n\n`
      + `*Title:* ${data.Title}\n*Year:* ${data.Year}\n*Rated:* ${data.Rated}\n`
      + `*Released:* ${data.Released}\n*Runtime:* ${data.Runtime}\n*Genre:* ${data.Genre}\n`
      + `*Director:* ${data.Director}\n*Actors:* ${data.Actors}\n*Plot:* ${data.Plot}\n`
      + `*IMDB Rating:* ${data.imdbRating} ⭐\n*Votes:* ${data.imdbVotes}`;
    await conn.sendMessage(from, { image: { url: data.Poster }, caption: imdbText }, { quoted: mek });
  } catch {
    reply("❌ Unable to fetch IMDb data.");
  }
});

// ============================================================
//  AI COMMANDS (wrappers for external AI functions)
// ============================================================

const aiCommands = [
  { pattern: "venice", alias: ["vai"], handler: veniceAICommand },
  { pattern: "mistral", handler: mistralAICommand },
  { pattern: "perplexity", handler: perplexityAICommand },
  { pattern: "bard", handler: bardAICommand },
  { pattern: "gpt4nano", alias: ["gpt41nano"], handler: gpt4NanoAICommand },
  { pattern: "nemesisai", handler: kelvinAICommand },
  { pattern: "claude", handler: claudeAICommand }
];

for (const cmdDef of aiCommands) {
  cmd({
    pattern: cmdDef.pattern,
    react: "🌋",
    alias: cmdDef.alias || [],
    desc: `Ask ${cmdDef.pattern} AI`,
    category: "ai",
    use: `.${cmdDef.pattern} <question>`,
    filename: __filename
  }, async (conn, mek, m, { from, q, reply }) => {
    if (!q) return reply(`Please provide a question.\nExample: .${cmdDef.pattern} What is AI?`);
    await conn.sendMessage(from, { react: { text: "🌋", key: mek.key } });
    try {
      await cmdDef.handler(conn, from, q, mek); // each AI function expects (conn, chatId, query, message)
    } catch (e) {
      console.error(`${cmdDef.pattern} error:`, e);
      reply(`❌ ${cmdDef.pattern} failed.`);
    }
  });
}

// ============================================================
//  SMARTPHONE SEARCH (GSMArena)
// ============================================================

cmd({
  pattern: "smartphone",
  react: "🌋",
  alias: ["gsmarena"],
  desc: "Search smartphones on GSMArena",
  category: "search",
  use: ".smartphone <query>",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  if (!q) return reply("*Please provide a query to search for smartphones.*");
  try {
    const apiUrl = `${global.siputzx || 'https://api.siputzx.my.id'}/api/s/gsmarena?query=${encodeURIComponent(q)}`;
    const response = await fetch(apiUrl);
    const result = await response.json();
    if (!result.status || !result.data || result.data.length === 0) {
      return reply("*No results found. Please try another query.*");
    }
    const limitedResults = result.data.slice(0, 10);
    let responseMessage = `*Top 10 Results for "${q}":*\n\n`;
    for (let item of limitedResults) {
      responseMessage += `📱 *Name:* ${item.name}\n`;
      responseMessage += `📝 *Description:* ${item.description}\n`;
      responseMessage += `🌐 [View Image](${item.thumbnail})\n\n`;
    }
    reply(responseMessage);
  } catch (error) {
    console.error('Error fetching GSMArena:', error);
    reply(mess.error || "Error fetching data.");
  }
});

// ============================================================
//  GET DEVICE (from message ID)
// ============================================================

cmd({
  pattern: "getdevice",
  react: "🌋",
  desc: "Get device from a quoted message",
  category: "utility",
  use: ".getdevice (reply to a message)",
  filename: __filename
}, async (conn, mek, m, { from, quoted, reply }) => {
  if (!quoted) return reply('*Please quote a message to use this command!*');
  try {
    const quotedMsg = await m.getQuotedMessage(); // ensure this method exists
    if (!quotedMsg) return reply('*Could not detect, please try with newly sent message!*');
    const messageId = quotedMsg.key.id;
    const device = getDevice(messageId) || 'Unknown'; // getDevice() must be defined
    reply(`The message is sent from *${device}* device.`);
  } catch (err) {
    console.error('Error determining device:', err);
    reply('Error determining device: ' + err.message);
  }
});

// ============================================================
//  BROWSE URL
// ============================================================

cmd({
  pattern: "browse",
  react: "🌋",
  desc: "Fetch content from a URL (JSON or text)",
  category: "utility",
  use: ".browse <url>",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  if (!q) return reply("Enter URL");
  try {
    const res = await fetch(q);
    if (res.headers.get('Content-Type').includes('application/json')) {
      const json = await res.json();
      await conn.sendMessage(from, { text: JSON.stringify(json, null, 2) }, { quoted: mek });
    } else {
      const resText = await res.text();
      await conn.sendMessage(from, { text: resText }, { quoted: mek });
    }
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
  } catch (error) {
    reply(`Error fetching URL: ${error.message}`);
  }
});

// ============================================================
//  FILTER VCF
// ============================================================

cmd({
  pattern: "filtervcf",
  react: "🌋",
  desc: "Filter VCF file to keep only WhatsApp contacts",
  category: "utility",
  use: ".filtervcf (reply to .vcf file)",
  filename: __filename
}, async (conn, mek, m, { from, quoted, reply }) => {
  if (!quoted) return reply("❌ Reply to a `.vcf` file.");
  const mime = quoted.mimetype || "";
  if (!(mime === "text/vcard" || mime === "text/x-vcard")) {
    return reply("❌ Please reply to a VCF file.");
  }
  try {
    const media = await quoted.download();
    const vcfContent = media.toString('utf8');
    await conn.sendMessage(from, { text: "🔍 Filtering VCF - checking WhatsApp numbers, this may take a while..." }, { quoted: mek });

    const vCards = vcfContent.split('END:VCARD')
      .map(card => card.trim())
      .filter(card => card.length > 0);

    const validContacts = [];
    const invalidContacts = [];
    for (const card of vCards) {
      try {
        const telMatch = card.match(/TEL[^:]*:([^\n]+)/);
        if (!telMatch) continue;
        const phoneRaw = telMatch[1].trim();
        const phoneNumber = phoneRaw.replace(/\D/g, '');
        if (!phoneNumber) continue;
        const jid = `${phoneNumber}@s.whatsapp.net`;
        const result = await conn.onWhatsApp(jid);
        if (result.length > 0 && result[0].exists) {
          validContacts.push(card);
        } else {
          invalidContacts.push(phoneNumber);
        }
      } catch (e) { /* ignore */ }
    }

    const filteredVcf = validContacts.join('\nEND:VCARD\n') + (validContacts.length > 0 ? '\nEND:VCARD' : '');
    const resultMessage = `✅ *VCF Filtering Complete*\n\n` +
      `• Total contacts: ${vCards.length}\n` +
      `• Valid WhatsApp contacts: ${validContacts.length}\n` +
      `• Non-WhatsApp numbers removed: ${invalidContacts.length}\n\n` +
      `Sending filtered VCF file...`;
    await conn.sendMessage(from, { text: resultMessage }, { quoted: mek });
    await conn.sendMessage(from, {
      document: Buffer.from(filteredVcf),
      mimetype: "text/x-vcard",
      fileName: "filtered_contacts.vcf"
    });
  } catch (error) {
    reply(`❌ Error: ${error.message}`);
  }
});

// ============================================================
//  SHAZAM (music recognition)
// ============================================================

cmd({
  pattern: "shazam",
  react: "🌋",
  desc: "Identify music from audio/video",
  category: "media",
  use: ".shazam (reply to audio/video)",
  filename: __filename
}, async (conn, mek, m, { from, quoted, reply }) => {
  if (!quoted) return reply("Reply to an audio or video to identify music.");
  const mime = quoted.mimetype || "";
  if (!/audio|video/.test(mime)) return reply("Reply to an audio or video.");
  try {
    const media = await quoted.download();
    const filePath = `./tmp/${m.sender}.${mime.split('/')[1]}`;
    fs.writeFileSync(filePath, media);
    const res = await acr.identify(fs.readFileSync(filePath)); // acr must be configured
    if (res.status.code != 0) throw new Error(res.status.msg);
    if (!res.metadata?.music || res.metadata.music.length === 0) {
      return reply("No music identified in this audio/video.");
    }
    const { title, artists, album, release_date } = res.metadata.music[0];
    const resultText = `  *Music Identified!*\n\n*Title:* ${title}\n*Artist(s):* ${artists.map(v => v.name).join(', ')}\n*Album:* ${album?.name || 'Unknown'}\n*Release Date:* ${release_date || 'Unknown'}`;
    reply(resultText);
  } catch (error) {
    console.error(error);
    reply("Error identifying music: " + error.message);
  } finally {
    // clean up temp file
    try { fs.unlinkSync(filePath); } catch (e) {}
  }
});

// ============================================================
//  TTS (Text-to-Speech)
// ============================================================

cmd({
  pattern: "tts",
  react: "🌋",
  desc: "Convert text to Hindi speech",
  category: "utility",
  use: ".tts <text>",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  if (!q) return reply("Need some text.");
  try {
    const url = googleTTS.getAudioUrl(q, {
      lang: 'hi-IN',
      slow: false,
      host: 'https://translate.google.com',
    });
    await conn.sendMessage(from, { audio: { url }, mimetype: 'audio/mpeg', ptt: true }, { quoted: mek });
  } catch (a) {
    reply(`${a}`);
  }
});

// ============================================================
//  AI (generic GPT)
// ============================================================

cmd({
  pattern: "ask",
  react: "📡",
  alias: ["chat", "ai"],
  desc: "Ask nemesis AI a question",
  category: "ai",
  use: ".ask <question>",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  if (!q) return reply("Please provide a message for the AI.\nExample: `.ask what is going on`");
  await conn.sendMessage(from, { react: { text: "📡", key: mek.key } });
  try {
    const apiUrl = `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);
    if (!data || !data.message) return reply("nemesis failed to respond. Please try again later.");
    reply(`🤖 *nemesis Response:*\n\n${data.message}`);
  } catch (e) {
    console.error("Error in AI command:", e);
    reply("An error occurred while communicating with the AI.");
  }
});

// ============================================================
//  JOKE
// ============================================================

cmd({
  pattern: "joke",
  react: "🌋",
  desc: "Get a random joke",
  category: "fun",
  filename: __filename
}, async (conn, mek, m, { reply }) => {
  try {
    const { data } = await axios.get("https://v2.jokeapi.dev/joke/Any?type=single");
    if (!data || !data.joke) return reply("❌ Couldn't fetch a joke!");
    reply(`😂 *Here's a joke for you:*\n\n${data.joke}`);
  } catch (e) {
    console.error("Joke Command Error:", e);
    reply("❌ Error fetching joke.");
  }
});

// ============================================================
//  MSG (spam) – owner only
// ============================================================

cmd({
  pattern: "msg",
  react: "🌋",
  desc: "Send repeated messages (owner only)",
  category: "owner",
  use: ".msg text,count",
  filename: __filename
}, async (conn, mek, m, { from, q, reply, isCreator }) => {
  if (!isCreator) return reply("Only bot owner can use this.");
  try {
    if (!q.includes(',')) return reply("❌ *Format:* .msg text,count\n*Example:* .msg Hello,5");
    const [rawMessage, countStr] = q.split(',');
    const message = rawMessage.trim();
    const count = parseInt(countStr.trim());
    if (isNaN(count) || count < 1 || count > 500) {
      return reply("❌ *Max 500 messages at once!*");
    }
    const zws = '\u200B';
    for (let i = 0; i < count; i++) {
      const hiddenMsg = message + zws.repeat(i);
      await conn.sendMessage(from, { text: hiddenMsg }, { quoted: null });
      if (i < count - 1) await new Promise(res => setTimeout(res, 1000));
    }
  } catch (e) {
    console.error("Error in msg command:", e);
    reply(`❌ *Error:* ${e.message}`);
  }
});

// ============================================================
//  TIKTOK STALK
// ============================================================

cmd({
  pattern: "ttstalk",
  react: "🌋",
  desc: "Get TikTok profile info",
  category: "stalk",
  use: ".ttstalk <username>",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  if (!q) return reply("❎ Please provide a TikTok username.\n\n*Example:* .ttstalk mrbeast");
  try {
    const apiUrl = `https://api.siputzx.my.id/api/stalk/tiktok?username=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);
    if (!data.status) return reply("❌ User not found.");
    const user = data.data.user;
    const stats = data.data.stats;
    const profileInfo = `
╭──⧼♛ *NEMESIS MD TT  STALKER* ♛⧽──≽
│┃ ♛ 
│┃ ♛ 👤 *Username:* @${user.uniqueId}
│┃ ♛ 📛 *Nickname:* ${user.nickname}
│┃ ♛ ✅ *Verified:* ${user.verified ? "Yes ✅" : "No ❌"}
│┃ ♛ 📍 *Region:* ${user.region}
│┃ ♛ 📝 *Bio:* ${user.signature || "No bio available."}
│┃ ♛ 🔗 *Bio Link:* ${user.bioLink?.link || "No link available."}
│┃ ♛ 
│┃ ♛ 📊 *Statistics:*
│┃ ♛ 👥 *Followers:* ${stats.followerCount.toLocaleString()}
│┃ ♛ 👤 *Following:* ${stats.followingCount.toLocaleString()}
│┃ ♛ ❤️ *Likes:* ${stats.heartCount.toLocaleString()}
│┃ ♛ 🎥 *Videos:* ${stats.videoCount.toLocaleString()}
│┃ ♛ 
│┃ ♛ 📅 *Account Created:* ${new Date(user.createTime * 1000).toLocaleDateString()}
│┃ ♛ 🔒 *Private Account:* ${user.privateAccount ? "Yes 🔒" : "No 🌍"}
│┃ ♛ 
╰────Rɪᴅᴢ Cᴏᴅᴇʀ❦─────≽
ᴘᴏᴡᴇʀᴇᴅ ʙʏ Rɪᴅᴢ Cᴏᴅᴇʀ x Kᴇᴠɪɴ ᴛᴇᴄʜ
`;
    await conn.sendMessage(from, { image: { url: user.avatarLarger }, caption: profileInfo }, { quoted: mek });
  } catch (error) {
    console.error("TT Stalk error:", error);
    reply("⚠️ An error occurred while fetching TikTok profile data.");
  }
});

// ============================================================
//  PICKUP LINES
// ============================================================

cmd({
  pattern: "lines",
  react: "🌋",
  desc: "Get a random pickup line",
  category: "fun",
  filename: __filename
}, async (conn, mek, m, { reply }) => {
  try {
    const { data } = await axios.get('https://apis.davidcyriltech.my.id/pickupline');
    if (!data.success) return reply("❌ Failed to get a pickup line.");
    reply(`💝 *Pickup Line* 💝\n\n"${data.pickupline}"\n\n_Use wisely!_`);
  } catch (error) {
    console.error('Pickup Error:', error);
    reply("❌ My charm isn't working right now. Try again later!");
  }
});

// ============================================================
//  NEWS (top headlines)
// ============================================================

cmd({
  pattern: "news",
  react: "🌋",
  desc: "Get top US news headlines",
  category: "info",
  filename: __filename
}, async (conn, mek, m, { reply }) => {
  try {
    const apiKey = 'dcd720a6f1914e2d9dba9790c188c08c';
    const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`);
    const articles = response.data.articles.slice(0, 5);
    let newsMessage = '📰 *Latest News*:\n\n';
    articles.forEach((article, index) => {
      newsMessage += `${index + 1}. *${article.title}*\n${article.description}\n\n`;
    });
    reply(newsMessage);
  } catch (error) {
    console.error('Error fetching news:', error);
    reply('Sorry, I could not fetch news right now.');
  }
});