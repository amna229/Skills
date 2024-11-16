document.addEventListener("DOMContentLoaded", () => {
    let skill = localStorage.getItem('actSkill');

    if (skill) {

        skill = JSON.parse(skill);

        let skillText = skill.text.replace(/\n/g, ' ');
        document.getElementById('skilltxt').innerHTML = '<strong>Skill: ' + skillText + '</strong>';
        document.getElementById('skillDesc').innerText = 'space for the description of the skill: ' + skill.description;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', "svg");
        svg.setAttribute("width", "100");
        svg.setAttribute("height", "100");
        svg.setAttribute("viewBox", "0 0 100 100");

        const polygon = document.createElementNS('http://www.w3.org/2000/svg', "polygon");
        polygon.setAttribute("points", "50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5");
        polygon.classList.add("hexagon");

        const text = document.createElementNS('http://www.w3.org/2000/svg', "text");
        text.setAttribute("x", "50%");
        text.setAttribute("y", "20%");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("fill", "black");
        text.setAttribute("font-size", "10");

        const words = skillText.split(' ');
        let line = '';
        skillText = [];

        words.forEach(word => {
            if ((line + word).length > 10) {
                skillText.push(line.trim());
                line = '';
            }
            line += `${word} `;
        });

        skillText.forEach((line, index) => {
            const tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
            tspan.setAttribute("x", "50%");
            tspan.setAttribute("dy", index ? "1.2em" : "1em");
            tspan.setAttribute("font-weight", "bold");
            tspan.textContent = line;
            text.appendChild(tspan);
        });

        const image = document.createElementNS('http://www.w3.org/2000/svg', "image");
        image.setAttribute("x", "35%");
        image.setAttribute("y", "60%");
        image.setAttribute("width", "30");
        image.setAttribute("height", "30");
        image.setAttribute('href', `${skill.icon}`);

        svg.appendChild(polygon);
        svg.appendChild(text);
        svg.appendChild(image);
        document.getElementById('skillImage').replaceWith(svg);

    }

    let checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);

            if (allChecked) {
                confetti({
                    particleCount: 250,
                    spread: 100,
                    origin: {y: 0.6}
                });
                document.getElementById('evidenceForm').style.display = 'block';
                document.getElementById('evidenceTitle').style.display = 'block';
                document.getElementById('evidenceInput').style.display = 'block';
                document.getElementById('evidenceButton').style.display = 'block';
            }
        });
    });

    window.addEventListener('unload', () => {
        localStorage.clear();
    });
});