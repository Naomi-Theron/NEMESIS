const { cmd } = require('../lib/command');
const axios = require('axios');
const fs = require('fs');
const { yts } = require('yt-search');
const { ImageUploadService } = require('node-upload-images');
const { pinterest, pinterest2, remini, mediafire, tiktokDl } = require('../lib/scraper');
// These helpers must be defined in your environment:
//  - generateProfilePicture (for setppbot long mode)
//  - tiktokDl (for TikTok download)
//  - prepareWAMessageMedia, generateWAMessageFromContent, proto (for TikTok carousel)
//  - global variables: botNumber, mess, example, etc.

// ============================================================
//  GET PROFILE PICTURE (owner only)
// ============================================================
cmd({
  pattern: "getpp",
  react: "🌋",
  desc: "Get profile picture of a user (owner only)",
  category: "owner",
  use: ".getpp [@tag or number or reply]",
  filename: __filename
}, async (conn, mek, m, { from, q, quoted, reply, isCreator }) => {
  if (!isCreator) return reply("❌ This command is only available for the owner!");

  let userToAnalyze;
  if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
    userToAnalyze = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
  } else if (m.message?.extendedTextMessage?.contextInfo?.participant) {
    userToAnalyze = m.message.extendedTextMessage.contextInfo.participant;
  } else if (q) {
    const number = q.replace(/[^0-9]/g, "");
    userToAnalyze = number + "@s.whatsapp.net";
  } else {
    userToAnalyze = m.sender;
  }

  let profilePic;
  try {
    profilePic = await conn.profilePictureUrl(userToAnalyze, "image");
  } catch {
    profilePic = "https://files.catbox.moe/qhl7st.png";
  }

  await conn.sendMessage(from, {
    image: { url: profilePic },
    caption: `Profile picture of @${userToAnalyze.split("@")[0]}`,
    mentions: [userToAnalyze]
  }, { quoted: mek });
});

// ============================================================
//  SET BOT PROFILE PICTURE (owner only)
// ============================================================
cmd({
  pattern: "setppbot",
  react: "🌋",
  desc: "Set bot profile picture (owner only)",
  category: "owner",
  use: ".setppbot [long] (reply to an image)",
  filename: __filename
}, async (conn, mek, m, { from, quoted, args, reply, isCreator }) => {
  if (!isCreator) return reply("Only the bot owner can use this.");
  const qmsg = quoted || mek;
  const mime = (qmsg.msg || qmsg).mimetype || "";
  if (!/image/g.test(mime)) return reply("Reply to an image with .setppbot");

  const media = await conn.downloadAndSaveMediaMessage(qmsg);
  const botNumber = conn.user.jid; // adjust if needed

  try {
    if (args[0] && args[0] === "long") {
      const { img } = await generateProfilePicture(media); // must be defined
      await conn.query({
        tag: 'iq',
        attrs: {
          to: botNumber,
          type: 'set',
          xmlns: 'w:profile:picture'
        },
        content: [
          {
            tag: 'picture',
            attrs: { type: 'image' },
            content: img
          }
        ]
      });
      await fs.unlinkSync(media);
      reply("DP SET SUCCESSFULLY ✅");
    } else {
      await conn.updateProfilePicture(botNumber, { content: media });
      await fs.unlinkSync(media);
      reply("Profile picture updated ✅");
    }
  } catch (err) {
    console.error("setppbot error:", err);
    reply("Failed to set profile picture.");
  }
});

// ============================================================
//  TOURL – upload image to get direct link
// ============================================================
cmd({
  pattern: "tourl",
  react: "🌋",
  desc: "Upload an image and get its direct URL",
  category: "utility",
  use: ".tourl (reply to an image)",
  filename: __filename
}, async (conn, mek, m, { from, quoted, reply }) => {
  const qmsg = quoted || mek;
  const mime = (qmsg.msg || qmsg).mimetype || "";
  if (!/image/.test(mime)) return reply("Reply to an image with .tourl");

  const media = await conn.downloadAndSaveMediaMessage(qmsg);
  const service = new ImageUploadService('pixhost.to');
  const { directLink } = await service.uploadFromBinary(fs.readFileSync(media), 'media.png');
  await conn.sendMessage(from, { text: directLink }, { quoted: mek });
  fs.unlinkSync(media);
});

// ============================================================
//  PLAY2 – YouTube audio download (alternative)
// ============================================================
cmd({
  pattern: "play2",
  react: "🌋",
  desc: "Download audio from YouTube (alternative)",
  category: "download",
  use: ".play2 <song name>",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  if (!q) return reply("❌ Please provide a song name!\nExample: `.play2 Lilly Alan Walker`");

  try {
    await conn.sendMessage(from, { react: { text: "🌋", key: mek.key } });
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
    console.error('Error in play2 command:', error);
    await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    reply("❌ Download failed. Please try again later.");
  }
});

// ============================================================
//  YTMP4 – YouTube video download (via URL)
// ============================================================
cmd({
  pattern: "ytmp4",
  react: "🕖",
  desc: "Download YouTube video as MP4 using URL",
  category: "download",
  use: ".ytmp4 <youtube-url>",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  if (!q) return reply("Example: .ytmp4 https://youtube.com/watch?v=...");
  if (!q.startsWith("https://")) return reply("Invalid YouTube link");

  await conn.sendMessage(from, { react: { text: "🕖", key: mek.key } });
  try {
    const videoUrl = q.split("&")[0];
    const apiUrl = `https://yt-dl.officialhectormanuel.workers.dev/?url=${encodeURIComponent(videoUrl)}`;
    const res = await axios.get(apiUrl).catch(() => null);

    if (!res || !res.data?.status || !res.data.video) {
      await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
      return reply("Download failed");
    }

    const data = res.data;
    await conn.sendMessage(from, {
      video: { url: data.video },
      mimetype: "video/mp4",
      fileName: `${data.title || "video"}.mp4`,
      caption: `🎬 ${data.title || "Video"}`
    }, { quoted: mek });

    await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
  } catch (e) {
    console.log(e);
    await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    reply("API error");
  }
});

// ============================================================
//  VIDEO – YouTube video download by search
// ============================================================
cmd({
  pattern: "video",
  react: "🔎",
  desc: "Search and download YouTube video by title",
  category: "download",
  use: ".video <search term>",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  if (!q) return reply("Example: .video faded alan walker");

  await conn.sendMessage(from, { react: { text: "🔎", key: mek.key } });
  const search = await yts(q);
  const video = search.videos[0];
  if (!video) return reply("No result found");

  try {
    await conn.sendMessage(from, {
      image: { url: video.thumbnail },
      caption: `🎬 *${video.title}*\n\n⬇️ Downloading video...`
    }, { quoted: mek });

    const apiUrl = `https://yt-dl.officialhectormanuel.workers.dev/?url=${encodeURIComponent(video.url)}`;
    const res = await axios.get(apiUrl).catch(() => null);

    if (!res || !res.data?.status || !res.data.video) {
      await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
      return reply("Download failed");
    }

    const data = res.data;
    await conn.sendMessage(from, {
      video: { url: data.video },
      mimetype: "video/mp4",
      fileName: `${data.title || video.title}.mp4`,
      caption: `🎬 ${data.title || video.title}`
    }, { quoted: mek });

    await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
  } catch (e) {
    console.log(e);
    await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    reply("API error");
  }
});

// ============================================================
//  TIKTOK / TT – download TikTok (no watermark)
// ============================================================
cmd({
  pattern: "tt",
  react: "🕖",
  alias: ["tiktok"],
  desc: "Download TikTok video (no watermark)",
  category: "download",
  use: ".tt <tiktok-url>",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  if (!q) return reply("Provide a TikTok URL");
  if (!q.startsWith("https://")) return reply("Invalid TikTok URL");

  await conn.sendMessage(from, { react: { text: "🕖", key: mek.key } });

  try {
    const result = await tiktokDl(q); // must be defined
    if (!result.status) return reply("Error!");

    if (result.durations == 0 && result.duration == "0 Seconds") {
      // Multiple images (carousel)
      let cards = [];
      let urutan = 0;
      for (let a of result.data) {
        const imgsc = await prepareWAMessageMedia(
          { image: { url: a.url } },
          { upload: conn.waUploadToServer }
        );
        cards.push({
          header: proto.Message.InteractiveMessage.Header.fromObject({
            title: `𝙿𝚑𝚘𝚝𝚘 *${urutan += 1}*`,
            hasMediaAttachment: true,
            ...imgsc
          }),
          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
            buttons: [{
              name: "cta_url",
              buttonParamsJson: `{"display_text":"Photo Link","url":"${a.url}","merchant_url":"https://www.google.com"}`
            }]
          })
        });
      }

      const msgii = await generateWAMessageFromContent(
        m.chat,
        {
          viewOnceMessageV2Extension: {
            message: {
              messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2
              },
              interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                body: proto.Message.InteractiveMessage.Body.fromObject({
                  text: "*𝚈𝚘𝚞𝚛 𝚗𝚘 𝚠𝚊𝚝𝚎𝚛𝚖𝚊𝚛𝚔 𝚟𝚒𝚍𝚎𝚘 ✅*"
                }),
                carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                  cards: cards
                })
              })
            }
          }
        },
        { userJid: m.sender, quoted: mek }
      );
      await conn.relayMessage(m.chat, msgii.message, { messageId: msgii.key.id });
    } else {
      // Single video
      const urlVid = result.data.find(e => e.type == "nowatermark_hd" || e.type == "nowatermark");
      await conn.sendMessage(from, {
        video: { url: urlVid.url },
        mimetype: 'video/mp4',
        caption: `*𝚃𝙸𝙺𝚃𝙾𝙺 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁 ✅*`
      }, { quoted: mek });
    }
  } catch (e) {
    console.error(e);
    await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    reply("Error downloading TikTok.");
  }
});
