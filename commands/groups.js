const {translate} =  require('../src/translation.js');


const { parse, format } = require('libphonenumber-js')
module.exports = async function (msg, con, set) {
    if(!msg.isChatAdmin) return;

    
    var groups = [];
    
    con.query("SELECT * FROM chatbots WHERE bot = 'WDH'", [], async function (err, chatsResult) {
        if (err) {
        } else {
            var t = "Test: ";
            const groupId = msg.chat.chatId ;
            await msg.chat.sendMessage(`Check the last message here: @${groupId}`, {
                groupMentions: { subject: 'GroupSubject', id: msg.chat.chatId }
            });
            /*await msg.chat.sendMessage(t, {
                groupMentions: groups
            });*/
        }

    });

}