try {
    const { Client, Location, List, LocalAuth,MessageMedia } = require('whatsapp-web.js');
    const fs = require('fs');
    const { extractLinks, isWhatsAppGroupLink, translate, processCommand, parse, initParticipants, updateUserActivity } = require('./src/helpers');
    const axios = require('axios');

    
    const cheerio = require("cheerio");

    var mysql = require('mysql');

    var con = mysql.createConnection({
        host: "127.0.0.1",
        user: "root",
        password: "",
        database: "whatsassist",
        charset: 'utf8mb4'
    });


    con.connect(function(err) {
        if (err) throw err;
        const allowedChats = {};
        const client = new Client({
            webVersionCache: {
                type: 'remote',
                remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.3000.1014580163-alpha.html',
                },
            authStrategy: new LocalAuth(),
            puppeteer: { 
                args: ['--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36','--no-sandbox',"--disable-dev-shm-usage"],
                headless: false
            }
        });
    
        client.initialize();
    
        client.on('loading_screen', (percent, message) => {
            console.log('LOADING SCREEN', percent, message);
        });
    
        client.on('qr', (qr) => {
            console.log('QR RECEIVED', qr);
        });
    
        client.on('authenticated', () => {
            console.log('AUTHENTICATED');
        });
    
        client.on('auth_failure', msg => {
            console.error('AUTHENTICATION FAILURE', msg);
        });
    
        client.on('ready', async() => {
            console.log('READY');
            con.query("SELECT * FROM chatbots WHERE bot = 'WDH'", [], async function (err, chatsResult) {
                if (err) {
                } else {
                    for(let waChat of chatsResult) {
                        try {
                            waChat.configuration = JSON.parse(waChat.configuration);
                            allowedChats[waChat.chatId] = waChat;
                            allowedChats[waChat.chatId].intervals = [];
                            allowedChats[waChat.chatId].language = 'fr';
                            await initParticipants(con,await client.getChatById(waChat.chatId));
                        } catch(Exception) {
                            console.log(Exception);
                        }
                    }
                }
            });


            
            const express = require('express');
            const path = require('path');
            const app = express();
            const port = 3000;

            app.use(express.static(path.join(__dirname, 'public')));

            app.listen(port, () => {
                console.log(`Server running at http://localhost:${port}/`);
            });

            app.get('/groups', async (req, res) => {

                const chats = await client.getChats();
                const groupChats = chats.filter((chat) => chat.isGroup && !chat.isReadOnly);
                res.json(groupChats);
            });
        });
        client.on('vote_update', async(vote) => {
            /**
             * The {@link vote} that was affected:
             * 
             * {
             *   voter: 'number@c.us',
             *   selectedOptions: [ { name: 'B', localId: 1 } ],
             *   interractedAtTs: 1698195555555,
             *   parentMessage: {
             *     ...,
             *     pollName: 'PollName',
             *     pollOptions: [
             *       { name: 'A', localId: 0 },
             *       { name: 'B', localId: 1 }
             *     ],
             *     allowMultipleAnswers: true,
             *     messageSecret: [
             *        1, 2, 3, 0, 0, 0, 0, 0,
             *        0, 0, 0, 0, 0, 0, 0, 0,
             *        0, 0, 0, 0, 0, 0, 0, 0,
             *        0, 0, 0, 0, 0, 0, 0, 0
             *     ]
             *   }
             * }
             */
            console.log(vote);
            const msg = await client.getChatById(vote.parentMessage.to);
            if(vote.parentMessage.pollName == "[contacts] Quel groupe ?") {
                console.log(vote.selectedOptions[0]);
                if(vote.selectedOptions[0].name != undefined) con.query("SELECT * FROM chatbots WHERE bot = 'WDH'", [], async function (err, chatsResult) {
                    if (err) {
                    } else {
                        for(let waChat of chatsResult) {
                            try {
                                const chat = await client.getChatById(waChat.chatId);
                                if(chat.name == vote.selectedOptions[0].name) {
                                    const csvHeader = ['Serveur', "Utilisateur", 'Admin', "Propriétaire"];
                                    const currentDate = new Date();

                                    const day = currentDate.getDate();
                                    const month = currentDate.getMonth() + 1;
                                    const year = currentDate.getFullYear();
                                    const formattedDate = `${day}_${month}_${year}`;
                                    const contactFileName = './src/data/'+chat.name+"_"+chat.participants.length+'_contacts_'+formattedDate+'.csv';
                                    var data = `${csvHeader.join(',')}\n`;
                                    for(let participant of chat.participants) {
                                        data += `${participant.id.server},${participant.id.user},${participant.isAdmin},${participant.isSuperAdmin}\n`;
                                    }
                                    fs.writeFile(contactFileName, data, async(error) => {
                                        if (error) {
                                            msg.reply("Désolé, une erreur est survenu.");
                                            return false;
                                        } else {
                                            const media = await MessageMedia.fromFilePath(contactFileName);
                                            const sendMessageData = await client.sendMessage( vote.voter, media, {caption: "Contacts"}); 
                                            return contactFileName;
                                        }
                                    });
                                    break;
                                }
                            } catch(Exception) {
                                console.log(Exception);
                            }
                        }
                    }
                });
            }
        });
        client.on('group_join', async(notification) => {
            if(allowedChats[notification.chatId]) {
                updateUserActivity(con, notification);
                var joinerid = notification.id.participant;
                var checkPhone = await parse("+"+joinerid.split("@")[0]);
                const cChat = await client.getChatById(notification.chatId);
                con.query("SELECT COUNT(*) as count, ban, approve FROM geosettings WHERE `chatId` = '"+notification.chatId+"' AND (country = ? OR country = '*')", [checkPhone.country], async (err, result) =>  {
                    if (err) throw err;
                    else {
                        const count = result[0].count;
                        const autoban = result[0].ban;
                        const autoapp = result[0].approve;
                        if (count > 0 && autoban == 1) await cChat.removeParticipants([notification.id.participant]);
                    }
                });
                con.query("SELECT COUNT(*) as count FROM scammers WHERE phone_number = ?", [notification.id.participant.split("@")[0]], async (err, result) =>  {
                    if (err) throw err;
                    else {
                        const count = result[0].count;
                        if (count > 0) await cChat.removeParticipants([notification.id.participant]);
                    }
                });
                /* Welcome message, should be removed ?
                con.query("SELECT COUNT(*) as count, message FROM welcomes WHERE chatId = ?", [notification.chatId], async (err, result) =>  {
                    if (err) throw err;
                    else {
                        const count = result[0].count;
                        if (count > 0) {
                            const welc = result[0];
                            welc.message = welc.message.replace(new RegExp("@GroupName", 'g'), cChat.name);

                            
                            var mentions = welc.message.includes("@Mention") ? [notification.id.participant] : [];
                            welc.message = welc.message.replace(new RegExp("@Mention", 'g'), "@"+notification.id.participant.split("@")[0]);
                            
                            notification.reply(welc.message, { mentions: mentions });
                            
                        }
                    }
                });*/
            }
        });
        client.on('group_membership_request', async msg => {
            const cChat = await client.getChatById(msg.chatId);
            if(allowedChats[msg.chatId]) {
                var checkPhone = await parse("+"+msg.id.participant.split("@")[0]);
                con.query("SELECT COUNT(*) as count, ban, approve FROM geosettings WHERE chatId = ? AND (country = ? OR country = '*')", [msg.chatId,checkPhone.country], async (err, result) =>  {
                    if (err) throw err;
                    else {
                        const count = result[0].count;
                        const autoban = result[0].ban;
                        const autoapp = result[0].approve;
                        if(count > 0) {
                            if (autoban == 1) {
                                //msg.reply(`@`+msg.id.participant.split("@")[0]+` n'a pas pu rejoindre le groupe ! 🥺`, { mentions: [msg.id.participant] });
                                client.rejectGroupMembershipRequests(msg.chatId, msg.author);
                            } else if(autoapp == 1) {
                                client.approveGroupMembershipRequests(msg.chatId, msg.author);
                            }

                        }
                    }
                });
                con.query("SELECT COUNT(*) as count FROM scammers WHERE phone_number = ?", [msg.id.participant.split("@")[0].trim()], async (err, result) =>  {
                    if (err) throw err;
                    else {
                        const count = result[0].count;
                        if (count > 0) {
                            client.rejectGroupMembershipRequests(msg.chatId, msg.author);
                        }
                    }
                });
            
            }
        });
        client.on('message', async msg => {
            try {
                const time = new Date(msg.timestamp * 1000).toISOString().replace(/T/, ' ').replace(/\..+/, '').split(' ')[1].replaceAll(':', '-')
                const date = new Date(msg.timestamp * 1000).toISOString().substring(0, 10);
                const person = msg['_data']['notifyName'];
                const phoneNumber = msg.from.replaceAll('@c.us', '');
                
                if (msg.hasMedia) {
                    const media = await msg.downloadMedia();
                    const folder = process.cwd() + '/img/' + phoneNumber + '_' + person + '/' + date + '/';
                    const filename = folder + time + '_' + msg.id.id + '.' + media.mimetype.split('/')[1];
                    fs.mkdirSync(folder, { recursive: true });
                    fs.writeFileSync(filename, Buffer.from(media.data, 'base64').toString('binary'), 'binary');
                }
                if(allowedChats[msg.id.remoted] == undefined) allowedChats[msg.id.remote] = {language:"en"};
                msg.isChatAdmin = false;
                msg.chat = await msg.getChat();
                if(msg.mentionedIds.includes("590691288580@c.us")) {
                    msg.chat.sendStateTyping();
                    const int = setInterval(function(){
                        msg.chat.sendStateTyping();
                    }, 25000);
                    const prompt_message = msg.body.replace(/@590691288580/g, '');
    
                    const url = 'http://5.42.158.152:9999/api/generate';
                    const data = {
                        model: 'llama3:70b',
                        prompt: "Pour ma demande suivante, ne dépasse pas 10000 caractères: "+ prompt_message,
                        stream: false
                    };
                    const headers = {
                        'X-API-Key': 'MYAPIKEY'
                    };
                    axios.post(url, data, { headers }).then(response => {
                        const responseData = response.data;
                        if (responseData.response) {
                            msg.reply(responseData.response);
                        } else {
                            console.log('Response field not found in the response data');
                        }
                        clearInterval(int);
                    }).catch(error => {
                        console.error('Error making the request:', error);
                        clearInterval(int);
                    });
                }
                console.log(msg);


                if (msg.chat.isGroup) {
                    const authorId = msg.author;
                    for(let participant of msg.chat.participants) {
                        if(participant.id._serialized === authorId) {
                            if(participant.isAdmin) msg.isChatAdmin = true;
                            break;
                        }
                    }
                } else {
                    // Not group
                }
                if(msg.type == "chat" && ["/", "!"].includes(msg.body.substring(0,1))) await processCommand(msg, con,allowedChats[msg.id.remote], client);
                else if(allowedChats[msg.id.remote]) {
                    updateUserActivity(con, msg);
                    const chatLinks = extractLinks(msg.body);
                    
                    if(msg.isChatAdmin == false) {
                        const chatLinks = extractLinks(msg.body);
                        const whatsappGroupLinks = chatLinks.filter(link => isWhatsAppGroupLink(link));
                        console.log(whatsappGroupLinks);
                        if(chatLinks.length > 0) {
                            con.query("SELECT COUNT(*) as count FROM limits WHERE chatId = ? AND (name = 'links') AND value = 'no'", [msg.id.remote], async (err, result) =>  {
                                if (err) throw err;
                                else {
                                    const count = result[0].count;
                                    if(count > 0) {
                                        msg.delete(true);
                                        //msg.chat.sendMessage(translate("Links to website are not allowed... ! %s", [`\n@`+msg.id.participant.split("@")[0]], allowedChats[msg.id.remote].language), { mentions: [msg.id.participant] });
                                    } else if(whatsappGroupLinks.length > 0) {
                                        con.query("SELECT COUNT(*) as count FROM limits WHERE chatId = ? AND (name = 'walinks') AND value = 'no'", [msg.id.remote], async (err, result) =>  {
                                            if (err) throw err;
                                            else {
                                                const count = result[0].count;
                                                if(count > 0) {
                                                    msg.delete(true);
                                                    //msg.chat.sendMessage(translate("Links to whatsapp groups are not allowed... ! %s", [`\n@`+msg.id.participant.split("@")[0]], allowedChats[msg.id.remote].language), { mentions: [msg.id.participant] });
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }
                }
            } catch (error) {
                console.error('Error caught:');
                console.log(error);
            }
        
        });

    });



} catch (error) {
    console.error('Error caught:');
    console.log(error);
}