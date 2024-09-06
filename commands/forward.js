const {translate} =  require('../src/translation.js');
module.exports = async function (msg, con, set) {
    if(!msg.isChatAdmin) return;
        // 1. By default the message will be forwarded with a caption (if provided):
    await msg.forward(msg.author);

    // 2. To forward without a caption text, use { withCaption: false }:
    await msg.forward(msg.author, { withCaption: false });

    // 3. To forward without a 'Forwarded' title, use { displayAsForwarded: false }:
    await msg.forward(msg.author, { displayAsForwarded: false });
    return;
}