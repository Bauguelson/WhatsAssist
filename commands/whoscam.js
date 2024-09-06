const {translate} =  require('../src/translation.js');
module.exports = async function (msg, con, set) {
    //if(!msg.isChatAdmin) return;
    con.query("SELECT * FROM scammers", [], async (err, result) =>  {
        if (err) throw err;
        else {
            if (msg.chat.isGroup) {
                const mentions = [];
                const ptcps = [];
                var message = '';
                for(let participant of msg.chat.participants) {
                    if(participant != undefined) ptcps.push(participant.id.user);
                }
                result.forEach((element, index) => {
                    if(ptcps.includes(element.phone_number)) {
                        mentions.push(element.phone_number+"@c.us");
                        message += `▶️ @`+ element.phone_number + (ptcps.includes(element.phone_number) ? '' : '') + "\n";
                        //msg.chat.removeParticipants([element.phone_number+"@c.us"]);
                    }
                });
                if(message != "") msg.reply (message);
                else msg.reply (translate("Clean of scammers.", [], set.language));
            }
        }
    });
}