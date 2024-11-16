document.addEventListener("DOMContentLoaded", () => {
    let skill = localStorage.getItem('actSkill');

    if (skill) {
        skill = JSON.parse(skill);

        let skillText = skill.text.replace(/\n/g, ' ');
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
                    origin: { y: 0.6 }
                });
                document.getElementById('evidenceForm').style.display = 'block';
                document.getElementById('evidenceTitle').style.display = 'block';
                document.getElementById('evidenceInput').style.display = 'block';
                document.getElementById('evidenceButton').style.display = 'block';
            }
        });
    });

    window.addEventListener('unload', () => {
        localStorage.removeItem('actSkill'); // Clear only the active skill data
    });

    window.addEventListener("load", () => {
        const evidenceButton = document.getElementById("evidenceButton");
        const evidenceInput = document.getElementById("evidenceInput");
        const unverifiedSubmissions = document.getElementById("unverifiedSubmissions");
        const unverifiedContainer = document.getElementById("unverified-evidences-container");

        // Load evidence data from localStorage
        const evidenceData = JSON.parse(localStorage.getItem('evidenceData')) || {};
        const currentSkillEvidence = evidenceData[skill.id] || []; // Access evidence for the current skill

        if (currentSkillEvidence.length > 0) {
            unverifiedContainer.style.display = "block";
            currentSkillEvidence.forEach(evidenceEntry => {
                const newRow = document.createElement("tr");
                newRow.innerHTML = `
                <td>${evidenceEntry.user || "Unknown User"}</td>
                <td>${evidenceEntry.evidence}</td>
                <td>
                    <button class="btn btn-success btn-sm">Approve</button>
                    <button class="btn btn-danger btn-sm">Reject</button>
                </td>
                `;
                unverifiedSubmissions.appendChild(newRow);
            });
        }

        evidenceButton.addEventListener("click", (event) => {
            event.preventDefault();
            const evidenceText = evidenceInput.value.trim();

            if (evidenceText === "") {
                alert("Please enter evidence before submitting.");
                return;
            }

            // Retrieve or initialize evidenceData
            const evidenceData = JSON.parse(localStorage.getItem('evidenceData')) || {};
            const skillEvidence = evidenceData[skill.id] || [];

            // Check for duplicates
            if (skillEvidence.some(e => e.evidence === evidenceText)) {
                alert("This evidence already exists.");
                return;
            }

            // Add the new evidence for the current skill
            skillEvidence.push({ evidence: evidenceText, user: "Current User" }); // Store as an object
            evidenceData[skill.id] = skillEvidence;

            // Save updated evidenceData to localStorage
            localStorage.setItem('evidenceData', JSON.stringify(evidenceData));

            // Dynamically add the new evidence to the table
            const newRow = document.createElement("tr");
            newRow.innerHTML = `
            <td>Current User</td>
            <td>${evidenceText}</td>
            <td>
                <button class="btn btn-success btn-sm">Approve</button>
                <button class="btn btn-danger btn-sm">Reject</button>
            </td>
            `;
            unverifiedSubmissions.appendChild(newRow);

            // Clear input and ensure the unverified container is visible
            evidenceInput.value = "";
            unverifiedContainer.style.display = "block";

            // Show confirmation
            alert(`Evidence added for skill: ${skill.text}`);
        });

        unverifiedSubmissions.addEventListener("click", (event) => {
            if (event.target.classList.contains("btn-success") || event.target.classList.contains("btn-danger")) {
                const row = event.target.closest("tr");
                const evidenceText = row.children[1].innerText;

                // Retrieve evidenceData from localStorage
                const evidenceData = JSON.parse(localStorage.getItem('evidenceData')) || {};
                const skillEvidence = evidenceData[skill.id] || [];

                // Find the evidence entry and update its status
                const updatedEvidence = skillEvidence.map(evidence => {
                    if (evidence.evidence === evidenceText) {
                        if (event.target.classList.contains("btn-success")) {
                            evidence.accepted = true; // Flag evidence as accepted
                            alert("Evidence accepted!");
                        } else {
                            alert("Evidence rejected!");
                        }
                        return null; // Exclude this evidence from the list
                    }
                    return evidence; // Keep other evidence entries
                }).filter(evidence => evidence !== null); // Remove null entries

                // Update evidenceData for the skill
                if (updatedEvidence.length > 0) {
                    evidenceData[skill.id] = updatedEvidence;
                } else {
                    delete evidenceData[skill.id];
                    unverifiedContainer.style.display = "none";
                }

                // Save the updated evidenceData back to localStorage
                localStorage.setItem('evidenceData', JSON.stringify(evidenceData));

                // Remove the row from the table
                row.remove();
            }
        });
    });
});