document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('matches-container');
    const liveCounter = document.getElementById('live-counter');
    const tabs = document.querySelectorAll('.tab');
    const jsonUrl = 'sonyliv.json'; // আপনার JSON ফাইলের নাম

    let allMatches = [];
    let liveMatches = [];
    let upcomingMatches = [];

    // Tab switching functionality
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const tabType = this.getAttribute('data-tab');
            filterMatches(tabType);
        });
    });

    function filterMatches(tabType) {
        let matchesToShow = [];
        switch (tabType) {
            case 'live':
                matchesToShow = liveMatches;
                break;
            case 'upcoming':
                matchesToShow = upcomingMatches;
                break;
            default:
                matchesToShow = allMatches;
        }
        renderMatches(matchesToShow);
    }

    fetch(jsonUrl)
        .then(response => {
            if (!response.ok) throw new Error(`Network error: ${response.statusText}`);
            return response.json();
        })
        .then(data => {
            if (!data || !Array.isArray(data.matches)) {
                throw new Error('Invalid JSON structure. "matches" array not found.');
            }
            
            allMatches = data.matches;
            
            liveMatches = allMatches.filter(match => match.isLive === true);
            upcomingMatches = allMatches.filter(match => match.isLive === false);

            liveCounter.textContent = `${liveMatches.length} LIVE • ${upcomingMatches.length} UPCOMING • ${allMatches.length} TOTAL`;
            document.getElementById('all-count').textContent = allMatches.length;
            document.getElementById('live-count').textContent = liveMatches.length;
            document.getElementById('upcoming-count').textContent = upcomingMatches.length;

            filterMatches('all');
        })
        .catch(error => {
            console.error('Error fetching or processing data:', error);
            container.innerHTML = `<div class="info-message"><h3>Failed to Load Events</h3><p>${error.message}</p></div>`;
            liveCounter.textContent = "Events unavailable";
        });

    function renderMatches(matches) {
        if (matches.length === 0) {
            container.innerHTML = `<div class="info-message">No events available for this category.</div>`;
            return;
        }
        
        container.innerHTML = ''; 
        const grid = document.createElement('div');
        grid.className = 'matches-grid';

        matches.forEach(match => {
            const card = document.createElement('div');
            card.className = 'match-card';

            const eventName = match.event_name || 'Live Event';
            const matchName = match.match_name || '';
            
            const badgeText = match.isLive ? 'LIVE' : 'UPCOMING';
            const badgeClass = match.isLive ? 'live-badge' : 'upcoming-badge';

            // সমাধান: এখানে চেক করা হচ্ছে dai_url আছে কি না
            let buttonsHtml = ''; // ডিফল্টভাবে বাটন খালি থাকবে
            
            // যদি dai_url থাকে এবং খালি না হয়, তবেই বাটন তৈরি হবে
            if (match.dai_url && match.dai_url.trim() !== '') {
                buttonsHtml = `
                    <div class="btn-container">
                        <a href="${match.dai_url}" target="_blank" rel="noopener noreferrer" class="watch-btn">Watch Now</a>
                    </div>`;
            }

            card.innerHTML = `
                <div class="card-media">
                    <img src="${match.src}" alt="${matchName || eventName}" class="card-thumbnail" loading="lazy">
                    <span class="card-badge ${badgeClass}">${badgeText}</span>
                </div>
                <div class="card-body">
                    ${matchName ? `<h2 class="match-name">${matchName}</h2>` : ''}
                    <h3 class="match-title">${eventName}</h3>
                    <div class="match-meta">
                        ${match.audioLanguageName ? `<span>${match.audioLanguageName}</span>` : ''}
                        ${match.event_category ? `<span>${match.event_category}</span>` : ''}
                    </div>
                    ${buttonsHtml} 
                </div>
            `;
            grid.appendChild(card);
        });
        container.appendChild(grid);
    }
});