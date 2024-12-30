document.addEventListener("DOMContentLoaded", () => {

    const isAdmin = window.isAdmin;
    console.log("isAdmin in window: ", isAdmin);

    fetch('/skills.json')
        .then(r => r.json())
        .then(skills => {
            const svgContainer = document.querySelector('.svg-container');
            // Retrieve evidenceData from localStorage or initialize an empty object
            const evidenceData = JSON.parse(localStorage.getItem('evidenceData')) || {};

            // Function to update the evidence counter badge for a specific skill
            const updateCountBadge = (skillId) => {
                const evidenceData = JSON.parse(localStorage.getItem('evidenceData')) || {};
                const skillEvidence = evidenceData[skillId] || [];
                const unverifiedEvidence = skillEvidence.filter(evidence => !evidence.accepted); // Exclude accepted evidence
                const unverifiedEvidenceCounter = unverifiedEvidence.length;

                const redCircle = document.querySelector(`.red-circle[data-id="${skillId}"]`);
                if (redCircle) {
                    redCircle.textContent = unverifiedEvidenceCounter.toString(); // Update badge text
                    redCircle.style.display = unverifiedEvidenceCounter > 0 ? 'flex' : 'none'; // Show or hide badge
                    console.log(`Badge with skill id: ${skillId} updated to: ${unverifiedEvidenceCounter}.`);
                }

                const skillData = JSON.parse(localStorage.getItem('skillData')) || {};
                const skillVerification = skillData[skillId] || [];const verifiedEvidenceCounter = skillVerification.verified ? 1 : 0;
                console.log(skillVerification)
                console.log(verifiedEvidenceCounter)

                const greenCircle = document.querySelector(`.green-circle[data-id="${skillId}"]`);
                if (greenCircle) {
                    greenCircle.textContent = verifiedEvidenceCounter.toString(); // Update badge text
                    greenCircle.style.display = verifiedEvidenceCounter > 0 ? 'flex' : 'none'; // Show or hide badge
                    console.log(`Badge with skill id: ${skillId} verified with counter set to: ${verifiedEvidenceCounter}.`);

                    // Update UI when skill is verified
                    if (greenCircle.style.display == 'flex' && redCircle) {
                        redCircle.style.display = 'none';

                        // Change skill hexagon style to verified
                        // Select the svg-wrapper with the corresponding data-id
                        const wrapper = document.querySelector(`.svg-wrapper[data-id="${skillId}"]`);

                        if (wrapper) {
                            // Select the polygon inside the specific svg-wrapper
                            const skillElement = wrapper.querySelector(`polygon[data-id="${skillId}"]`);

                            if (skillElement) {
                                // Replace or add the completed-skill class
                                if (skillElement.classList.contains("hexagon")) {
                                    skillElement.classList.replace("hexagon", "hexagon-completed-skill");
                                } else {
                                    skillElement.classList.add("hexagon-completed-skill");
                                }
                                console.log(`Skill ${skillId} marked as verified.`);
                            } else {
                                console.error(`No polygon element found within wrapper for skillId: ${skillId}`);
                            }
                        } else {
                            console.error(`No svg-wrapper element found for skillId: ${skillId}`);
                        }
                    }
                }
            };

            const allSkillsInfo=[];

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

                allSkillsInfo.push(skill);

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

                // Create a red circle for the unverified evidence counter badge
                const redCircle = document.createElement('div');
                redCircle.classList.add('red-circle');
                redCircle.setAttribute('data-id', skill.id); // Add data-id
                svgWrapper.appendChild(redCircle);

                // Create a green circle for the verified counter badge
                const greenCircle = document.createElement('div');
                greenCircle.classList.add('green-circle');
                greenCircle.setAttribute('data-id', skill.id); // Add data-id
                svgWrapper.appendChild(greenCircle);

                console.log("Añadiendo SVG para skill:", skill.id);
                svg.appendChild(polygon);
                svg.appendChild(text);
                svg.appendChild(image);
                svgWrapper.appendChild(svg);
                svgContainer.appendChild(svgWrapper);

                // Canvas for icons
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


                if(isAdmin==='true'){

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

                }else if(isAdmin==='false'){

                    context.clearRect(10, 70, 20, 20);

                }


                notebookIcon.onload = () => {
                    context.drawImage(notebookIcon, 70, 70, 20, 20);

                    canvas.addEventListener("click", (event) => {

                        const rect = canvas.getBoundingClientRect();
                        const scaleX = canvas.width / rect.width;
                        const scaleY = canvas.height / rect.height;
                        const x = (event.clientX - rect.left) * scaleX;
                        const y = (event.clientY - rect.top) * scaleY;

                        const notebookBounds = {
                            x: 70,
                            y: 70,
                            width: 20,
                            height: 20
                        };

                        const whenClickNb = x >= notebookBounds.x && x <= notebookBounds.x + notebookBounds.width && y >= notebookBounds.y && y <= notebookBounds.y + notebookBounds.height;

                        if (whenClickNb) {
                            const isVerified = polygon.classList.contains("hexagon-completed-skill");
                            if (!isVerified) {
                                localStorage.setItem('actSkill', skill.id);
                                const svgData = new XMLSerializer().serializeToString(svg);
                                localStorage.setItem(`skillsvg${skill.id}`, svgData);
                                window.open('/especificacionesComp', '_blank');
                            }
                        }
                    });
                };


                svgWrapper.addEventListener("mouseover", () => {
                    const isVerified = polygon.classList.contains("hexagon-completed-skill");
                    if (!isVerified) {
                        svgWrapper.classList.add("hovered");
                        canvas.style.display = 'block';

                        const footer = document.createElement('footer');
                        footer.textContent = 'description of the skill ' + skill.id + ' ' + skill.description;
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

                // Update all unverified evidence counter badges on page load
                updateCountBadge(skill.id);

            });

            localStorage.setItem('allSkillsInfo', JSON.stringify(allSkillsInfo));

        })
        .catch(error => console.error("Error loading skills: ", error));

    window.addEventListener('unload', () => {
        localStorage.removeItem('allSkillsInfo');
        localStorage.removeItem('actSkill');
    });
});