document.addEventListener("DOMContentLoaded", async () => {
    let actSkill = localStorage.getItem('actSkill');
    let skill = null;

    const allSkillsInfo = JSON.parse(localStorage.getItem('allSkillsInfo'));
    console.log(allSkillsInfo);

    for(let i = 0; i < allSkillsInfo.length; i++) {
        if (allSkillsInfo[i].id == actSkill) {
            skill = allSkillsInfo[i];
            break;
        }
    }

    if (skill) {
        let skillText = skill.text;
        document.getElementById('skilltxt').innerHTML = '<strong>Skill: ' + skillText + '</strong>';
        document.getElementById('skillDesc').innerText = 'Space for the description of the skill: ' + skill.description;

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
                    origin: { y: 0.6 }
                });
                document.getElementById('evidenceForm').style.display = 'block';
                document.getElementById('evidenceTitle').style.display = 'block';
                document.getElementById('evidenceInput').style.display = 'block';
                document.getElementById('evidenceButton').style.display = 'block';
            }
        });
    });

    window.addEventListener("load", () => {
        const evidenceButton = document.getElementById("evidenceButton");
        const evidenceInput = document.getElementById("evidenceInput");
        const unverifiedSubmissions = document.getElementById("unverifiedSubmissions");
        const unverifiedContainer = document.getElementById("unverified-evidences-container");

        const evidenceData = JSON.parse(localStorage.getItem('evidenceData')) || {};
        const currentSkillEvidence = evidenceData[skill.id] || [];

        if (currentSkillEvidence.length > 0) {
            unverifiedContainer.style.display = "block";
            currentSkillEvidence.forEach(evidenceEntry => {
                const newRow = document.createElement("tr");
                newRow.innerHTML = `
                <td>${evidenceEntry.user}</td>
                <td>${evidenceEntry.evidence}</td>
                <td>
                    <button class="btn btn-success btn-sm">Approve</button>
                    <button class="btn btn-danger btn-sm">Reject</button>
                </td>
                `;
                unverifiedSubmissions.appendChild(newRow);
            });
        }

        evidenceButton.addEventListener("click", async (event) => {
            event.preventDefault();
            const evidenceText = evidenceInput.value.trim();

            try {
                const response = await fetch('/users/current-user');
                if (response.ok) {
                    const data = await response.json();
                    const loggedInUsername = data.username;
                    console.log(loggedInUsername);

                    if (evidenceText === "") {
                        alert("Please enter evidence before submitting.");
                        return;
                    }

                    const evidenceData = JSON.parse(localStorage.getItem('evidenceData')) || {};
                    const skillEvidence = evidenceData[skill.id] || [];

                    skillEvidence.push({ evidence: evidenceText, user: loggedInUsername || "Username" });
                    evidenceData[skill.id] = skillEvidence;

                    localStorage.setItem('evidenceData', JSON.stringify(evidenceData));

                    const newRow = document.createElement("tr");
                    newRow.innerHTML = `
                <td>${loggedInUsername}</td>
                <td>${evidenceText}</td>
                <td>
                    <button class="btn btn-success btn-sm">Approve</button>
                    <button class="btn btn-danger btn-sm">Reject</button>
                </td>
            `;
                    unverifiedSubmissions.appendChild(newRow);

                    evidenceInput.value = "";
                    unverifiedContainer.style.display = "block";

                    alert(`Evidence added for skill: ${skill.text}`);
                } else {
                    console.error('Failed to fetch username. User might not be logged in.');
                    alert('Failed to fetch username. User might not be logged in.');
                }
            } catch (error) {
                console.error('Error fetching username:', error);
                alert('Failed to fetch username. User might not be logged in.');
            }

        });

        unverifiedSubmissions.addEventListener("click", (event) => {
            if (event.target.classList.contains("btn-success") || event.target.classList.contains("btn-danger")) {
                const row = event.target.closest("tr");
                const evidenceText = row.children[1]?.textContent.trim();

                if (!evidenceText) {
                    console.error("Unable to retrieve evidence text from the row.");
                    return;
                }

                const evidenceData = JSON.parse(localStorage.getItem('evidenceData')) || {};
                const skillData = JSON.parse(localStorage.getItem('skillData')) || {};
                const skillEvidence = evidenceData[skill.id] || [];

                let skillVerified = false;

                const updatedEvidence = skillEvidence.map(evidence => {
                    if (evidence.evidence === evidenceText) {
                        if (event.target.classList.contains("btn-success")) {
                            evidence.accepted = true;
                            skillVerified = true;
                            alert("Evidence accepted!");
                        } else {
                            alert("Evidence rejected!");
                        }
                        return null;
                    }
                    return evidence;
                }).filter(evidence => evidence !== null);

                if (updatedEvidence.length > 0) {
                    evidenceData[skill.id] = updatedEvidence;
                } else {
                    delete evidenceData[skill.id];
                    unverifiedContainer.style.display = "none";
                }

                localStorage.setItem('evidenceData', JSON.stringify(evidenceData));

                if (skillVerified) {
                    console.log(skillVerified);
                    skillData[skill.id] = { ...skillData[skill.id], verified: true };
                    localStorage.setItem('skillData', JSON.stringify(skillData));
                }

                row.remove();
            }
        });
    });
});