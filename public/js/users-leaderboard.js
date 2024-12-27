// Fetch users data from the server
async function fetchUsers() {
    try {
        const response = await fetch('/admin/api/users'); // Correct path to fetch users
        return await response.json();
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

// Fetch badges data from the server
async function fetchBadges() {
    try {
        const response = await fetch('/badges.json'); // Fetch badges as JSON
        return await response.json();
    } catch (error) {
        console.error('Error fetching badges:', error);
        return [];
    }
}

// Create a table row for a user
function createUserRow(user, rank, badge) {
    const row = document.createElement('tr');

    const cells = [
        rank,
        user.username,
        user.score,
        `<img src="${badge.image_url}" alt="${badge.name}" width="30">`,
        badge.name,
    ];

    cells.forEach(content => {
        const td = document.createElement('td');
        td.innerHTML = content;
        row.appendChild(td);
    });

    return row;
}

// Add "No users in this range yet" row
function createEmptyRow() {
    const row = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 5;
    td.textContent = 'No users in this range yet.';
    row.appendChild(td);
    return row;
}

// Load leaderboard data and populate the page
async function loadLeaderboard() {
    const [users, badges] = await Promise.all([fetchUsers(), fetchBadges()]);

    const leaderboardContainer = document.querySelector('div'); // Assuming the leaderboard is inside a `div`

    // Clear the container before rendering
    leaderboardContainer.innerHTML = '';

    // Map to store the best badge for each user
    const userBestBadgeMap = {};

    users.forEach(user => {
        if (user.completedSkills) {
            // Find the badge with the highest bitpoints_min for the user
            const bestBadge = badges
                .filter(badge => user.completedSkills.includes(badge.name))
                .reduce((best, current) => {
                    return (!best || current.bitpoints_min > best.bitpoints_min) ? current : best;
                }, null);

            if (bestBadge) {
                userBestBadgeMap[user.username] = { user, bestBadge };
            }
        }
    });

    badges.forEach(badge => {
        // Create a heading for the badge
        const badgeHeading = document.createElement('h2');
        badgeHeading.style.textAlign = 'center';
        badgeHeading.textContent = badge.name;

        // Create a table for the badge
        const table = document.createElement('table');
        table.id = 'users-leaderboard';

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        ['Rank', 'Username', 'Score', 'Badge', 'Range'].forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        const tbody = document.createElement('tbody');

        // Get users who have this badge as their best
        const usersWithBadge = Object.values(userBestBadgeMap)
            .filter(entry => entry.bestBadge.name === badge.name)
            .sort((a, b) => b.user.score - a.user.score);

        // If no users match, display "No users in this range yet"
        if (usersWithBadge.length === 0) {
            tbody.appendChild(createEmptyRow());
        } else {
            // Populate the table with users
            usersWithBadge.forEach((entry, index) => {
                const row = createUserRow(entry.user, index + 1, badge);
                tbody.appendChild(row);
            });
        }

        table.appendChild(thead);
        table.appendChild(tbody);

        // Append heading and table to the container
        leaderboardContainer.appendChild(badgeHeading);
        leaderboardContainer.appendChild(table);
    });
}

// Load leaderboard data when the DOM is ready
document.addEventListener('DOMContentLoaded', loadLeaderboard);