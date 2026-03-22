let mockDB = {};
let currentPlayer = null;

async function init() {
    try {
        const response = await fetch('stats.json');
        if (!response.ok) throw new Error("Could not load stats.json");
        mockDB = await response.json();
        
        renderOverallStats();
        renderTopCombos();
        renderPlayerCards();
    } catch (error) {
        console.error("Error loading stats:", error);
    }
}

function renderOverallStats() {
    const container = document.getElementById('overall-stats-container');
    container.innerHTML = `
        <div class="stat-box"><span>Total Games</span><strong>${mockDB.overall.totalGames}</strong></div>
        <div class="stat-box"><span>Total Kills</span><strong>${mockDB.overall.totalKills}</strong></div>
        <div class="stat-box"><span>Tasks Completed</span><strong>${mockDB.overall.completedTasks} / ${mockDB.overall.totalTasks}</strong></div>
    `;
}

function renderTopCombos() {
    const tbody = document.getElementById('combo-tbody');
    tbody.innerHTML = '';
    
    mockDB.overall.topCombos.forEach(combo => {
        tbody.innerHTML += `
            <tr>
                <td>${combo.combo}</td>
                <td>${combo.games}</td>
                <td>${combo.wins}</td>
                <td>${combo.winRate}%</td>
            </tr>
        `;
    });
}

function renderPlayerCards() {
    const grid = document.getElementById('player-grid');
    grid.innerHTML = '';

    mockDB.players.forEach(player => {
        const card = document.createElement('div');
        card.className = 'player-card';
        card.onclick = () => openPlayerDetails(player.id);
        
        card.innerHTML = `
            <div class="player-icon"><img src="${player.icon}" alt="${player.name}"></div>
            <h3>${player.name}</h3>
            <div class="win-rate">${player.winRate}% Win</div>
            <div class="games-played">${player.games} Games</div>
            
            <div class="tooltip">
                <p>K/D Ratio: ${player.stats.kdr}</p>
                <p>Kills: ${player.stats.kills}</p>
                <p>Deaths: ${player.stats.deaths}</p>
                <hr>
                <p>Tasks: ${player.stats.tasksCompleted}</p>
                <p>Voted Out: ${player.stats.votedOut}</p>
            </div>
        `;
        grid.appendChild(card);
    });
}

function openPlayerDetails(playerId) {
    currentPlayer = mockDB.players.find(p => p.id === playerId);
    
    document.getElementById('dashboard-view').classList.remove('active');
    document.getElementById('player-detail-view').classList.add('active');
    
    // Inject the icon into the detail view
    document.getElementById('detail-icon').innerHTML = `<img src="${currentPlayer.icon}" alt="${currentPlayer.name}">`;
    
    document.getElementById('detail-name').innerText = currentPlayer.name;
    document.getElementById('detail-subtitle').innerText = `${currentPlayer.games} Games Played | ${currentPlayer.winRate}% Overall Win Rate`;
    
    // Render Kill Trivia
    const victimsList = document.getElementById('top-victims-list');
    victimsList.innerHTML = currentPlayer.trivia.topVictims.length > 0 
        ? currentPlayer.trivia.topVictims.map(v => `<li><span>${v.name}</span> <span>${v.count} Kills</span></li>`).join('')
        : `<li><span>No Data</span></li>`;
        
    const nemesesList = document.getElementById('top-nemeses-list');
    nemesesList.innerHTML = currentPlayer.trivia.topNemeses.length > 0 
        ? currentPlayer.trivia.topNemeses.map(n => `<li><span>${n.name}</span> <span>${n.count} Times</span></li>`).join('')
        : `<li><span>No Data</span></li>`;
    
    changeRole('All');
}

function showDashboard() {
    document.getElementById('player-detail-view').classList.remove('active');
    document.getElementById('dashboard-view').classList.add('active');
    currentPlayer = null;
}

function changeRole(role) {
    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.innerText === role || (role === 'All' && btn.innerText.includes('All'))) {
            btn.classList.add('active');
        }
    });

    const container = document.getElementById('detail-stats-container');
    
    if (role === 'All') {
        container.innerHTML = `
            <div class="stat-box"><span>Wins</span><strong>${currentPlayer.stats.wins}</strong></div>
            <div class="stat-box"><span>Losses</span><strong>${currentPlayer.stats.losses}</strong></div>
            <div class="stat-box"><span>K/D Ratio</span><strong>${currentPlayer.stats.kdr}</strong></div>
            <div class="stat-box"><span>Total Kills</span><strong>${currentPlayer.stats.kills}</strong></div>
            <div class="stat-box"><span>Total Deaths</span><strong>${currentPlayer.stats.deaths}</strong></div>
            <div class="stat-box"><span>Tasks Completed</span><strong>${currentPlayer.stats.tasksCompleted}</strong></div>
        `;
    } else {
        const roleStats = currentPlayer.roles[role] || { games: 0, wins: 0, winRate: 0, kills: 0 };
        container.innerHTML = `
            <div class="stat-box"><span>Games as ${role}</span><strong>${roleStats.games}</strong></div>
            <div class="stat-box"><span>Wins</span><strong>${roleStats.wins}</strong></div>
            <div class="stat-box"><span>Win Rate</span><strong>${roleStats.winRate}%</strong></div>
            ${roleStats.kills !== undefined ? `<div class="stat-box"><span>Kills as ${role}</span><strong>${roleStats.kills}</strong></div>` : ''}
        `;
    }
}

init();