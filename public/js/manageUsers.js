async function fetchUsers() {
    try {
        const response = await fetch('/admin/api/users');
        return await response.json();
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

function createUserRow(user) {
    const row = document.createElement('tr');

    // Celda de Username
    const usernameCell = document.createElement('td');
    usernameCell.textContent = user.username;
    row.appendChild(usernameCell);

    // Celda de Admin (Yes/No)
    const adminCell = document.createElement('td');
    if (user.admin = true) {
        adminCell.textContent = 'Yes';
    } else adminCell.textContent = 'No';
    row.appendChild(adminCell);

    // Celda de Acciones
    const actionsCell = document.createElement('td');

    // Botón para Cambiar Contraseña
    const changePasswordButton = document.createElement('button');
    changePasswordButton.textContent = 'Change Password';
    changePasswordButton.className = 'default-buttons';
    changePasswordButton.addEventListener('click', () => {
        const newPassword = prompt(`Enter new password for ${user.username}:`);
        if (newPassword) {
            changeUserPassword(user._id, newPassword);
        }
    });

    actionsCell.appendChild(changePasswordButton);
    row.appendChild(actionsCell);

    return row;
}

async function changeUserPassword(userId, newPassword) {
    try {
        const response = await fetch(`/api/users/${userId}/change-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: newPassword }),
        });
        if (response.ok) {
            alert('Password changed successfully!');
        } else {
            alert('Failed to change password.');
        }
    } catch (error) {
        console.error('Error changing password:', error);
    }
}

async function loadUsers() {
    const users = await fetchUsers();
    const tableBody = document.querySelector('#leaderboard tbody');

    // Generar las filas de la tabla
    users.forEach(user => {
        const row = createUserRow(user);
        tableBody.appendChild(row);
    });
}

// Cargar la lista de usuarios al cargar la página
document.addEventListener('DOMContentLoaded', loadUsers);