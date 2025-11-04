// Main Application - Connects UI with simulation and visualization

// Initialize visualizer
const visualizer = new Visualizer();

// Get DOM elements
const runButton = document.getElementById('run-simulation');
const pairwiseRadio = document.getElementById('mode-pairwise');
const roundRobinRadio = document.getElementById('mode-roundrobin');
const pairwiseSection = document.getElementById('pairwise-section');
const durationFixedRadio = document.getElementById('duration-fixed');
const durationIndefiniteRadio = document.getElementById('duration-indefinite');
const fixedRoundsSection = document.getElementById('fixed-rounds-section');
const indefiniteSection = document.getElementById('indefinite-section');

// Show/hide pairwise strategy selection based on mode
function updateUIForMode() {
    if (pairwiseRadio.checked) {
        pairwiseSection.style.display = 'block';
    } else {
        pairwiseSection.style.display = 'none';
    }
}

// Show/hide duration input fields based on game duration mode
function updateUIForDuration() {
    if (durationFixedRadio.checked) {
        fixedRoundsSection.style.display = 'block';
        indefiniteSection.style.display = 'none';
    } else {
        fixedRoundsSection.style.display = 'none';
        indefiniteSection.style.display = 'block';
    }
}

// Add event listeners for mode changes
pairwiseRadio.addEventListener('change', updateUIForMode);
roundRobinRadio.addEventListener('change', updateUIForMode);
durationFixedRadio.addEventListener('change', updateUIForDuration);
durationIndefiniteRadio.addEventListener('change', updateUIForDuration);

// Initialize UI
updateUIForMode();
updateUIForDuration();

// Main simulation runner
runButton.addEventListener('click', () => {
    // Disable button during simulation
    runButton.disabled = true;
    runButton.textContent = 'Running...';

    // Use setTimeout to allow UI to update
    setTimeout(() => {
        try {
            runSimulation();
        } catch (error) {
            alert('Error running simulation: ' + error.message);
            console.error(error);
        } finally {
            runButton.disabled = false;
            runButton.textContent = 'Run Simulation';
        }
    }, 100);
});

function runSimulation() {
    // Get configuration values
    const T = parseFloat(document.getElementById('payoff-t').value);
    const R = parseFloat(document.getElementById('payoff-r').value);
    const P = parseFloat(document.getElementById('payoff-p').value);
    const S = parseFloat(document.getElementById('payoff-s').value);
    const seed = parseInt(document.getElementById('random-seed').value);
    const forgivenessRate = parseFloat(document.getElementById('forgiveness-rate').value);
    
    // Get game duration settings
    const durationType = document.querySelector('input[name="game-duration"]:checked').value;
    let numRounds = null;
    let continuationProb = null;
    
    if (durationType === 'fixed') {
        numRounds = parseInt(document.getElementById('num-rounds').value);
    } else {
        continuationProb = parseFloat(document.getElementById('continuation-prob').value);
    }
    
    // Set random seed for reproducibility
    globalRandom.reset(seed);
    console.log(`Running simulation with seed: ${seed}`);
    console.log(`Generous TFT forgiveness rate: ${forgivenessRate}`);
    console.log(`Game duration type: ${durationType}`);
    
    // Validate payoff matrix
    if (!validatePayoffMatrix(T, R, P, S)) {
        alert('Warning: Payoff matrix does not satisfy standard Prisoner\'s Dilemma conditions (T > R > P > S). Continuing anyway...');
    }
    
    // Validate based on duration type
    if (durationType === 'fixed') {
        if (numRounds < 1 || numRounds > 1000) {
            alert('Number of rounds must be between 1 and 1000');
            return;
        }
    } else {
        if (continuationProb < 0 || continuationProb > 1) {
            alert('Continuation probability must be between 0.0 and 1.0');
            return;
        }
        if (continuationProb === 0) {
            alert('Continuation probability cannot be 0 (game would never start)');
            return;
        }
    }
    
    // Validate seed
    if (isNaN(seed) || seed < 1) {
        alert('Random seed must be a positive integer');
        return;
    }
    
    // Validate forgiveness rate
    if (forgivenessRate < 0 || forgivenessRate > 1) {
        alert('Forgiveness rate must be between 0.0 and 1.0');
        return;
    }
    
    // Create payoff matrix
    const payoffMatrix = new PayoffMatrix(T, R, P, S);
    
    // Create strategy parameters
    const strategyParams = {
        forgiveness: forgivenessRate
    };
    
    // Create tournament with appropriate parameters
    const tournament = new Tournament(payoffMatrix, numRounds, strategyParams, continuationProb);
    
    // Check mode
    const mode = document.querySelector('input[name="tournament-mode"]:checked').value;
    
    if (mode === 'pairwise') {
        runPairwiseMode(tournament);
    } else {
        runRoundRobinMode(tournament);
    }
}

function runPairwiseMode(tournament) {
    // Get selected strategies
    const strategy1Code = document.getElementById('strategy1').value;
    const strategy2Code = document.getElementById('strategy2').value;
    
    // Run tournament
    const result = tournament.runPairwise(strategy1Code, strategy2Code);
    
    // Update chart titles
    document.getElementById('cooperation-chart-title').textContent = 'Cooperation Rate Over Time';
    document.getElementById('payoff-chart-title').textContent = 'Cumulative Payoffs';
    
    // Hide payoff matrix (only for round-robin)
    document.getElementById('payoff-matrix-container').style.display = 'none';
    
    // Display results
    visualizer.displayPairwiseSummary(result);
    visualizer.createCooperationChart(result.roundHistory, result.strategy1Name, result.strategy2Name);
    visualizer.createPayoffChart(result.roundHistory, result.strategy1Name, result.strategy2Name);
    visualizer.displayPairwiseTable(result);
}

function runRoundRobinMode(tournament) {
    // Run tournament
    const { matchResults, aggregated, payoffMatrix, strategyNames } = tournament.runRoundRobin();
    
    // Update chart titles
    document.getElementById('cooperation-chart-title').textContent = 'Average Cooperation Rate by Strategy';
    document.getElementById('payoff-chart-title').textContent = 'Average Score per Match';
    
    // Show payoff matrix container
    document.getElementById('payoff-matrix-container').style.display = 'block';
    
    // Display aggregated charts for all strategies
    visualizer.createRoundRobinCooperationChart(aggregated);
    visualizer.createRoundRobinPayoffChart(aggregated);
    
    // Display payoff matrix
    visualizer.displayPayoffMatrix(payoffMatrix, strategyNames);
    
    // Display summary and table
    visualizer.displayRoundRobinSummary(aggregated);
    visualizer.displayRoundRobinTable(matchResults, aggregated);
}

function validatePayoffMatrix(T, R, P, S) {
    // Standard Prisoner's Dilemma requires: T > R > P > S and 2R > T + S
    const condition1 = T > R && R > P && P > S;
    const condition2 = 2 * R > T + S;
    return condition1 && condition2;
}

// Add some helpful tooltips and information
document.addEventListener('DOMContentLoaded', () => {
    console.log('Prisoner\'s Dilemma Simulation loaded successfully!');
    console.log('Standard conditions: T > R > P > S and 2R > T + S');
    console.log('Default values: T=5, R=3, P=1, S=0');
    console.log('Random seed for reproducibility: Use same seed to get identical results');
});


