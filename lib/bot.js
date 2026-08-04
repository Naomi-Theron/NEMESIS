const fs = require('fs');
if (fs.existsSync('bot.env')) require('dotenv').config({ path: './bot.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
BOT_URL: process.env.BOT_URL || "https://raw.githubusercontent.com/ArslanMDofficial/ARSLAN-MD-DATA/refs/heads/main/datafile.json",
AUTO_SITE: process.env.AUTO_SITE || "https://arslan-apis.vercel.app",
BAND_URL: process.env.BAND_URL || "https://raw.githubusercontent.com/ArslanMDofficial/ARSLAN-MD-DATA/refs/heads/main/bandusers.json",
REPO_LINK: process.env.REPO_LINK || "https://github.com/ridzcoder/NEMESIS-MD",
REPO_NAME: process.env.REPO_NAME || "NEMESIS-MD",
BOT_NAME: process.env.BOT_NAME || "NEMESIS-MD",
DESCRIPTION: process.env.DESCRIPTION || "NEMESIS MD UGANDA POWERFULL WHATSAPP BOT",
OWNER_NUMBER: process.env.OWNER_NUMBER || "237678687593",
OWNER_NAME: process.env.OWNER_NAME || "Ridzcoder",
ST_SAVE: process.env.ST_SAVE || "NEMESIS-MD-STATUS-SERVER",
BIO_TEXT: process.env.BIO_TEXT || "NEMESIS-MD-BY-RIDZ-CODER",
AUTO_STATUS_MSG: process.env.AUTO_STATUS_MSG || "*`STATUS SEEN BY NEMESIS-MD`* _*POWERD BY*_ *Ridz Coder 😔 Whtsapp Bot*",
FOOTER: process.env.FOOTER || "NEMESIS-MD",
COPYRIGHT: process.env.COPYRIGHT || " > ㋛ NEMESIS-MD BY RIDZ CODER",
VERSION: process.env.VERSION || "3.0.0",
NEWSLETTER: process.env.NEWSLETTER || "120363404529319592@newsletter",
WA_CHANNEL: process.env.WA_CHANNEL || "https://whatsapp.com/channel/0029Vb73EYZFXUujAoHFor1i",
INSTA: process.env.INSTA || "https://Instagram.com/Ridzcoder",
ALIVE_IMG: process.env.ALIVE_IMG || "https://files.catbox.moe/dynze8.png",
OWNER_IMG: process.env.OWNER_IMG || "https://files.catbox.moe/dynze8.png",
CONVERT_IMG: process.env.CONVERT_IMG || "https://files.catbox.moe/dynze8.png",
AI_IMG: process.env.AI_IMG || "https://files.catbox.moe/dynze8.png",
SEARCH_IMG: process.env.SEARCH_IMG || "https://files.catbox.moe/dynze8.png",
DOWNLOAD_IMG: process.env.DOWNLOAD_IMG || "https://files.catbox.moe/dynze8.png",
MAIN_IMG: process.env.MAIN_IMG || "https://files.catbox.moe/dynze8.png",
GROUP_IMG: process.env.GROUP_IMG || "https://files.catbox.moe/dynze8.png",
FUN_IMG: process.env.FUN_IMG || "https://files.catbox.moe/dynze8.png",
TOOLS_IMG: process.env.TOOLS_IMG || "https://files.catbox.moe/dynze8.png",
OTHER_IMG: process.env.OTHER_IMG || "https://files.catbox.moe/dynze8.png",
MOVIE_IMG: process.env.MOVIE_IMG || "https://files.catbox.moe/dynze8.png",
NEWS_IMG: process.env.NEWS_IMG || "https://files.catbox.moe/dynze8.png",
PP_IMG: process.env.PP_IMG || "https://files.catbox.moe/dynze8.png"
};
