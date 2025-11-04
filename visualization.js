// Visualization Module - Handles all charts and result displays

class Visualizer {
    constructor() {
        this.cooperationChart = null;
        this.payoffChart = null;
    }

    // Create cooperation rate chart
    createCooperationChart(roundHistory, strategy1Name, strategy2Name) {
        const ctx = document.getElementById('cooperation-chart');
        
        // Destroy existing chart if it exists
        if (this.cooperationChart) {
            this.cooperationChart.destroy();
        }

        // Calculate cooperation rate per round
        const rounds = roundHistory.map(r => r.round);
        const coop1Data = [];
        const coop2Data = [];
        const overallCoopData = [];

        let coop1Count = 0;
        let coop2Count = 0;
        let totalCoopCount = 0;

        roundHistory.forEach((round, index) => {
            if (round.move1 === COOPERATE) coop1Count++;
            if (round.move2 === COOPERATE) coop2Count++;
            if (round.move1 === COOPERATE || round.move2 === COOPERATE) {
                totalCoopCount += (round.move1 === COOPERATE ? 1 : 0) + (round.move2 === COOPERATE ? 1 : 0);
            }

            coop1Data.push((coop1Count / (index + 1)) * 100);
            coop2Data.push((coop2Count / (index + 1)) * 100);
            overallCoopData.push((totalCoopCount / ((index + 1) * 2)) * 100);
        });

        this.cooperationChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: rounds,
                datasets: [
                    {
                        label: strategy1Name,
                        data: coop1Data,
                        borderColor: 'rgb(102, 126, 234)',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.3
                    },
                    {
                        label: strategy2Name,
                        data: coop2Data,
                        borderColor: 'rgb(118, 75, 162)',
                        backgroundColor: 'rgba(118, 75, 162, 0.1)',
                        tension: 0.3
                    },
                    {
                        label: 'Overall',
                        data: overallCoopData,
                        borderColor: 'rgb(34, 197, 94)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        borderDash: [5, 5],
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Cooperation Rate (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Round'
                        }
                    }
                }
            }
        });
    }

    // Create cumulative payoff chart
    createPayoffChart(roundHistory, strategy1Name, strategy2Name) {
        const ctx = document.getElementById('payoff-chart');
        
        // Destroy existing chart if it exists
        if (this.payoffChart) {
            this.payoffChart.destroy();
        }

        const rounds = roundHistory.map(r => r.round);
        const scores1 = roundHistory.map(r => r.cumScore1);
        const scores2 = roundHistory.map(r => r.cumScore2);

        this.payoffChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: rounds,
                datasets: [
                    {
                        label: strategy1Name,
                        data: scores1,
                        borderColor: 'rgb(102, 126, 234)',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        fill: true,
                        tension: 0.3
                    },
                    {
                        label: strategy2Name,
                        data: scores2,
                        borderColor: 'rgb(118, 75, 162)',
                        backgroundColor: 'rgba(118, 75, 162, 0.1)',
                        fill: true,
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Cumulative Score'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Round'
                        }
                    }
                }
            }
        });
    }

    // Create round-robin aggregated payoff chart
    createRoundRobinPayoffChart(aggregated) {
        const ctx = document.getElementById('payoff-chart');
        
        // Destroy existing chart if it exists
        if (this.payoffChart) {
            this.payoffChart.destroy();
        }

        // Sort strategies by average score (descending)
        const sortedStrategies = Object.entries(aggregated)
            .sort((a, b) => b[1].averageScore - a[1].averageScore);
        
        const labels = sortedStrategies.map(([name, _]) => name);
        const averageScores = sortedStrategies.map(([_, data]) => data.averageScore);
        const totalScores = sortedStrategies.map(([_, data]) => data.totalScore);

        // Create gradient colors
        const colors = [
            'rgba(102, 126, 234, 0.8)',
            'rgba(118, 75, 162, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(251, 146, 60, 0.8)',
            'rgba(239, 68, 68, 0.8)'
        ];

        this.payoffChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Average Score per Match',
                        data: averageScores,
                        backgroundColor: colors,
                        borderColor: colors.map(c => c.replace('0.8', '1')),
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            afterLabel: function(context) {
                                const index = context.dataIndex;
                                const total = totalScores[index];
                                return `Total Score: ${total.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Average Score'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Strategy'
                        },
                        ticks: {
                            autoSkip: false,
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });
    }

    // Create round-robin cooperation chart
    createRoundRobinCooperationChart(aggregated) {
        const ctx = document.getElementById('cooperation-chart');
        
        // Destroy existing chart if it exists
        if (this.cooperationChart) {
            this.cooperationChart.destroy();
        }

        // Sort strategies by cooperation rate (descending)
        const sortedStrategies = Object.entries(aggregated)
            .sort((a, b) => b[1].cooperationRate - a[1].cooperationRate);
        
        const labels = sortedStrategies.map(([name, _]) => name);
        const cooperationRates = sortedStrategies.map(([_, data]) => data.cooperationRate * 100);

        // Create gradient colors
        const colors = cooperationRates.map(rate => {
            if (rate > 80) return 'rgba(34, 197, 94, 0.8)'; // Green for high cooperation
            if (rate > 40) return 'rgba(251, 146, 60, 0.8)'; // Orange for medium
            return 'rgba(239, 68, 68, 0.8)'; // Red for low cooperation
        });

        this.cooperationChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Cooperation Rate',
                        data: cooperationRates,
                        backgroundColor: colors,
                        borderColor: colors.map(c => c.replace('0.8', '1')),
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Cooperation Rate (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Strategy'
                        },
                        ticks: {
                            autoSkip: false,
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });
    }

    // Display summary statistics for pairwise match
    displayPairwiseSummary(result) {
        const summaryDiv = document.getElementById('summary-stats');
        
        const html = `
            <h3>Match Summary</h3>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="label">${result.strategy1Name} - Final Score</div>
                    <div class="value">${result.finalScore1.toFixed(2)}</div>
                </div>
                <div class="stat-card">
                    <div class="label">${result.strategy2Name} - Final Score</div>
                    <div class="value">${result.finalScore2.toFixed(2)}</div>
                </div>
                <div class="stat-card">
                    <div class="label">${result.strategy1Name} - Cooperation Rate</div>
                    <div class="value">${(result.cooperationRate1 * 100).toFixed(1)}%</div>
                </div>
                <div class="stat-card">
                    <div class="label">${result.strategy2Name} - Cooperation Rate</div>
                    <div class="value">${(result.cooperationRate2 * 100).toFixed(1)}%</div>
                </div>
                <div class="stat-card">
                    <div class="label">Total Rounds</div>
                    <div class="value">${result.roundHistory.length}</div>
                </div>
                <div class="stat-card">
                    <div class="label">Winner</div>
                    <div class="value">${result.finalScore1 > result.finalScore2 ? result.strategy1Name : 
                        result.finalScore2 > result.finalScore1 ? result.strategy2Name : 'Tie'}</div>
                </div>
            </div>
        `;
        
        summaryDiv.innerHTML = html;
    }

    // Display summary statistics for round-robin
    displayRoundRobinSummary(aggregated) {
        const summaryDiv = document.getElementById('summary-stats');
        
        // Sort strategies by average score
        const sortedStrategies = Object.entries(aggregated)
            .sort((a, b) => b[1].averageScore - a[1].averageScore);
        
        let html = '<h3>Round-Robin Tournament Results</h3><div class="stats-grid">';
        
        sortedStrategies.forEach(([name, data], index) => {
            html += `
                <div class="stat-card">
                    <div class="label">#${index + 1} - ${name}</div>
                    <div class="value">Avg: ${data.averageScore.toFixed(2)}</div>
                    <div class="label">Coop Rate: ${(data.cooperationRate * 100).toFixed(1)}%</div>
                </div>
            `;
        });
        
        html += '</div>';
        summaryDiv.innerHTML = html;
    }

    // Display detailed results table for pairwise
    displayPairwiseTable(result) {
        const tableDiv = document.getElementById('results-table');
        
        // Show only first 20 rounds and last 10 rounds if more than 30 rounds
        let roundsToShow = result.roundHistory;
        let truncated = false;
        
        if (result.roundHistory.length > 30) {
            roundsToShow = [
                ...result.roundHistory.slice(0, 20),
                ...result.roundHistory.slice(-10)
            ];
            truncated = true;
        }
        
        let html = `
            <div class="results-table">
                <table>
                    <thead>
                        <tr>
                            <th>Round</th>
                            <th>${result.strategy1Name} Move</th>
                            <th>${result.strategy2Name} Move</th>
                            <th>${result.strategy1Name} Payoff</th>
                            <th>${result.strategy2Name} Payoff</th>
                            <th>${result.strategy1Name} Cumulative</th>
                            <th>${result.strategy2Name} Cumulative</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        roundsToShow.forEach((round, index) => {
            if (truncated && index === 20) {
                html += `<tr><td colspan="7" style="text-align:center; font-style:italic;">... (rounds ${21} - ${result.roundHistory.length - 10} omitted) ...</td></tr>`;
            }
            
            html += `
                <tr>
                    <td>${round.round}</td>
                    <td style="color: ${round.move1 === COOPERATE ? '#22c55e' : '#ef4444'}">
                        ${round.move1 === COOPERATE ? 'Cooperate' : 'Defect'}
                    </td>
                    <td style="color: ${round.move2 === COOPERATE ? '#22c55e' : '#ef4444'}">
                        ${round.move2 === COOPERATE ? 'Cooperate' : 'Defect'}
                    </td>
                    <td>${round.payoff1.toFixed(2)}</td>
                    <td>${round.payoff2.toFixed(2)}</td>
                    <td>${round.cumScore1.toFixed(2)}</td>
                    <td>${round.cumScore2.toFixed(2)}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
        
        tableDiv.innerHTML = html;
    }

    // Display payoff matrix
    displayPayoffMatrix(payoffMatrix, strategyNames) {
        const tableDiv = document.getElementById('payoff-matrix-table');
        
        if (!tableDiv) {
            console.error('Payoff matrix table div not found');
            return;
        }

        let html = `
            <h3 style="margin-bottom: 15px;">Payoff Matrix (Scores by Matchup)</h3>
            <div class="results-table">
                <table class="payoff-matrix-table">
                    <thead>
                        <tr>
                            <th class="matrix-corner">vs.</th>
        `;
        
        // Column headers
        strategyNames.forEach(name => {
            html += `<th class="matrix-header">${name}</th>`;
        });
        
        html += `
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        // Find min and max for color scaling
        let minScore = Infinity;
        let maxScore = -Infinity;
        strategyNames.forEach(name1 => {
            strategyNames.forEach(name2 => {
                const score = payoffMatrix[name1][name2];
                if (score !== null) {
                    minScore = Math.min(minScore, score);
                    maxScore = Math.max(maxScore, score);
                }
            });
        });
        
        // Rows
        strategyNames.forEach(name1 => {
            html += `<tr><th class="matrix-row-header">${name1}</th>`;
            
            strategyNames.forEach(name2 => {
                const score = payoffMatrix[name1][name2];
                
                if (score === null) {
                    html += `<td class="matrix-cell">-</td>`;
                } else {
                    // Color based on score (green = high, red = low)
                    const normalized = (score - minScore) / (maxScore - minScore);
                    const hue = normalized * 120; // 0 (red) to 120 (green)
                    const bgColor = `hsla(${hue}, 70%, 85%, 0.8)`;
                    
                    html += `<td class="matrix-cell" style="background-color: ${bgColor}">
                        <strong>${score.toFixed(1)}</strong>
                    </td>`;
                }
            });
            
            html += `</tr>`;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
            <p style="font-size: 0.9em; color: #6c757d; margin-top: 10px;">
                <strong>How to read:</strong> Each cell shows the score that the <strong>row strategy</strong> earned when playing against the <strong>column strategy</strong>.
                Colors: <span style="color: #22c55e;">Green = Higher scores</span>, <span style="color: #ef4444;">Red = Lower scores</span>
            </p>
        `;
        
        tableDiv.innerHTML = html;
    }

    // Display round-robin table
    displayRoundRobinTable(matchResults, aggregated) {
        const tableDiv = document.getElementById('results-table');
        
        // Sort strategies by average score
        const sortedStrategies = Object.entries(aggregated)
            .sort((a, b) => b[1].averageScore - a[1].averageScore);
        
        let html = `
            <div class="results-table">
                <table>
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Strategy</th>
                            <th>Average Score</th>
                            <th>Total Score</th>
                            <th>Games Played</th>
                            <th>Cooperation Rate</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        sortedStrategies.forEach(([name, data], index) => {
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td><strong>${name}</strong></td>
                    <td>${data.averageScore.toFixed(2)}</td>
                    <td>${data.totalScore.toFixed(2)}</td>
                    <td>${data.gamesPlayed}</td>
                    <td>${(data.cooperationRate * 100).toFixed(1)}%</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
            
            <h3 style="margin-top: 30px;">Individual Matches</h3>
            <div class="results-table">
                <table>
                    <thead>
                        <tr>
                            <th>Match</th>
                            <th>Strategy 1</th>
                            <th>Strategy 2</th>
                            <th>Score 1</th>
                            <th>Score 2</th>
                            <th>Winner</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        matchResults.forEach((result, index) => {
            const winner = result.finalScore1 > result.finalScore2 ? result.strategy1Name :
                          result.finalScore2 > result.finalScore1 ? result.strategy2Name : 'Tie';
            
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${result.strategy1Name}</td>
                    <td>${result.strategy2Name}</td>
                    <td>${result.finalScore1.toFixed(2)}</td>
                    <td>${result.finalScore2.toFixed(2)}</td>
                    <td><strong>${winner}</strong></td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
        
        tableDiv.innerHTML = html;
    }

    // Clear all visualizations
    clear() {
        if (this.cooperationChart) {
            this.cooperationChart.destroy();
            this.cooperationChart = null;
        }
        if (this.payoffChart) {
            this.payoffChart.destroy();
            this.payoffChart = null;
        }
        document.getElementById('summary-stats').innerHTML = '<p>Run a simulation to see results</p>';
        document.getElementById('results-table').innerHTML = '';
    }
}


