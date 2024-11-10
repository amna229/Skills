const fs = require('fs');
const puppeteer = require('puppeteer');

const URL = 'https://github.com/Obijuan/digital-electronics-with-open-FPGAs-tutorial/wiki#listado-de-rangos';

let badges = async () => {
    try{
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(URL);

        const info = await page.evaluate(() => {
            const rangeContainers = document.querySelectorAll('#wiki-body > div.markdown-body > table');
            let bitpointsMin = 0;
            const bitpointsIncrement = 10;

            return Array.from(rangeContainers).slice(-5).flatMap((table) => {
                const rangeRows = table.querySelectorAll('tbody > tr');

                return Array.from(rangeRows).map(row => {
                    const range = row.querySelector('td > strong')?.textContent.trim();
                    const png = row.querySelector('td > img');
                    const pngUrl = png?.getAttribute('src') || '';

                    // Calculamos los puntos máximos
                    const bitpointsMax = bitpointsMin + bitpointsIncrement - 1;

                    // Creamos el objeto de la medalla
                    const badge = {
                        rango: range,
                        bitpoints_min: bitpointsMin,
                        bitpoints_max: bitpointsMax,
                        png: pngUrl.split('/').pop().replace(/\.png$/, '-min.png')
                    };
                    // Incrementamos el mínimo para el próximo rango
                    bitpointsMin += bitpointsIncrement;

                    return badge;
                });
            });
        });
        // Guarda el array JSON en un archivo llamado badges.json
        fs.writeFileSync('badges.json', JSON.stringify(info, null, 2));

        console.log('Archivo badges.json generado con éxito');
        await browser.close();
    }catch (error){
        console.error('Error:', error);
    }

};
badges();