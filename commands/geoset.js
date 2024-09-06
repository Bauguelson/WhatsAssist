const countryCodes = require('country-codes-list');
const countryEmoji = require('country-emoji');
const { translate } = require('../src/translation');
const myCountryCodesObject = countryCodes.customList('countryCode', '[{countryCode}] {countryNameEn}: +{countryCallingCode}');

function getFlagEmoji(countryCode) {
    const emoji = countryEmoji.flag(countryCode);
    if (emoji) {
        return emoji;
    } else {
        return 'N/A';
    }
}

function isCommand(message, command) {
    if(message == command || message.substring(0, command.length) == command) {
        return true;
    } else return false;
}
module.exports = async function (msg, con, set) {
    if(!msg.isChatAdmin) return;
    var cmd = msg.body.substring(7);
    if(cmd.trim() == "") {

       await  msg.react('✅');
        var sql = "SELECT * FROM geosettings WHERE chatId = ?";
        con.query(sql, [msg.id.remote], function (err, result) {
            var restricitons = "";
            result.forEach((element, index) => {
                if(element.ban == 1) {
                    restricitons += `❌ `+ getFlagEmoji(element.country) + element.country + "\n";
                } else if(element.approve == 1) {
                    restricitons += `✔️ `+ getFlagEmoji(element.country) + element.country + " \n";
                }
            });
            var cmds = "\nℹ️ Usage: /geoset [code] [action]";
            msg.reply(translate(`🌎 Geographic parameter%s:\n%s`, ["", (restricitons == "" ? translate("None",[],set.language): restricitons)],set.language)+cmds,msg.id.remote);
        });
    } else if(myCountryCodesObject.hasOwnProperty(cmd.substring(1, 3).toUpperCase())) {
        var shownCountry = cmd.substring(1, 3).toUpperCase();
        cmd = cmd.substring(4);
        if(isCommand(cmd,"ban")) {
            var sql = "INSERT INTO geosettings (chatId,country, ban, approve) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE ban = ?;";
            con.query(sql, [msg.id.remote, shownCountry, 1, 0, 1], function (err, result) {
                if (err) {
                    msg.reply(`Une erreur est survenu :/ `+msg.id.participant.split("@")[0]+` !`, { mentions: [msg.id.participant] });
                } else {
                    msg.react('✅');
                }
            });
        } else if(isCommand(cmd,"app") || isCommand(cmd,"approve")) {
            var sql = "INSERT INTO geosettings (chatId,country, ban, approve) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE approve = ?;";
            con.query(sql, [msg.id.remote, shownCountry, 0, 1, 1], function (err, result) {
                if (err) {
                    msg.reply(`Une erreur est survenu :/ `+msg.id.participant.split("@")[0]+` !`, { mentions: [msg.id.participant] });
                } else {
                     msg.react('✅');
                }
            });
        } else if(isCommand(cmd,"deban")) {
            var sql = "INSERT INTO geosettings (chatId,country, ban, approve) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE ban = ?;";
            con.query(sql, [msg.id.remote, shownCountry, 0, 0, 0], function (err, result) {
                if (err) {
                    msg.reply(`Une erreur est survenu :/ `+msg.id.participant.split("@")[0]+` !`, { mentions: [msg.id.participant] });
                } else {
                     msg.react('✅');
                }
            });
        } else if(isCommand(cmd,"unapp")) {
            var sql = "INSERT INTO geosettings (chatId, country, ban, approve) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE approve = ?;";
            con.query(sql, [msg.id.remote, shownCountry, 0, 0, 0], function (err, result) {
                if (err) {
                    msg.reply(`Une erreur est survenu :/ `+msg.id.participant.split("@")[0]+` !`, { mentions: [msg.id.participant] });
                } else {
                     msg.react('✅');
                }
            });
        } else {
            var sql = "SELECT * FROM geosettings WHERE chatId = ? AND country = ?";
            con.query(sql, [msg.id.remote, shownCountry], function (err, result) {
                var restricitons = "";
                result.forEach((element, index) => {
                    if(element.ban == 1) {
                        restricitons += "❌"+getFlagEmoji(element.country) + element.country + "\n";
                    } else if(element.approve == 1) {
                        restricitons += "✔️"+getFlagEmoji(element.country) + element.country + "\n";
                    }
                });
                
                msg.reply(translate(`🌎 Geographic parameter%s:\n%s`, [" ("+shownCountry+")", (restricitons == "" ? translate("None",[],set.language): restricitons)], set.language));
            });
        }
    } else {
        var info = "⁉️ Code du pays non reconnu\n";
        msg.reply(info,msg.id.remote);
    }
}