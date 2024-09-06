const {translate} =  require('../src/translation.js');
module.exports = async function (msg, con) {
    if(!msg.isChatAdmin) return;
    con.query("SELECT COUNT(*) as count FROM admins WHERE phone = ?", [msg.id.participant.split("@")[0]], async (err, result) =>  {
        if (err) throw err;
        else {
            const count = result[0].count;
            if (count > 0) {
                var sql = "INSERT IGNORE INTO chatbots (chatId, bot, plan) VALUES (?,'WDH',1);";
                con.query(sql, [msg.id.remote], function (err, result) {
                    if (err) {
                        console.log("Error: ",err);
                        msg.reply(translate(`An error has occured`, [], set.language) );
                    } else {
                        console.log(msg.id.remote);
                       // allowedChats.push(msg.id.remote);
                        msg.react('✅');
                    }
                });
            } else {
               // const media = await MessageMedia.fromFilePath('img/optm.mp3');
               // await msg.reply(media, msg.id.remote, { sendAudioAsVoice: true});
            }
        }
    });
};