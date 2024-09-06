// Set user delay to answer
const fs = require('fs');
const {translate} =  require('../src/translation.js');
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
        var remindercfg = msg.body.substring(10);
        
        const [timeRec, id, ...rest] = remindercfg.split(" ");
        const message = rest.join(' ');

        if(timeRec == "off" && set.intervals[id] != undefined) {
            clearInterval(set.intervals[id]);
            msg.react('✅');
        } else {
            var expectedUnit = timeRec.substring(timeRec.length-1);
            var quantity = timeRec.substring(0, timeRec.length-1);
            if(expectedUnit in units) {
                quantity = quantity*units[expectedUnit].sec;
                if(set.intervals[id] != undefined) clearInterval(set.intervals[id]);
                set.intervals[id]  = setInterval(async function() {
                    await msg.chat.sendMessage(message);
                }, quantity*1000);
                msg.react('✅');
                
            }
        }
    }
    
}