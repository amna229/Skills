document.addEventListener("DOMContentLoaded", () => {

    const isAdmin = window.isAdmin;
    console.log("isAdmin in window: ", isAdmin);

    fetch('/skills.json')
  
    // Fetch skills from the server
    fetch('/skills/api/skills')
        .then(r => r.json())
        .then(skills => {
            const svgContainer = document.querySelector('.svg-container');
            const allSkillsInfo = [];

            // Function to update the evidence counter badge for a specific skill
            const updateCountBadge = (skillId, unverifiedCount, verifiedCount) => {
                const redCircle = document.querySelector(`.red-circle[data-id="${skillId}"]`);
                if (redCircle) {
                    redCircle.textContent = unverifiedCount.toString(); // Update badge text
                    redCircle.style.display = unverifiedCount > 0 ? 'flex' : 'none'; // Show or hide badge
                }

                const greenCircle = document.querySelector(`.green-circle[data-id="${skillId}"]`);
                if (greenCircle) {
                    greenCircle.textContent = verifiedCount.toString(); // Update badge text
                    greenCircle.style.display = verifiedCount > 0 ? 'flex' : 'none'; // Show or hide badge
                }

                // Mark skill as verified if necessary
                if (verifiedCount > 0 && redCircle) {
                    redCircle.style.display = 'none';

                    const wrapper = document.querySelector(`.svg-wrapper[data-id="${skillId}"]`);
                    if (wrapper) {
                        const skillElement = wrapper.querySelector(`polygon[data-id="${skillId}"]`);
                        if (skillElement) {
                            skillElement.classList.replace("hexagon", "hexagon-completed-skill");
                        }
                    }
                }
            };

            // Populate the UI with skills
            skills.forEach(skill => {
                const svgWrapper = document.createElement('div');
                svgWrapper.classList.add('svg-wrapper');
                svgWrapper.setAttribute('data-id', skill.id);
                svgWrapper.setAttribute('data-custom', 'false');

                const svg = document.createElementNS('http://www.w3.org/2000/svg', "svg");
                svg.setAttribute("width", "100");
                svg.setAttribute("height", "100");
                svg.setAttribute("viewBox", "0 0 100 100");

                const polygon = document.createElementNS('http://www.w3.org/2000/svg', "polygon");
                polygon.setAttribute("points", "50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5");
                polygon.setAttribute("data-id", skill.id);
                polygon.classList.add("hexagon");

                const text = document.createElementNS('http://www.w3.org/2000/svg', "text");
                text.setAttribute("x", "50%");
                text.setAttribute("y", "20%");
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

                const image = document.createElementNS('http://www.w3.org/2000/svg', "image");
                image.setAttribute("x", "35%");
                image.setAttribute("y", "60%");
                image.setAttribute("width", "30");
                image.setAttribute("height", "30");
                image.setAttribute('href', `${skill.icon}`);

                // Evidence counters
                const redCircle = document.createElement('div');
                redCircle.classList.add('red-circle');
                redCircle.setAttribute('data-id', skill.id);
                svgWrapper.appendChild(redCircle);

                const greenCircle = document.createElement('div');
                greenCircle.classList.add('green-circle');
                greenCircle.setAttribute('data-id', skill.id);
                svgWrapper.appendChild(greenCircle);

                svg.appendChild(polygon);
                svg.appendChild(text);
                svg.appendChild(image);
                svgWrapper.appendChild(svg);
                svgContainer.appendChild(svgWrapper);

                // Canvas for pencil and notebook icons
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


                if(isAdmin==="true"){

                    pencilIcon.onload = () => {
                        context.drawImage(pencilIcon, 10, 70, 20, 20);

                        canvas.addEventListener("click", (event) => {

                            const rect = canvas.getBoundingClientRect();
                            const scaleX = canvas.width / rect.width;
                            const scaleY = canvas.height / rect.height;
                            const x = (event.clientX - rect.left) * scaleX;
                            const y = (event.clientY - rect.top) * scaleY;

                            const pencilBounds = {
                                x: 10,
                                y: 70,
                                width: 20,
                                height: 20
                            };

                            const whenClickP = x >= pencilBounds.x && x <= pencilBounds.x + pencilBounds.width && y >= pencilBounds.y && y <= pencilBounds.y + pencilBounds.height;

                            if (whenClickP) {
                                const isVerified = polygon.classList.contains("hexagon-completed-skill");
                                if (!isVerified) {
                                    localStorage.setItem('actSkill', skill.id);
                                    const svgData = new XMLSerializer().serializeToString(svg);
                                    localStorage.setItem(`skillsvg${skill.id}`, svgData);
                                    // Aquí construimos la URL correctamente
                                    const skillTreeName = skill.set; // O obtenerlo dinámicamente si es necesario
                                    const skillID = skill.id;
                                    localStorage.setItem('actSkill', skillID);
                                    const url = `/skills/${skillTreeName}/edit/${skillID}`;
                                    window.open(url, '_blank');  // Abrir la página en una nueva pestaña
                                }
                            }
                        });
                    };

                }


                notebookIcon.onload = () => {
                    context.drawImage(notebookIcon, 70, 70, 20, 20);
                };

                canvas.addEventListener("click", (event) => {
                    const rect = canvas.getBoundingClientRect();
                    const scaleX = canvas.width / rect.width;
                    const scaleY = canvas.height / rect.height;
                    const x = (event.clientX - rect.left) * scaleX;
                    const y = (event.clientY - rect.top) * scaleY;

                    // Pencil bounds
                    const pencilBounds = { x: 10, y: 70, width: 20, height: 20 };
                    const notebookBounds = { x: 70, y: 70, width: 20, height: 20 };

                    if (
                        x >= pencilBounds.x &&
                        x <= pencilBounds.x + pencilBounds.width &&
                        y >= pencilBounds.y &&
                        y <= pencilBounds.y + pencilBounds.height
                    ) {
                        const skillTreeName = skill.set;
                        const skillID = skill.id;
                        localStorage.setItem('actSkill', skillID);
                        const url = `/skills/${skillTreeName}/edit/${skillID}`;
                        window.open(url, '_blank');
                    } else if (
                        x >= notebookBounds.x &&
                        x <= notebookBounds.x + notebookBounds.width &&
                        y >= notebookBounds.y &&
                        y <= notebookBounds.y + notebookBounds.height
                    ) {
                        localStorage.setItem('actSkill', skill.id);
                        window.open('/especificacionesComp', '_blank');
                    }
                });

                // Fetch evidence counts for this skill
                fetch(`/skills/${skill.set}/${skill.id}/evidence-counts`)
                    .then(res => res.json())
                    .then(({ unverifiedCount, verifiedCount }) => {
                        updateCountBadge(skill.id, unverifiedCount, verifiedCount);
                    })
                    .catch(err => console.error(`Error fetching evidence counts for skill ${skill.id}:`, err));

                allSkillsInfo.push(skill);

                // Add mouseover and mouseout events
                svgWrapper.addEventListener("mouseover", () => {
                    const isVerified = polygon.classList.contains("hexagon-completed-skill");
                    if (!isVerified) {
                        svgWrapper.classList.add("hovered");
                        canvas.style.display = 'block';

                        const footer = document.createElement('footer');
                        footer.textContent = `Description: ${skill.description}`;
                        footer.classList.add('footer');
                        svgContainer.appendChild(footer);
                    }
                });

                svgWrapper.addEventListener("mouseout", () => {
                    const isVerified = polygon.classList.contains("hexagon-completed-skill");
                    if (!isVerified) {
                        svgWrapper.classList.remove("hovered");
                        canvas.style.display = 'none';
                        const footer = document.querySelector('.footer');
                        if (footer) footer.remove();
                    }
                });
            });

            // Store all skills info in localStorage
            localStorage.setItem('allSkillsInfo', JSON.stringify(allSkillsInfo));
        })
        .catch(error => console.error("Error loading skills: ", error));

    // Keep active skill logic in localStorage
    window.addEventListener("unload", () => {
        localStorage.removeItem('allSkillsInfo'); // Clear all skills info when user leaves the page
    });
});