const {translate} =  require('../src/translation.js');
module.exports = async function (msg, con, set) {
    if(!msg.isChatAdmin) return;
    var toBan = msg.body.substring(5).trim().split(" ");
    var sql = "INSERT INTO scammers VALUES ";
    var inserts = "";
    var numbers = [];
    var onumbers = [];
    var qmsg = await msg.getQuotedMessage();
    if(qmsg != undefined) {
        if(qmsg.hasOwnProperty("vCards") && qmsg.vCards.length > 0) {
            qmsg.vCards.forEach((vCardData, key) => {
                const regex = /waid=(\d+):/g;
                const matches = [];
                let match;
                while ((match = regex.exec(vCardData)) !== null) {
                    numbers.push(match[1]);
                }
            });
        } else {
            const matchedNumbers = qmsg.body.match(/\+\D*\d[\d\-\s]{8,}/g);
            if (matchedNumbers) {
                numbers = matchedNumbers.map(number => number.replace(/\D+/g, '').replace('+', ''));
            }

        }

    } else if(msg.mentionedIds.length > 0) {
        msg.mentionedIds.forEach((number) => {

            numbers.push(number.split("@")[0]);
            onumbers.push(number);
        });
    } else {
        const matchedNumbers = msg.body.match(/\+\D*\d[\d\-\s]{8,}/g);
        if (matchedNumbers) {
            numbers = matchedNumbers.map(number => number.replace(/\D+/g, '').replace('+', ''));
        }
    }
    if(numbers.length > 0) {
        console.log(numbers);
        messages = await msg.chat.fetchMessages({
            limit:500
        });
        console.log(messages);
        for (const message of messages) {

            console.log(message);
            if(message != undefined && message.author != undefined && message.fromMe == false  && numbers.includes(message.author.split("@")[0])) {
                if(message.mediaKey == undefined) continue;
                console.log("ok from "+message.author.split("@")[0]);
                await message.delete(true);
                await new Promise(r => setTimeout(r, 5000));
            }

        }
    } else {
        msg.reply(`Qui ?`,msg.id.remote);
    }
    
}
