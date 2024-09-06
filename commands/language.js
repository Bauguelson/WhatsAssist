const {translate} =  require('../src/translation.js');

module.exports = async function (msg, con,set) {
    if(!msg.isChatAdmin) return;
    var language = msg.body.substring(10, 12).toLowerCase();
    console.log(language)
    if(["fr","en","kr"].includes(language)) {
        set.language = language;
        msg.react('✅');
    }

}