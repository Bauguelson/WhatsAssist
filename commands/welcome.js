const {translate} =  require('../src/translation.js'); // DEPRECATED, MAY CAUSE BAN
module.exports = async function (msg, con, set) {
    return;
    const restOfTheString =  msg.body.substring(8);
    if(restOfTheString == "") {
        var sql = "DELETE FROM welcomes WHERE chatId = ?;";
        con.query(sql, [msg.id.remote], function (err, result) {
            if (err) {
                console.log(err);
                msg.reply(translate(`An error has occured`, [], set.language) );
            } else { 
                msg.react('✅');
            }
        });
    } else {
        var sql = "INSERT INTO welcomes (chatId, type, message) VALUES (?,?,?) ON DUPLICATE KEY UPDATE message = ?;";
        con.query(sql, [msg.id.remote, 1, restOfTheString, restOfTheString], function (err, result) {
            if (err) {
                console.log(err);
                msg.reply(translate(`An error has occured`, [], set.language));
            } else {
                msg.react('✅');
            }
        });
    }
}
