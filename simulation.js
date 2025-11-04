// Prisoner's Dilemma Game Engine and Strategies

// Actions
const COOPERATE = 'C';
const DEFECT = 'D';

// Seeded Random Number Generator (using Mulberry32 algorithm)
class SeededRandom {
    constructor(seed) {
        this.seed = seed;
    }

    // Generate random number between 0 and 1
    random() {
        let t = this.seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

    // Reset to initial seed
    reset(seed) {
        this.seed = seed;
    }
}

// Global random instance (will be set from UI)
let globalRandom = new SeededRandom(42);

// Payoff Matrix Class
class PayoffMatrix {
    constructor(T = 5, R = 3, P = 1, S = 0) {
        this.T = T; // Temptation (defect while opponent cooperates)
        this.R = R; // Reward (both cooperate)
        this.P = P; // Punishment (both defect)
        this.S = S; // Sucker (cooperate while opponent defects)
    }

    getPayoff(action1, action2) {
        if (action1 === COOPERATE && action2 === COOPERATE) {
            return [this.R, this.R];
        } else if (action1 === COOPERATE && action2 === DEFECT) {
            return [this.S, this.T];
        } else if (action1 === DEFECT && action2 === COOPERATE) {
            return [this.T, this.S];
        } else { // both defect
            return [this.P, this.P];
        }
    }
}

// Base Strategy Class
class Strategy {
    constructor(name) {
        this.name = name;
        this.history = [];
        this.opponentHistory = [];
        this.score = 0;
    }

    // To be implemented by subclasses
    makeMove() {
        throw new Error('makeMove() must be implemented');
    }

    // Record the move made this round
    recordMove(myMove, opponentMove) {
        this.history.push(myMove);
        this.opponentHistory.push(opponentMove);
    }

    // Update score after a round
    updateScore(payoff) {
        this.score += payoff;
    }

    // Reset for a new game
    reset() {
        this.history = [];
        this.opponentHistory = [];
        this.score = 0;
    }

    // Get cooperation rate
    getCooperationRate() {
        if (this.history.length === 0) return 0;
        const cooperations = this.history.filter(move => move === COOPERATE).length;
        return cooperations / this.history.length;
    }
}

// Always Cooperate Strategy
class AlwaysCooperate extends Strategy {
    constructor() {
        super('Always Cooperate (ALL-C)');
    }

    makeMove() {
        return COOPERATE;
    }
}

// Always Defect Strategy
class AlwaysDefect extends Strategy {
    constructor() {
        super('Always Defect (ALL-D)');
    }

    makeMove() {
        return DEFECT;
    }
}

// Tit-for-Tat Strategy
class TitForTat extends Strategy {
    constructor() {
        super('Tit-for-Tat (TFT)');
    }

    makeMove() {
        // Cooperate on first move, then copy opponent's previous move
        if (this.opponentHistory.length === 0) {
            return COOPERATE;
        }
        return this.opponentHistory[this.opponentHistory.length - 1];
    }
}

// Grim Trigger Strategy
class GrimTrigger extends Strategy {
    constructor() {
        super('Grim Trigger');
        this.triggered = false;
    }

    makeMove() {
        // Cooperate until opponent defects once, then defect forever
        if (this.triggered) {
            return DEFECT;
        }
        
        if (this.opponentHistory.length > 0) {
            const lastOpponentMove = this.opponentHistory[this.opponentHistory.length - 1];
            if (lastOpponentMove === DEFECT) {
                this.triggered = true;
                return DEFECT;
            }
        }
        
        return COOPERATE;
    }

    reset() {
        super.reset();
        this.triggered = false;
    }
}

// Generous Tit-for-Tat Strategy
class GenerousTitForTat extends Strategy {
    constructor(forgiveness = 0.1) {
        super('Generous TFT');
        this.forgiveness = forgiveness; // Probability of forgiving a defection
    }

    makeMove() {
        // Cooperate on first move
        if (this.opponentHistory.length === 0) {
            return COOPERATE;
        }
        
        const lastOpponentMove = this.opponentHistory[this.opponentHistory.length - 1];
        
        // If opponent cooperated, cooperate
        if (lastOpponentMove === COOPERATE) {
            return COOPERATE;
        }
        
        // If opponent defected, forgive with some probability
        if (globalRandom.random() < this.forgiveness) {
            return COOPERATE;
        }
        
        return DEFECT;
    }
}

// Strategy Factory
class StrategyFactory {
    static createStrategy(strategyCode, params = {}) {
        switch(strategyCode) {
            case 'ALLC':
                return new AlwaysCooperate();
            case 'ALLD':
                return new AlwaysDefect();
            case 'TFT':
                return new TitForTat();
            case 'GRIM':
                return new GrimTrigger();
            case 'GTFT':
                const forgiveness = params.forgiveness !== undefined ? params.forgiveness : 0.1;
                return new GenerousTitForTat(forgiveness);
            default:
                throw new Error(`Unknown strategy: ${strategyCode}`);
        }
    }

    static getAllStrategyCodes() {
        return ['ALLC', 'ALLD', 'TFT', 'GRIM', 'GTFT'];
    }
}

// Game Class - manages a single match between two strategies
class Game {
    constructor(strategy1, strategy2, payoffMatrix, numRounds, continuationProb = null) {
        this.strategy1 = strategy1;
        this.strategy2 = strategy2;
        this.payoffMatrix = payoffMatrix;
        this.numRounds = numRounds;
        this.continuationProb = continuationProb; // For indefinite horizon
        this.roundHistory = [];
    }

    playRound() {
        // Both strategies make their moves
        const move1 = this.strategy1.makeMove();
        const move2 = this.strategy2.makeMove();

        // Get payoffs
        const [payoff1, payoff2] = this.payoffMatrix.getPayoff(move1, move2);

        // Record moves and update scores
        this.strategy1.recordMove(move1, move2);
        this.strategy2.recordMove(move2, move1);
        this.strategy1.updateScore(payoff1);
        this.strategy2.updateScore(payoff2);

        // Store round history
        this.roundHistory.push({
            round: this.roundHistory.length + 1,
            move1: move1,
            move2: move2,
            payoff1: payoff1,
            payoff2: payoff2,
            cumScore1: this.strategy1.score,
            cumScore2: this.strategy2.score
        });

        return {
            move1, move2, payoff1, payoff2
        };
    }

    play() {
        // Reset strategies before starting
        this.strategy1.reset();
        this.strategy2.reset();
        this.roundHistory = [];

        // Check if using indefinite horizon or fixed rounds
        if (this.continuationProb !== null) {
            // Indefinite horizon: continue with probability
            const maxRounds = 10000; // Safety limit to prevent infinite loops
            let roundCount = 0;
            
            // Play at least one round
            this.playRound();
            roundCount++;
            
            // Continue playing while random number is less than continuation probability
            while (globalRandom.random() < this.continuationProb && roundCount < maxRounds) {
                this.playRound();
                roundCount++;
            }
            
            if (roundCount >= maxRounds) {
                console.warn(`Game reached maximum round limit of ${maxRounds} rounds`);
            }
        } else {
            // Fixed rounds
            for (let i = 0; i < this.numRounds; i++) {
                this.playRound();
            }
        }

        return {
            strategy1Name: this.strategy1.name,
            strategy2Name: this.strategy2.name,
            finalScore1: this.strategy1.score,
            finalScore2: this.strategy2.score,
            cooperationRate1: this.strategy1.getCooperationRate(),
            cooperationRate2: this.strategy2.getCooperationRate(),
            roundHistory: this.roundHistory
        };
    }
}

// Tournament Class - manages multiple games
class Tournament {
    constructor(payoffMatrix, numRounds, strategyParams = {}, continuationProb = null) {
        this.payoffMatrix = payoffMatrix;
        this.numRounds = numRounds;
        this.continuationProb = continuationProb; // For indefinite horizon
        this.strategyParams = strategyParams; // Parameters for strategies (e.g., forgiveness for GTFT)
        this.results = [];
    }

    // Pairwise tournament: two strategies play against each other
    runPairwise(strategyCode1, strategyCode2) {
        const strategy1 = StrategyFactory.createStrategy(strategyCode1, this.strategyParams);
        const strategy2 = StrategyFactory.createStrategy(strategyCode2, this.strategyParams);

        const game = new Game(strategy1, strategy2, this.payoffMatrix, this.numRounds, this.continuationProb);
        const result = game.play();

        this.results = [result];
        return result;
    }

    // Round-robin tournament: all strategies play against each other
    runRoundRobin() {
        const strategyCodes = StrategyFactory.getAllStrategyCodes();
        this.results = [];
        const matchResults = [];

        // Create payoff matrix (strategy name -> strategy name -> score)
        const payoffMatrix = {};
        const strategyNames = strategyCodes.map(code => StrategyFactory.createStrategy(code, this.strategyParams).name);
        
        // Initialize payoff matrix
        strategyNames.forEach(name1 => {
            payoffMatrix[name1] = {};
            strategyNames.forEach(name2 => {
                payoffMatrix[name1][name2] = null; // null means no match yet
            });
        });

        // Play each pair
        for (let i = 0; i < strategyCodes.length; i++) {
            for (let j = i + 1; j < strategyCodes.length; j++) {
                const strategy1 = StrategyFactory.createStrategy(strategyCodes[i], this.strategyParams);
                const strategy2 = StrategyFactory.createStrategy(strategyCodes[j], this.strategyParams);

                const game = new Game(strategy1, strategy2, this.payoffMatrix, this.numRounds, this.continuationProb);
                const result = game.play();
                
                matchResults.push(result);
                
                // Store in payoff matrix
                payoffMatrix[result.strategy1Name][result.strategy2Name] = result.finalScore1;
                payoffMatrix[result.strategy2Name][result.strategy1Name] = result.finalScore2;
            }
        }

        // Also play against themselves
        for (let i = 0; i < strategyCodes.length; i++) {
            const strategy1 = StrategyFactory.createStrategy(strategyCodes[i], this.strategyParams);
            const strategy2 = StrategyFactory.createStrategy(strategyCodes[i], this.strategyParams);

            const game = new Game(strategy1, strategy2, this.payoffMatrix, this.numRounds, this.continuationProb);
            const result = game.play();
            
            // Store in payoff matrix (diagonal)
            payoffMatrix[result.strategy1Name][result.strategy1Name] = result.finalScore1;
        }

        // Aggregate results by strategy
        const aggregated = {};
        strategyCodes.forEach(code => {
            const strategy = StrategyFactory.createStrategy(code, this.strategyParams);
            aggregated[strategy.name] = {
                totalScore: 0,
                gamesPlayed: 0,
                cooperationRate: 0,
                cooperationCount: 0
            };
        });

        matchResults.forEach(result => {
            // Update strategy 1
            aggregated[result.strategy1Name].totalScore += result.finalScore1;
            aggregated[result.strategy1Name].gamesPlayed++;
            aggregated[result.strategy1Name].cooperationCount += result.cooperationRate1;

            // Update strategy 2
            aggregated[result.strategy2Name].totalScore += result.finalScore2;
            aggregated[result.strategy2Name].gamesPlayed++;
            aggregated[result.strategy2Name].cooperationCount += result.cooperationRate2;
        });

        // Calculate averages
        Object.keys(aggregated).forEach(strategyName => {
            const data = aggregated[strategyName];
            data.averageScore = data.totalScore / data.gamesPlayed;
            data.cooperationRate = data.cooperationCount / data.gamesPlayed;
        });

        this.results = matchResults;
        return {
            matchResults: matchResults,
            aggregated: aggregated,
            payoffMatrix: payoffMatrix,
            strategyNames: strategyNames
        };
    }
}

