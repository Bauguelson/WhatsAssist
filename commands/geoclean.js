const {translate} =  require('../src/translation.js');

const { parse, format } = require('libphonenumber-js')
module.exports = async function (msg, con, set) {
    if(!msg.isChatAdmin) return;
    var bans = [];
    if (msg.chat.isGroup) {
        for(let participant of msg.chat.participants) {
            var checkPhone = await parse("+"+participant.id.user);
            console.log(checkPhone);
            con.query("SELECT COUNT(*) as count, ban, approve FROM geosettings WHERE `chatId` = '"+msg.id.remote+"' AND (country = ? OR country = '*')", [checkPhone.country], async (err, result) =>  {
                if (err) throw err;
                else {
                    console.log(result);
                    const count = result[0].count;
                    const autoban = result[0].ban;
                    const autoapp = result[0].approve;
                    if (count > 0 && autoban == 1) {
                        await msg.chat.removeParticipants([participant.id.user+"@"+participant.id.server]);
                    }
                }
            });
        }
        return true;
    }
    return false;
    
}