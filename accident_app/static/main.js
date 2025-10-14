document.addEventListener('DOMContentLoaded', () => {

    // ====== PREDICTOR LOGIC ======
    const roadForm = document.getElementById('road-form');
    if (roadForm) {
        // Curvature display
        const curvatureSlider = document.getElementById('curvature');
        const curvatureVal = document.getElementById('curvature_val');
        curvatureSlider.addEventListener('input', () => {
            curvatureVal.textContent = curvatureSlider.value;
        });

        // Predict button
        const predictBtn = document.getElementById('predict-btn');
        predictBtn.addEventListener('click', async () => {
            const data = {
                road_type: document.getElementById('road_type').value,
                num_lanes: parseInt(document.getElementById('num_lanes').value),
                curvature: parseFloat(document.getElementById('curvature').value),
                speed_limit: parseInt(document.getElementById('speed_limit').value),
                lighting: document.getElementById('lighting').value,
                weather: document.getElementById('weather').value,
                road_signs_present: document.getElementById('road_signs_present').checked ? 1 : 0,
                public_road: document.getElementById('public_road').checked ? 1 : 0,
                time_of_day: document.getElementById('time_of_day').value,
                holiday: document.getElementById('holiday').checked ? 1 : 0,
                school_season: document.getElementById('school_season').checked ? 1 : 0,
                num_reported_accidents: parseInt(document.getElementById('num_reported_accidents').value)
            };

            try {
                const response = await fetch('/predict', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();
                const risk = result.prediction;

                document.getElementById('risk-text').textContent = `Risk: ${risk.toFixed(1)}%`;

                // Draw small gauge
                const ctx = document.getElementById('risk-gauge').getContext('2d');
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        datasets: [{
                            data: [risk, 100 - risk],
                            backgroundColor: risk < 33 ? '#00a8ff' : risk < 66 ? '#fbc531' : '#e84118'
                        }]
                    },
                    options: { cutout: '80%', responsive: false, plugins: { legend: { display: false } } }
                });

            } catch (err) {
                console.error('Prediction error:', err);
                document.getElementById('risk-text').textContent = 'Error predicting risk';
            }
        });
    }

    // ====== GAME LOGIC ======
    const gameSection = document.getElementById('game-section');
    if (gameSection) {
        let score = 0;
        const scoreDisplay = document.getElementById('score-display');
        const gameResult = document.getElementById('game-result');
        const roadsContainer = document.getElementById('roads-container');
        const newGameBtn = document.getElementById('new-game-btn');

        async function createRoads() {
            roadsContainer.innerHTML = '';
            gameResult.textContent = '';

            try {
                const response = await fetch('/game');
                const data = await response.json();

                const roads = [data.road1_desc, data.road2_desc];
                const saferRoad = data.safer_road;

                roads.forEach((desc, index) => {
                    const roadBtn = document.createElement('div');
                    roadBtn.className = 'road-option';
                    roadBtn.textContent = desc;

                    roadBtn.addEventListener('click', () => {
                        if (index === saferRoad) {
                            gameResult.textContent = 'Correct! ✅';
                            score += 1;
                        } else {
                            gameResult.textContent = 'Wrong! ❌';
                            score -= 1;
                        }
                        scoreDisplay.textContent = `Score: ${score}`;
                    });

                    roadsContainer.appendChild(roadBtn);
                });

            } catch (err) {
                gameResult.textContent = 'Error loading roads. Please try again.';
                console.error('Game fetch error:', err);
            }
        }

        newGameBtn.addEventListener('click', createRoads);

        // Initialize first game automatically
        createRoads();
    }

});
