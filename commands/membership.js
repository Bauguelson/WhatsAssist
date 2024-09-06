const {translate} =  require('../src/translation.js');
module.exports = async function (msg, con) {
    if(!msg.isChatAdmin) return;
    const group = await msg.getChat();
    const pending = await group.getGroupMembershipRequests()
    console.log("Memberships: ");
    console.log(pending);
}
