//Importamos la librería puppeteer
const puppeteer = require('puppeteer');
const fs = require('fs');

//URL de la que extraeremos los datos
const URL = 'https://tinkererway.dev/web_skill_trees/electronics_skill_tree';

let scraper = async () =>{
    try{
        //Iniciar el navegador y la página
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(URL, {waitUntil:'load', timeout:0});

        //Extraer la información de cada skill
        const info = await page.evaluate(() => {
           //Seleccionamos los elementos de los skills
           const svgContainers = document.querySelectorAll("body > div.svg-container > div");

           return Array.from(svgContainers).map((container) =>{
              const skillId = container.getAttribute('data-id');
              const skillText = container.querySelectorAll('svg > text tspan');
              const skillIcon = container.querySelector('svg > image');  //la referencia de los iconos de la URL
               //la referencia para mostrar los iconos en nuestra página
              const refIcon = skillIcon? `/electronics/icons/${skillIcon.getAttribute('href').split('/').pop()}`:'';

              return{
                  id: skillId,
                  text: [...skillText].map(tspan => tspan.textContent).join('\n').trim(),
                  icon: refIcon,
                  description: ''
              };
           }).filter(skill => skill.text || skill.icon); //Filtra solo aquellos que tengan texto o icono
        });

        //Guardar el array de skills en un archivo JSON
        fs.writeFileSync('skills.json', JSON.stringify(info,null,2));

        console.log('Datos extraidos y guardados en skills.json');

        //Cerramos el navegador
        await browser.close();
    } catch (error){
        console.error("Error en el proceso de scraping: ", error);
    }
};
scraper();