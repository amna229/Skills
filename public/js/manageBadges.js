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
    //deleteButton.setAttribute('data-id', badgeId);

    deleteButton.addEventListener('click', async (event) => {
        console.log('Deleting badge with ID:', badge._id);  // Verifica que el ID esté correcto
        const badgeId = badge._id;  // Usamos directamente `badge._Id`
        const confirmation = confirm(`Are you sure you want to delete the badge "${badge.name}"?`);

        if (confirmation) {
            try {
                console.log("Attempting to delete badge with ID:", badgeId);
                const response = await fetch(`/admin/badges/delete/${badgeId}`, {
                    method: 'POST',
                });

                console.log("Response:", response);
                if (!response.ok) {
                    alert('Error deleting badge');
                } else {
                    window.location.href = '/admin/badges?success_msg=Badge deleted successfully';
                }
            } catch (error) {
                console.error('Error deleting badge:', error);
                alert('Error deleting badge');
            }
        }
    });

    /*deleteButton.addEventListener('click', async () => {
        const confirmDelete = confirm(`Are you sure you want to delete the badge "${badge.name}"?`);
        if (confirmDelete) {
            try {
                const response = await fetch(`/admin/badges/delete/${badge._id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                });
                const result = await response.json();
                if (response.ok) {
                    alert(result.message);
                    row.remove();
                } else {
                    alert(result.error || 'Failed to delete the badge');
                }
            } catch (error) {
                console.error('Error deleting badge:', error);
                alert('Error deleting badge. Please try again.');
            }
        }
    });*/

  /*  deleteButton.addEventListener('click', async () => {
        const confirmDelete = confirm(`Are you sure you want to delete the badge "${badge.name}"?`);
        if (confirmDelete) {
            try {
                const response = await fetch(`/admin/badges/delete/${badge._id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                });
                const result = await response.json();

                if (response.ok) {
                    // Redirigir con un mensaje de éxito
                   // window.location.href = `/admin/badges?success_msg=${encodeURIComponent(result.message)}`;
                    row.remove();  // Elimina la fila de la tabla (si lo deseas)
                } else {
                    // Redirigir con un mensaje de error
                    //window.location.href = `/admin/badges?error_msg=${encodeURIComponent(result.error || 'Failed to delete the badge')}`;
                }
            } catch (error) {
                console.error('Error deleting badge:', error);
                // Redirigir con un mensaje de error
                //window.location.href = `/admin/badges?error_msg=Error deleting badge. Please try again`;
            }
        }
    });*/





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