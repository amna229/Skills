const path = require('path');
const fs = require('fs');
const https = require('https');

const baseURL = 'https://raw.githubusercontent.com/Obijuan/digital-electronics-with-open-FPGAs-tutorial/master/rangos/png/';

const directory = path.join(__dirname, '../badges');

async function extractBadgesNames() {
    try {
        const data = fs.readFileSync(path.join(__dirname, '../badges.json'));
        const badges = JSON.parse(data);
        return badges.map(badge => badge.png);
    }catch (error){
        console.error('Error al leer badges.json:', error);
        return [];
    }
}

// Descarga una medalla
function downloadBadge(badgeName) {
    return new Promise ((resolve) => {
        const filePath = path.join(directory, badgeName);
        const iconURL = `${baseURL}${badgeName}`;

        https.get(iconURL, (res) => {
            if(res.statusCode === 200){
                const fileStream = fs.createWriteStream(filePath);
                res.pipe(fileStream);

                fileStream.on('finish', () => {
                    fileStream.close();
                    console.log(`Medalla ${badgeName} descargada`);
                    resolve();
                });
            }else {
                console.error(`Error al descargar ${iconURL}: ${res.statusCode}`);
                resolve();
            }
        }).on('error', () => {
            console.error(`Error al descargar ${badgeName}: ${err.message}`);
            resolve();
        });
    });
}

//Descargar todas las medallas
async function getBadges() {
    const badgeNames = await extractBadgesNames();
    for (const badgeName of badgeNames) {
        await downloadBadge(badgeName);
    }
    console.log('Descarga de medallas completada');
}
getBadges();