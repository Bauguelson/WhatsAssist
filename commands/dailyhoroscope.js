
const fs = require('fs');
const axios = require('axios');
const {translate} =  require('../src/translation.js');
function convertDateFormat(inputDate) {
    // Split the input date string into year, month, and day components
    const [year, month, day] = inputDate.split('-');

    // Create a Date object using the components
    const date = new Date(year, month - 1, day);

    // Format the date to "DD/MM/YYYY" format
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
}


module.exports = async function (msg, con, set) {
    var signeVoulu = msg.body.trim().substring(11).trim().replace("é","e");
    try {
        const response = await axios.get('https://kayoo123.github.io/astroo-api/jour.json');
        if(response.data != undefined) {
            
            if(signeVoulu in response.data) {
                msg.reply("Horoscope des signes "+signeVoulu+" au "+convertDateFormat(response.data.date)+": "+response.data[signeVoulu]);
            } else {
                var signes = "";
                for(var signe in response.data) {
                    if(signe ==undefined || signe =="date") continue;
                    signes += signe+", ";
                }
                
                msg.reply("Ce signe astrologique est inconnu.\nSignes: "+signes.substring(0, signes.length-2));
            }
        } else {
            msg.reply("Désolé, l'horoscope n'a pas pu être trouvé");
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}