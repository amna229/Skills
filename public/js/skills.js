document.addEventListener("DOMContentLoaded", () =>{
    fetch('/skills.json')
        .then(r => r.json())
        .then(skills => {
            const svgContainer = document.querySelector('.svg-container');
            skills.forEach(skill=> {
                const svgWrapper = document.createElement('div');
                svgWrapper.classList.add('svg-wrapper');
                svgWrapper.setAttribute('data-id', skill.id);
                svgWrapper.setAttribute('data-custom','false');

                const svg = document.createElementNS('http://www.w3.org/2000/svg',"svg");
                svg.setAttribute("width","100");
                svg.setAttribute("height", "100");
                svg.setAttribute("viewBox","0 0 100 100");

                const polygon = document.createElementNS('http://www.w3.org/2000/svg',"polygon");
                polygon.setAttribute("points", "50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5");
                polygon.classList.add("hexagon");

                const text = document.createElementNS('http://www.w3.org/2000/svg',"text");
                text.setAttribute("x","50%");
                text.setAttribute("y","20%");
                text.setAttribute("text-anchor", "middle");
                text.setAttribute("fill", "black");
                text.setAttribute("font-size", "10");

                const content = skill.text.split('\n');
                content.forEach((line, index) => {
                    const tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
                    tspan.setAttribute("x", "50%");
                    tspan.setAttribute("dy", index ? "1.2em" : "1em");
                    tspan.setAttribute("font-weight", "bold");
                    tspan.textContent = line;
                    text.appendChild(tspan);
                });

                const image = document.createElementNS('http://www.w3.org/2000/svg',"image");
                image.setAttribute("x", "35%");
                image.setAttribute("y", "60%");
                image.setAttribute("width", "30");
                image.setAttribute("height", "30");
                image.setAttribute('href',`${skill.icon}`);

                svg.appendChild(polygon);
                svg.appendChild(text);
                svg.appendChild(image);
                svgWrapper.appendChild(svg);
                svgContainer.appendChild(svgWrapper);


                //punto 4
                const canvas = document.createElement('canvas');
                canvas.width = 100;
                canvas.height = 100;
                canvas.classList.add('icon-canvas');
                svgWrapper.appendChild(canvas);

                const context = canvas.getContext('2d');
                const pencilIcon = new Image();
                const notebookIcon = new Image();

                pencilIcon.src = '../electronics/pencil.svg';
                notebookIcon.src = '../electronics/notebook.svg';

                pencilIcon.onload = () => {
                    context.drawImage(pencilIcon, 10, 70, 20, 20);

                    canvas.addEventListener("click", (event) => {

                        const input = document.createElement('input');
                        input.type = 'text';
                        input.value = skill.text;
                        input.classList.add('input');
                        svgWrapper.appendChild(input);
                        input.focus();

                        input.addEventListener('blur', () => {
                            skill.text = input.value;
                            svgWrapper.removeChild(input);
                            const tspan = text.querySelectorAll('tspan');
                            tspan.forEach((tspan, index) => {
                                tspan.textContent = skill.text.split('/n')[index];
                            });
                        });
                    });
                };

                notebookIcon.onload = () => {
                    context.drawImage(notebookIcon, 70, 70, 20, 20);
                    canvas.addEventListener("click", (event) => {

                        localStorage.setItem('actSkill', JSON.stringify(skill));

                        //para pasarle el hexagono como imagen
                        const svgData = new XMLSerializer().serializeToString(svg);
                        localStorage.setItem(`skillsvg${skill.id}`, svgData);

                       window.open('/especificacionesComp.html', '_blank');

                    });


                };

                svgWrapper.addEventListener("mouseover", () => {

                    svgWrapper.classList.add("hovered");
                    canvas.style.display = 'block';

                    const footer= document.createElement('footer');
                    footer.textContent = 'description of the skill'+skill.id +' '+ skill.description;
                    footer.classList.add('footer');
                    svgContainer.appendChild(footer);

                });
                svgWrapper.addEventListener("mouseout", () => {

                    svgWrapper.classList.remove("hovered");
                    canvas.style.display = 'none';
                    const footer = document.querySelector('.footer');
                    if(footer) footer.remove();

                });



            });
        }).catch(error => console.error("Error loading skills: ", error));
});