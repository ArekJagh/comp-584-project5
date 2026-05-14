const API_KEY = '53efc203-fc3a-48bd-a0cd-3811439ecbd0';

const playerInput = document.getElementById('playerInput');
const searchBtn   = document.getElementById('searchBtn');
const errorMsg    = document.getElementById('error-msg');
const loading     = document.getElementById('loading');
const results     = document.getElementById('results');

// Animate header on load
anime({
  targets: '.logo, .title, .subtitle',
  translateY: [-30, 0],
  opacity: [0, 1],
  duration: 900,
  easing: 'easeOutExpo',
  delay: anime.stagger(120)
});

anime({
  targets: '.search-bar',
  translateY: [20, 0],
  opacity: [0, 1],
  duration: 800,
  easing: 'easeOutExpo',
  delay: 400
});

anime({
  targets: '.line',
  scaleY: [0, 1],
  duration: 1200,
  easing: 'easeOutExpo',
  delay: anime.stagger(200)
});

anime({
  targets: '.circle-bg',
  scale: [0, 1],
  opacity: [0, 1],
  duration: 1400,
  easing: 'easeOutExpo'
});

searchBtn.addEventListener('click', searchPlayer);
playerInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') searchPlayer();
});

async function searchPlayer() {
  const query = playerInput.value.trim();
  if (!query) return;

  errorMsg.classList.add('hidden');
  results.innerHTML = '';
  loading.classList.remove('hidden');

  try {
    const playerRes = await fetch(
      'https://api.balldontlie.io/v1/players?search=' + encodeURIComponent(query) + '&per_page=5',
      { headers: { 'Authorization': API_KEY } }
    );

    console.log('Status:', playerRes.status);
    const playerData = await playerRes.json();
    console.log('Data:', playerData);

    if (!playerRes.ok) throw new Error('API error ' + playerRes.status);
    if (!playerData.data || playerData.data.length === 0) throw new Error('No players found');

    const players = playerData.data;

    const statsPromises = players.map(function(p) {
      return fetch(
        'https://api.balldontlie.io/v1/season_averages?season=2024&player_ids[]=' + p.id,
        { headers: { 'Authorization': API_KEY } }
      ).then(function(r) { return r.json(); }).catch(function() { return { data: [] }; });
    });

    const statsResults = await Promise.all(statsPromises);
    console.log('Stats:', statsResults);

    loading.classList.add('hidden');
    displayPlayers(players, statsResults);

  } catch (err) {
    console.error('Caught error:', err);
    loading.classList.add('hidden');
    showError();
  }
}

function displayPlayers(players, statsResults) {
  if (players.length === 0) { showError(); return; }

  players.forEach(function(player, i) {
    var stats = (statsResults[i] && statsResults[i].data && statsResults[i].data[0]) ? statsResults[i].data[0] : null;
    var card = createCard(player, stats);
    results.appendChild(card);
  });

  anime({
    targets: '.player-card',
    translateY: [40, 0],
    opacity: [0, 1],
    duration: 700,
    easing: 'easeOutExpo',
    delay: anime.stagger(100)
  });

  document.querySelectorAll('.stat-value[data-target]').forEach(function(el) {
    var target = parseFloat(el.dataset.target);
    var obj = { val: 0 };
    anime({
      targets: obj,
      val: target,
      duration: 1200,
      easing: 'easeOutExpo',
      delay: 300,
      update: function() { el.textContent = obj.val.toFixed(1); }
    });
  });
}

function createCard(player, stats) {
  var card = document.createElement('div');
  card.className = 'player-card';

  var teamName = (player.team && player.team.full_name) ? player.team.full_name : 'N/A';
  var pos = player.position || 'N/A';
  var height = player.height || 'N/A';
  var weight = player.weight ? player.weight + ' lbs' : 'N/A';

  var statsHTML = '';
  if (stats) {
    statsHTML = '<div class="stats-grid">' +
      '<div class="stat-box"><div class="stat-value" data-target="' + (stats.pts || 0) + '">0.0</div><div class="stat-label">PPG</div></div>' +
      '<div class="stat-box"><div class="stat-value" data-target="' + (stats.reb || 0) + '">0.0</div><div class="stat-label">RPG</div></div>' +
      '<div class="stat-box"><div class="stat-value" data-target="' + (stats.ast || 0) + '">0.0</div><div class="stat-label">APG</div></div>' +
      '<div class="stat-box"><div class="stat-value" data-target="' + (stats.stl || 0) + '">0.0</div><div class="stat-label">STL</div></div>' +
      '<div class="stat-box"><div class="stat-value" data-target="' + (stats.blk || 0) + '">0.0</div><div class="stat-label">BLK</div></div>' +
      '<div class="stat-box"><div class="stat-value" data-target="' + parseFloat(((stats.fg_pct || 0) * 100).toFixed(1)) + '">0.0</div><div class="stat-label">FG%</div></div>' +
      '</div>';
  } else {
    statsHTML = '<p class="no-stats">No season stats available for 2023-24.</p>';
  }

  card.innerHTML =
    '<div class="player-name">' + player.first_name + ' ' + player.last_name + '</div>' +
    '<div class="player-team">' + teamName + '</div>' +
    statsHTML +
    '<div class="player-meta">' +
      '<span><strong>' + pos + '</strong>Position</span>' +
      '<span><strong>' + height + '</strong>Height</span>' +
      '<span><strong>' + weight + '</strong>Weight</span>' +
    '</div>';

  return card;
}

function showError() {
  errorMsg.classList.remove('hidden');
  anime({
    targets: '#error-msg',
    translateX: [-10, 10, -8, 8, -4, 4, 0],
    duration: 500,
    easing: 'easeInOutSine'
  });
}
