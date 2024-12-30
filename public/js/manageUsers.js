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
    if (user.admin) {
        adminCell.textContent = 'Yes';
    } else{adminCell.textContent = 'No';}
    row.appendChild(adminCell);

    // Celda de Acciones
    const actionsCell = document.createElement('td');

    // Botón para Cambiar Contraseña
    const changePasswordButton = document.createElement('button');
    changePasswordButton.textContent = 'Change Password';
    changePasswordButton.className = 'default-buttons';
    changePasswordButton.addEventListener('click', () => {
        // Habilitar el campo de contraseña y el botón de cambio
        enablePasswordFields();

        // Deshabilitar otros botones de acción
        disableOtherActionButtons(changePasswordButton);

        // Guardar el ID del usuario para la actualización de la contraseña
        document.getElementById('password').dataset.userId = user._id;
    });

    actionsCell.appendChild(changePasswordButton);
    row.appendChild(actionsCell);

    return row;
}

// Habilitar los campos de contraseña
function enablePasswordFields() {
    document.getElementById('password').disabled = false;
    document.querySelector('button[type="submit"]').disabled = false;
}

// Deshabilitar otros botones de acción
function disableOtherActionButtons(excludeButton) {
    const actionButtons = document.querySelectorAll('#leaderboard button');
    actionButtons.forEach(button => {
        if (button !== excludeButton) {
            button.disabled = true;
        }
    });
}

async function changeUserPassword(userId, newPassword) {
    try {
        const response = await fetch('/admin/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, newPassword }),
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

// Handle password change on form submission
document.querySelector('button[type="submit"]').addEventListener('click', async () => {
    const newPassword = document.getElementById('password').value;
    const userId = document.getElementById('password').dataset.userId;

    if (!newPassword) {
        alert('Please enter a new password');
        return;
    }

    // Call function to change password
    await changeUserPassword(userId, newPassword);

    // Clear the password field and disable it again
    document.getElementById('password').disabled = true;
    document.querySelector('button[type="submit"]').disabled = true;
    tableBody.innerHTML = '';
    // Reload the users to refresh state
    loadUsers();
});

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