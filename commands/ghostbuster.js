// Set user delay to answer
const fs = require('fs');
const {translate} =  require('../src/translation.js');
const {updateChatConfiguration} =  require('../src/helpers.js');
module.exports = async function (msg, con, set) {
    //if(!msg.isChatAdmin) return;
    if (msg.chat.isGroup) {
        var units = {
            d: {
                sec: 86400,
                name: "day(s)"
            },
            h: {
                sec: 3600,
                name: "hour(s)"
            },
            m: {
                sec: 60,
                name: "minute(s)"
            },
        };
        var c;
        var timeBan = msg.body.trim().substring(13);
        //updateChatConfiguration(set);
        console.log(timeBan);
        if(timeBan == "off" && set.ghostInterval != undefined) {
            clearInterval(set.ghostInterval);
            msg.react('✅');
        } else {
            var expectedUnit = timeBan.substring(timeBan.length-1);
            timeBan = timeBan.substring(0, timeBan.length-1);
            var timeBanOriginalUnit = timeBan;
            if(expectedUnit in units) {
                timeBan = timeBan*units[expectedUnit].sec;
                var removableParticipants=[];
                for(let participant of msg.chat.participants) {
                    if(!participant.isAdmin && !participant.isSuperAdmin)
                        removableParticipants.push(participant.id._serialized);
                }
                if(set.ghostInterval != undefined) clearInterval(set.ghostInterval);
                set.ghostInterval = setInterval(function() {
                    con.query("SELECT *  FROM chatbot_participants WHERE chatId = ? AND last_activity < DATE_SUB(NOW(), INTERVAL ? SECOND);", [msg.from, timeBan], async (err, result) =>  {
                        if (err) throw err;
                        else {
                            result.forEach(async participant => {
                                try {
                                    if(removableParticipants.includes(participant.participantId))
                                        await msg.chat.removeParticipants([participant.participantId]);
                                } catch(error) {
                                    console.log(error);
                                }
                            });
                        }
                    });
                }, timeBan*1000);
                msg.react('✅');
                msg.chat.sendMessage(translate("Participants have a delay of %s to participate, or they will get expulsed", [ timeBanOriginalUnit+translate(units[expectedUnit].name, [  ], set.language)], set.language));
            }
        }
    }
    
}