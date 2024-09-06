const {translate} =  require('../src/translation.js');
const { Client, Location, List, Buttons, Poll, LocalAuth,MessageMedia } = require('whatsapp-web.js');

const fs = require('fs');
module.exports = async function (msg, con, set, client) {
    if(!msg.isChatAdmin && msg.chat.isGroup) return;
    con.query("SELECT * FROM chatbots WHERE bot = 'WDH'", [], async function (err, chatsResult) {
        if (err) {
        } else {
            var lim = 0;
            var groups = [];
            for(let waChat of chatsResult) {
                if(lim >= 11) break;
                else {
                    try {
                        const chat = await client.getChatById(waChat.chatId);
                        if(chat.name == undefined) continue;
                        else groups.push(chat.name);
                        lim++;
                    } catch(Exception) {
                        console.log(Exception);
                    }
                }
            }
            groups.push("Next >");
            console.log(groups);
            await msg.reply(new Poll('[Campaign] Quel groupe ?', groups));
        }
    });
    
    
}