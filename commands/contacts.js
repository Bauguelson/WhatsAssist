const {translate} =  require('../src/translation.js');
const { Client, Location, List, Buttons, Poll, LocalAuth,MessageMedia } = require('whatsapp-web.js');

const fs = require('fs');
module.exports = async function (msg, con, set, client) {
    if(!msg.isChatAdmin && msg.chat.isGroup) return;
    if (msg.chat.isGroup) {
        const csvHeader = ['Serveur', "Utilisateur", 'Admin', "Propriétaire"];
        const currentDate = new Date();

        const day = currentDate.getDate();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        const formattedDate = `${day}_${month}_${year}`;
        const contactFileName = './src/data/'+msg.chat.name+"_"+msg.chat.participants.length+'_contacts_'+formattedDate+'.csv';
        var data = `${csvHeader.join(',')}\n`;
        for(let participant of msg.chat.participants) {
            data += `${participant.id.server},${participant.id.user},${participant.isAdmin},${participant.isSuperAdmin}\n`;
        }
        fs.writeFile(contactFileName, data, async(error) => {
            if (error) {
                msg.reply("Désolé, une erreur est survenu.");
                return false;
            } else {
                const media = await MessageMedia.fromFilePath(contactFileName);
                const sendMessageData = await client.sendMessage(msg.hasOwnProperty("author") ? msg.author : msg.from, media, {caption: "Contacts"}); 
                return contactFileName;
            }
        });
    } else {
        await  msg.react('✅');
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
                await msg.reply(new Poll('[contacts] Quel groupe ?', groups));
            }
        });
    }
    
}