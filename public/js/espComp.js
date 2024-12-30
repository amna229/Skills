document.addEventListener("DOMContentLoaded", async () => {
    // Retrieve active skill from localStorage
    let actSkill = localStorage.getItem('actSkill');
    let skill = null;

    // Fetch all skills from the database and find the active skill
    try {
        const skillsResponse = await fetch('/skills/api/skills'); // API endpoint to fetch all skills
        if (skillsResponse.ok) {
            const allSkillsInfo = await skillsResponse.json();
            console.log("Fetched all skills:", allSkillsInfo);

            // Find the active skill in the fetched data
            skill = allSkillsInfo.find(s => s.id == actSkill);
        } else {
            console.error("Failed to fetch skills.");
        }
    } catch (error) {
        console.error("Error fetching skills:", error);
    }

    // Display the active skill's details
    if (skill) {
        let skillText = skill.text;
        document.getElementById('skilltxt').innerHTML = `<strong>Skill: ${skillText}</strong>`;
        document.getElementById('skillDesc').innerText = `Space for the description of the skill: ${skill.description}`;

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

    const unverifiedSubmissions = document.getElementById("unverifiedSubmissions");
    const unverifiedContainer = document.getElementById("unverified-evidences-container");

    // Fetch unverified evidences for the active skill
    if (skill) {
        try {
            const evidenceResponse = await fetch(`/skills/${skill.set}/${skill.id}/evidence`);
            if (evidenceResponse.ok) {
                const evidences = await evidenceResponse.json();

                if (evidences.length > 0) {
                    unverifiedContainer.style.display = "block";
                    evidences.forEach(evidenceEntry => {
                        const newRow = document.createElement("tr");
                        newRow.innerHTML = `
                            <td>${evidenceEntry.user.username}</td>
                            <td>${evidenceEntry.evidence}</td>
                            <td>
                                <button class="btn btn-success btn-sm" data-id="${evidenceEntry._id}">Approve</button>
                                <button class="btn btn-danger btn-sm" data-id="${evidenceEntry._id}">Reject</button>
                            </td>
                        `;
                        unverifiedSubmissions.appendChild(newRow);
                    });
                }
            } else {
                console.error("Failed to fetch unverified evidences.");
            }
        } catch (error) {
            console.error("Error fetching unverified evidences:", error);
        }
    }

    document.getElementById("evidenceButton").addEventListener("click", async (event) => {
        event.preventDefault();

        const evidenceText = document.getElementById("evidenceInput").value.trim();
        if (!evidenceText) {
            alert("Please provide evidence before submitting!");
            return;
        }

        try {
            const response = await fetch(`/skills/${skill.set}/submit-evidence`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ skillId: Number(skill.id), evidence: evidenceText }),
            });

            if (response.ok) {
                alert("Evidence submitted successfully!");
                document.getElementById("evidenceInput").value = "";
            } else {
                alert("Failed to submit evidence.");
            }
        } catch (error) {
            console.error("Error submitting evidence:", error);
        }
    });

    unverifiedSubmissions.addEventListener("click", async (event) => {
        if (event.target.classList.contains("btn-success") || event.target.classList.contains("btn-danger")) {
            const row = event.target.closest("tr");
            const evidenceId = event.target.dataset.id;

            if (!evidenceId) {
                console.error("Unable to retrieve evidence ID.");
                return;
            }

            try {
                const response = await fetch(`/skills/${skill.set}/${skill.id}/verify`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userSkillId: evidenceId,
                        approved: event.target.classList.contains("btn-success").toString()
                    })
                });

                if (response.ok) {
                    alert(event.target.classList.contains("btn-success") ? "Evidence approved!" : "Evidence rejected!");
                    row.remove();

                    if (unverifiedSubmissions.rows.length === 0) {
                        unverifiedContainer.style.display = "none";
                    }
                } else {
                    console.error("Failed to verify evidence.");
                }
            } catch (error) {
                console.error("Error verifying evidence:", error);
            }
        }
    });
});