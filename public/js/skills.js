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
                image.setAttribute("href",`${skill.icon}`);

                svg.appendChild(polygon);
                svg.appendChild(text);
                svg.appendChild(image);
                svgWrapper.appendChild(svg);
                svgContainer.appendChild(svgWrapper);
            });
        }).catch(error => console.error("Error loading skills: ", error));
});