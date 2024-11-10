async function fetchBadges() {
    try {
        // Cargar el archivo JSON
        const response = await fetch('/badges.json');
        return await response.json();
    } catch (error) {
        console.error('Error fetching badges:', error);
    }
}

function createLeaderboardRow(badge){
    const row = document.createElement('tr');

    // Columna del rango
    const rangeCell = document.createElement('td');
    rangeCell.textContent = badge.rango;
    row.appendChild(rangeCell);

    // Columna de la medalla (imagen)
    const imageCell = document.createElement('td');
    const img = document.createElement('img');
    img.src = badge.png;
    img.alt = badge.rango;
    img.width = 50;
    imageCell.appendChild(img);
    row.appendChild(imageCell);

    // Columna de puntos necesarios
    const pointsCell = document.createElement('td');
    pointsCell.textContent = `${badge.bitpoints_min} - ${badge.bitpoints_max}`;
    row.appendChild(pointsCell);

    return row;
}

async function loadLeaderboard() {
    const badges = await fetchBadges();
    const tableBody = document.querySelector('#leaderboard tbody');

    // Generar las filas de la tabla con los datos de las medallas
    badges.forEach(badge => {
        const row = createLeaderboardRow(badge);
        tableBody.appendChild(row);
    });
}

// Llamar a la función para cargar las medallas al cargar la página
document.addEventListener('DOMContentLoaded', loadLeaderboard);