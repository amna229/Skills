const fs = require('fs');
const path = require('path');
const https = require('https');
const puppeteer = require('puppeteer');

const URL = 'https://tinkererway.dev/web_skill_trees/electronics_skill_tree';
const baseURL = 'https://tinkererway.dev/web_skill_trees_resources/svg/electronics_icons/';

//Directorio donde se descargarán los iconos
const directory = path.join(__dirname,'../public/electronics/icons');

//Extraer nombres únicos de los iconos
async function extractUniqueIconNames(){
    //Iniciar el navegador y la página
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(URL);

   //Extraer los nombres de los archivos .svg
    const iconNames = await page.evaluate(() =>{
        const icons =Array.from(document.querySelectorAll('body > div.svg-container > div > svg > image'))
            .map(img => img.getAttribute('href'))
            .map(href => href.split('/').pop());
        return [...new Set(icons)]; // Usamos Set para eliminar los duplicados
    });

    //Cerramos el navegador
    await browser.close();

    return iconNames;
}

//Descargar un único icono
function downloadIcon(iconName){
    return new Promise(resolve => {
        const filePath = path.join(directory,iconName); //path del icono descargado
        const iconURL = `${baseURL}${iconName}`; //url de donde se descarga el icono

        https.get(iconURL, (res) => {
            if(res.statusCode === 200){
                const fileStream = fs.createWriteStream(filePath);
                res.pipe(fileStream);

                fileStream.on('finish', ()=>{
                    fileStream.close();
                    console.log(`Descarga exitosa: ${iconName}`);
                    resolve();
                });
            }else{
                console.log(`Error al descargar ${iconName}: ${res.statusCode}`);
                resolve(); // Resolver para continuar con el próximo icono aunque uno falle
            }
        }).on('error', () =>{
            console.log(`Error al descargar ${iconName}: ${err.message}`);
            resolve(); // Resolver para continuar con el próximo icono en caso de error
        });
    });
}

//Descargar todos los iconos
async function downloadAllIcons() {
    const iconNames = await extractUniqueIconNames();

    for(const iconName of iconNames){
        await downloadIcon(iconName);
    }
    console.log('Se han descargado todos los iconos');
}

downloadAllIcons();