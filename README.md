# Prisoner's Dilemma Simulation

An interactive web-based simulation tool demonstrating how cooperation emerges from simple interaction rules in the Iterated Prisoner's Dilemma (IPD).

## Features

- **Configurable Payoff Matrix**: Adjust T (Temptation), R (Reward), P (Punishment), and S (Sucker) values
- **Multiple Strategies**:
  - Always Cooperate (ALL-C)
  - Always Defect (ALL-D)
  - Tit-for-Tat (TFT)
  - Grim Trigger
  - Generous TFT
- **Two Tournament Modes**:
  - Pairwise: Two strategies compete head-to-head
  - Round-Robin: All strategies compete against each other
- **Real-time Visualizations**:
  - Cooperation rate over time
  - Cumulative payoffs
  - Detailed round-by-round results

## How to Run

### Option 1: Open Directly in Browser
1. Simply open `index.html` in any modern web browser (Chrome, Firefox, Safari, Edge)
2. No server or installation required!

### Option 2: Using a Local Server (Optional)
If you prefer using a local server:

```bash
# Using Python 3
python -m http.server 8000

# Or using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if you have http-server installed)
npx http-server
```

Then navigate to `http://localhost:8000` in your browser.

## Usage Instructions

### 1. Configure Payoff Matrix
- Set the payoff values:
  - **T (Temptation)**: Reward for defecting when opponent cooperates (default: 5)
  - **R (Reward)**: Reward for mutual cooperation (default: 3)
  - **P (Punishment)**: Punishment for mutual defection (default: 1)
  - **S (Sucker)**: Payoff for cooperating when opponent defects (default: 0)
- Standard Prisoner's Dilemma satisfies: T > R > P > S and 2R > T + S

### 2. Set Game Parameters
- **Number of Rounds**: Choose between 1-1000 rounds (default: 100)
- **Random Seed**: Set a seed for reproducibility (default: 42)
  - Same seed = same results every time
  - Important for Generous TFT strategy which uses randomness

### 3. Configure Strategy Parameters
- **Generous TFT Forgiveness Rate**: Adjust between 0.0 - 1.0 (default: 0.1)
  - Controls how often Generous TFT forgives a defection
  - 0.0 = never forgive (behaves like regular TFT)
  - 0.1 = 10% chance to forgive (default)
  - 1.0 = always forgive (very cooperative)
  - Applies to both pairwise and round-robin modes

### 4. Choose Tournament Mode

#### Pairwise Mode
- Select two strategies to compete against each other
- View detailed round-by-round interactions
- See how specific strategy matchups perform

#### Round-Robin Mode
- All strategies compete against each other
- See overall rankings and performance
- Compare strategies across multiple matchups

### 5. Run Simulation
- Click "Run Simulation" button
- Results will display automatically with:
  - Summary statistics
  - Cooperation rate chart
  - Cumulative payoff chart
  - Detailed results tables

## Strategy Descriptions

### Always Cooperate (ALL-C)
Always chooses to cooperate, regardless of opponent's actions.

### Always Defect (ALL-D)
Always chooses to defect, regardless of opponent's actions.

### Tit-for-Tat (TFT)
- Cooperates on the first move
- Then copies opponent's previous move
- Simple but highly effective strategy

### Grim Trigger
- Cooperates until opponent defects once
- After first defection, defects forever
- Unforgiving strategy

### Generous TFT
- Similar to Tit-for-Tat
- Has a configurable chance to forgive a defection (default: 10%)
- **Note**: When selected in pairwise mode, you can adjust the forgiveness rate (0.0 - 1.0)
- More robust in noisy environments

## Example Scenarios to Try

### Classic Matchup: TFT vs ALL-D
Shows how Tit-for-Tat quickly adapts to a defector.

### Cooperation Test: TFT vs TFT
Demonstrates stable mutual cooperation.

### Forgiveness Test: GRIM vs GTFT
Compare unforgiving vs forgiving strategies.

### Round-Robin Tournament
See which strategy performs best overall across all matchups.

### Test Reproducibility: GTFT vs ALL-D (seed 42 vs 123)
Run Generous TFT vs Always Defect with seed 42, then with seed 123 - you'll see different results due to randomness, but same seed always gives same results.

### Test Forgiveness Impact: GTFT with Different Rates
- Run GTFT vs ALL-D with forgiveness = 0.0 (never forgive) → behaves like regular TFT
- Run GTFT vs ALL-D with forgiveness = 0.1 (default) → occasionally forgives
- Run GTFT vs ALL-D with forgiveness = 0.5 (very forgiving) → much more cooperative
- Compare the scores to see how forgiveness affects performance!

## Interpreting Results

### Cooperation Rate Chart
- Shows percentage of cooperative moves over time
- Higher cooperation rate = more cooperative behavior
- Overall line shows system-wide cooperation

### Cumulative Payoff Chart
- Shows total points accumulated over time
- Strategy with higher final score "wins"
- Note: Highest scorer isn't always most cooperative!

### Key Insights
- **Mutual Cooperation (TFT vs TFT)**: Both get R points each round
- **Mutual Defection (ALL-D vs ALL-D)**: Both get P points (worst collective outcome)
- **Exploitation (ALL-D vs ALL-C)**: Defector gets T, cooperator gets S
- **Tit-for-Tat Success**: TFT often wins by being "nice, forgiving, and retaliatory"

## Technical Details

- **Technology**: Pure HTML, CSS, and JavaScript (no frameworks)
- **Visualization**: Chart.js for graphs
- **Browser Support**: All modern browsers (Chrome, Firefox, Safari, Edge)
- **Performance**: Can handle up to 1000 rounds efficiently
- **Reproducibility**: Seeded random number generator (Mulberry32) ensures identical results with same seed

## File Structure

```
/
├── index.html          # Main HTML structure
├── styles.css          # Styling and layout
├── simulation.js       # Game logic and strategies
├── visualization.js    # Chart rendering
├── app.js             # Application controller
└── README.md          # This file
```

## Extending the Simulation

Want to add more features? Here are some ideas:

1. **Add New Strategies**: Implement additional strategy classes in `simulation.js`
2. **Add Noise**: Introduce probability of action mistakes
3. **Variable Rounds**: Add probability-based continuation
4. **Export Results**: Add CSV/JSON export functionality
5. **Strategy Parameters**: Make strategy parameters (like GTFT forgiveness) configurable

## Credits

Created for Prisoner's Dilemma homework assignment.
Based on classical game theory research by Axelrod, Rapoport, and others.


