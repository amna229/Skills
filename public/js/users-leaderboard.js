async function fetchUsers() {
    try {
        const response = await fetch('/api/users/leaderboard-data');
        return await response.json();
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

async function fetchBadges() {
    try {
        const response = await fetch('/badges.json');
        return await response.json();
    } catch (error) {
        console.error('Error fetching badges:', error);
        return [];
    }
}

function getBadgeForScore(badges, score) {
    return badges.find(badge =>
        score >= badge.bitpoints_min &&
        score <= (badge.bitpoints_max || Infinity)
    ) || badges[0];
}

function createUserRow(user, rank, badge) {
    const row = document.createElement('tr');

    const cells = [
        rank,
        user.username,
        user.score,
        `<img src="${badge.image_url}" alt="${badge.name}" width="30">`,
        badge.name
    ];

    cells.forEach(content => {
        const td = document.createElement('td');
        td.innerHTML = content;
        row.appendChild(td);
    });

    return row;
}

async function loadLeaderboard() {
    const [users, badges] = await Promise.all([
        fetchUsers(),
        fetchBadges()
    ]);

    const tableBody = document.querySelector('#users-leaderboard tbody');
    tableBody.innerHTML = '';

    // Group users by badge range
    const groupedUsers = badges.reduce((acc, badge) => {
        const usersInRange = users.filter(user =>
            user.score >= badge.bitpoints_min &&
            user.score <= (badge.bitpoints_max || Infinity)
        );
        if (usersInRange.length > 0) {
            acc[badge.name] = usersInRange;
        }
        return acc;
    }, {});

    // Create section for each badge range
    Object.entries(groupedUsers).forEach(([badgeName, rangeUsers]) => {
        // Add badge category header
        const headerRow = document.createElement('tr');
        const headerCell = document.createElement('td');
        headerCell.colSpan = 5;
        headerCell.textContent = badgeName;
        headerCell.className = 'badge-category';
        headerRow.appendChild(headerCell);
        tableBody.appendChild(headerRow);

        if (rangeUsers.length === 0) {
            const emptyRow = document.createElement('tr');
            const emptyCell = document.createElement('td');
            emptyCell.colSpan = 5;
            emptyCell.textContent = 'No users in this range yet.';
            emptyRow.appendChild(emptyCell);
            tableBody.appendChild(emptyRow);
            return;
        }

        // Add users in this range
        rangeUsers
            .sort((a, b) => b.score - a.score)
            .forEach((user, index) => {
                const badge = badges.find(b => b.name === badgeName);
                const row = createUserRow(user, index + 1, badge);
                tableBody.appendChild(row);
            });
    });
}

document.addEventListener('DOMContentLoaded', loadLeaderboard);