const {translate} =  require('../src/translation.js');
module.exports = async function (msg, con, set) {
    console.log(set);
    if(!msg.isChatAdmin) return;
    var numbers = [];
    var args = msg.body.trim().split(" ");
    if(args[1] == "set") {
        var sql = "INSERT IGNORE INTO admins VALUES ";
        inserts = (new Array(numbers.length + 1).join("(NULL, ?, 'modo'), "));
        sql += inserts.substr(0, inserts.length-2);
    }
    if(args[2] == "remove") {
        var sql = "DELETE FROM admins WHERE ";
        inserts = (new Array(numbers.length + 1).join(" OR phone = ?"));
        sql += inserts.substr(4);
    }
    if(msg.mentionedIds.length > 0) {
        msg.mentionedIds.forEach((number) => {
            numbers.push(number.split("@")[0]);
        });

        con.query(sql, numbers, function (err, result) {
            if (err) {
                msg.reply(translate(`An error has occured`, [], set.language) );
            } else {
                msg.react('✅');
                for(let participant of msg.chat.participants) {
                    if(participant != undefined && numbers.includes(participant.id.user.split("@"))[0]) {
                        msg.chat.removeParticipants([participant.id.user]);
                    }
                }
            }
        });

        cmd = msg.body.substring(8);
}
    }