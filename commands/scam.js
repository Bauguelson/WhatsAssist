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
        inserts = (new Array(numbers.length + 1).join("(NULL, ?, NOW(), 'N/A', '"+msg.id.remote+"'), "));
        sql += inserts.substr(0, inserts.length-2);
        console.log(sql);
        console.log(numbers);
        con.query(sql, numbers, async function (err, result) {
            if (err) {
                console.log(err);
                msg.reply(translate(`An error has occured`, [], set.language) );
            } else {
                onumbers.forEach(async (value, index) => {
                    await msg.chat.removeParticipants([value]);
                })
                msg.react('✅');
            }
        });
    } else {
        msg.reply(`Qui ?`,msg.id.remote);
    }
    
}
