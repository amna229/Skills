async function fetchBadges() {
    try {
        // Cargar el archivo JSON
        const response = await fetch('/admin/api/badges');
        return await response.json();
    } catch (error) {
        console.error('Error fetching badges:', error);
    }
}

function createLeaderboardRow(badge){
    const row = document.createElement('tr');

    // Columna de la medalla (imagen)
    const imageCell = document.createElement('td');
    const img = document.createElement('img');
    const imagePath = badge.image_url.startsWith('/badges/') ? badge.image_url : `/badges/${badge.image_url}`;
    img.src = imagePath;
    img.alt = badge.name;
    img.width = 50;
    imageCell.appendChild(img);
    row.appendChild(imageCell);

    // Columna del rango
    const nameCell = document.createElement('td');
    nameCell.textContent = badge.name;
    row.appendChild(nameCell);

    // Columna del rango
    const rangeCell = document.createElement('td');
    rangeCell.textContent = badge.name;
    row.appendChild(rangeCell);

    // Columna de puntos minimos
    const minCell = document.createElement('td');
    minCell.textContent = badge.bitpoints_min;
    row.appendChild(minCell);

    // Columna de puntos minimos
    const maxCell = document.createElement('td');
    maxCell.textContent = badge.bitpoints_max;
    row.appendChild(maxCell);

    // Columna de acciones
    const actionsCell = document.createElement('td');

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.classList.add('default-buttons');
    editButton.addEventListener('click', () => {
        // Redirige a la página de edición con el ID del badge
        window.location.href = `/admin/badges/edit/${badge._id}`;
    });

    actionsCell.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete-buttons');

    actionsCell.appendChild(deleteButton);
    row.appendChild(actionsCell);

    return row;
}

async function loadTable() {
    const badges = await fetchBadges();
    const tableBody = document.querySelector('#leaderboard tbody');

    // Generar las filas de la tabla con los datos de las medallas
    badges.forEach(badge => {
        const row = createLeaderboardRow(badge);
        tableBody.appendChild(row);
    });
}

// Llamar a la función para cargar las medallas al cargar la página
document.addEventListener('DOMContentLoaded', loadTable);