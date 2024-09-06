const {translate} =  require('../src/translation.js');
module.exports = async function (msg, con, set) {
    if(!msg.isChatAdmin) return;
    var toBan = msg.body.substring(5).trim().split(" ");
    var sql = "DELETE FROM scammers WHERE ";
    var deletesql = "";
    var numbers = [];
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
        } 
    } else {
        const matchedNumbers = msg.body.match(/\+\D*\d[\d\-\s]{8,}/g);
        if (matchedNumbers) {
            numbers = matchedNumbers.map(number => number.replace(/\D+/g, '').replace('+', ''));
        }

    }

    if(numbers.length > 0) {
        deletesql = (new Array(numbers.length + 1).join("`phone_number` = ? OR "));
        sql += deletesql.substr(0, deletesql.length-3);
        console.log(sql);
        console.log(numbers);
        con.query(sql, numbers, async function (err, result) {
            if (err) {
                console.log(err);
                msg.reply(translate(`An error has occured`, [], set.language) );
            } else {
                msg.react('✅');
            }
        });
    } else {
        msg.reply(`Qui ?`,msg.id.remote);
    }
}



