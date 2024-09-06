const {translate} =  require('../src/translation.js');
module.exports = async function (msg, con) {
    if(!msg.isChatAdmin) return;
    cmd = msg.body.substring(6);
    if(cmd.trim() == "disable") {
        var sql = "INSERT INTO limits (chatId, name, value, participantId) VALUES (?,?,?,?);";
        con.query(sql, [msg.id.remote, 'links', 'no', '*'], function (err, result) {
            if (err) {
                console.log("Error: ",err);
                msg.reply(translate(`An error has occured`, [], set.language) );
            } else {
                msg.react('✅');
            }
        });
    } else if(cmd.trim() == "enable") {
        var sql = "DELETE FROM limits WHERE name = 'links' AND chatId = ?;";
        con.query(sql, [msg.id.remote], function (err, result) {
            if (err) {
                console.log("Error: ",err);
                msg.reply(translate(`An error has occured`, [], set.language) );
            } else {
                msg.react('✅');
            }
        });
    }
}