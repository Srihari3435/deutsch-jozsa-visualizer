let n = 1; // Number of qubits
let functionType = 'constant0'; // Default function
let step = 0; // Current step in algorithm
let state = []; // Quantum state vector
let targetState = []; // Target state for animation
let explanations = []; // Store explanations for display
let isAnimating = false; // Animation flag
let animationProgress = 0; // Animation progress (0 to 1)
let currentStepName = "Ready to Start";
let algorithmSteps = [
    "Initialize",
    "Apply Hadamard Gates", 
    "Apply Oracle",
    "Apply Hadamard Again",
    "Measure"
];
let autoRunning = false;

// Complex number operations
function complexMult(a, b) {
    return {
        re: a.re * b.re - a.im * b.im,
        im: a.re * b.im + a.im * b.re
    };
}

function complexAdd(a, b) {
    return {
        re: a.re + b.re,
        im: a.im + b.im
    };
}

function complexAbs(c) {
    return Math.sqrt(c.re * c.re + c.im * c.im);
}

function complexPhase(c) {
    return Math.atan2(c.im, c.re);
}

function setup() {
    let canvas = createCanvas(800, 400);
    canvas.parent('canvas');
    background(255);
    reset();
}

function draw() {
    background(255);
    
    // Title
    textSize(18);
    fill(0);
    textAlign(CENTER);
    text("Quantum State Visualization", width/2, 30);
    
    // Draw probability amplitudes with animation
    let numStates = 1 << n; // 2^n states
    let barWidth = Math.min(80, (width - 100) / numStates);
    let startX = (width - (numStates * barWidth)) / 2;
    
    for (let i = 0; i < numStates; i++) {
        let currentAmp = state[i] ? complexAbs(state[i]) : 0;
        let currentPhase = state[i] ? complexPhase(state[i]) : 0;
        
        // If animating, interpolate between current and target states
        if (isAnimating && targetState[i]) {
            let targetAmp = complexAbs(targetState[i]);
            let targetPhase = complexPhase(targetState[i]);
            
            // Smooth interpolation
            let easedProgress = easeInOutQuad(animationProgress);
            currentAmp = lerp(currentAmp, targetAmp, easedProgress);
            currentPhase = lerpAngle(currentPhase, targetPhase, easedProgress);
        }
        
        let x = startX + (i * barWidth);
        let barHeight = currentAmp * 200;
        
        // Draw amplitude bar with glow effect
        push();
        if (isAnimating) {
            // Add glow during animation
            drawingContext.shadowColor = 'rgba(0, 128, 255, 0.5)';
            drawingContext.shadowBlur = 10;
        }
        fill(0, 128, 255, 150);
        rect(x, 320 - barHeight, barWidth - 10, barHeight);
        pop();
        
        // Draw phase indicator (small colored circle)
        let phaseColor = map(currentPhase, -Math.PI, Math.PI, 0, 360);
        push();
        colorMode(HSB);
        fill(phaseColor, 80, 80);
        if (isAnimating) {
            // Pulsing effect during animation
            let pulseSize = 10 + sin(frameCount * 0.2) * 2;
            ellipse(x + barWidth/2 - 5, 320 - barHeight - 15, pulseSize, pulseSize);
        } else {
            ellipse(x + barWidth/2 - 5, 320 - barHeight - 15, 10, 10);
        }
        pop();
        
        // Labels
        fill(0);
        textAlign(CENTER);
        textSize(12);
        text(`|${i.toString(2).padStart(n, '0')}>`, x + barWidth/2 - 5, 340);
        text(`${currentAmp.toFixed(3)}`, x + barWidth/2 - 5, 355);
        
        // Phase label
        textSize(10);
        text(`${(currentPhase * 180 / Math.PI).toFixed(0)}°`, x + barWidth/2 - 5, 370);
    }
    
    // Legend
    textAlign(LEFT);
    textSize(12);
    fill(0);
    text("Blue bars: Amplitude", 20, height - 40);
    text("Colored circles: Phase", 20, height - 25);
    text("Step: " + step + "/4", 20, height - 10);
    
    // Update animation
    if (isAnimating) {
        animationProgress += 0.02; // Adjust speed here
        if (animationProgress >= 1) {
            isAnimating = false;
            animationProgress = 0;
            // Copy target state to current state
            for (let i = 0; i < state.length; i++) {
                state[i] = { ...targetState[i] };
            }
            updateUI();
        }
    }
}

function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function lerpAngle(a, b, t) {
    let diff = b - a;
    if (diff > Math.PI) diff -= 2 * Math.PI;
    if (diff < -Math.PI) diff += 2 * Math.PI;
    return a + diff * t;
}

function reset() {
    step = 0;
    n = parseInt(document.getElementById('qubits').value);
    functionType = document.getElementById('functionType').value;
    initializeState();
    explanations = [];
    isAnimating = false;
    animationProgress = 0;
    currentStepName = "Ready to Start";
    autoRunning = false;
    updateUI();
    document.getElementById('explanation').innerHTML = '';
    updateExplanation();
}

function initializeState() {
    let numStates = 1 << n; // 2^n states
    state = Array(numStates).fill(0).map(() => ({ re: 0, im: 0 }));
    targetState = Array(numStates).fill(0).map(() => ({ re: 0, im: 0 }));
    state[0] = { re: 1, im: 0 }; // Start in |0...0>
    targetState[0] = { re: 1, im: 0 };
}

function applyHadamardAnimated() {
    let numStates = 1 << n;
    let newState = Array(numStates).fill(0).map(() => ({ re: 0, im: 0 }));
    let norm = 1 / Math.sqrt(numStates);
    
    for (let i = 0; i < numStates; i++) {
        for (let j = 0; j < numStates; j++) {
            let parity = bitCount(i & j) % 2;
            let sign = parity === 0 ? 1 : -1;
            newState[i].re += state[j].re * sign * norm;
            newState[i].im += state[j].im * sign * norm;
        }
    }
    
    // Set target state and start animation
    targetState = newState;
    isAnimating = true;
    animationProgress = 0;
}

function applyOracleAnimated() {
    let numStates = 1 << n;
    let newState = Array(numStates).fill(0).map(() => ({ re: 0, im: 0 }));
    
    for (let i = 0; i < numStates; i++) {
        let fx = evaluateFunction(i);
        let phase = fx === 1 ? -1 : 1; // (-1)^f(x)
        newState[i].re = state[i].re * phase;
        newState[i].im = state[i].im * phase;
    }
    
    // Set target state and start animation
    targetState = newState;
    isAnimating = true;
    animationProgress = 0;
}

function evaluateFunction(x) {
    if (functionType === 'constant0') return 0;
    if (functionType === 'constant1') return 1;
    // Balanced: f(x) = x_0 (first bit) for simplicity
    if (n === 1) return x & 1;
    // For n > 1, balanced means half the inputs give 0, half give 1
    return bitCount(x) % 2;
}

function bitCount(x) {
    let count = 0;
    while (x) {
        count += x & 1;
        x >>= 1;
    }
    return count;
}

function nextStep() {
    if (isAnimating || autoRunning) return;
    
    if (step === 0) {
        // Step 1: Apply Hadamard to all qubits
        step++;
        currentStepName = algorithmSteps[step];
        applyHadamardAnimated();
        explanations.push(`
            <h4>Step ${step}: Apply Hadamard Gates</h4>
            <p>Apply Hadamard gates to all ${n} qubits to create a superposition of all possible states.</p>
            <div class="math">
                <p>Initial state: |ψ⟩ = |0⟩<sup>⊗${n}</sup></p>
                <p>Hadamard on n qubits: H<sup>⊗${n}</sup> |0⟩<sup>⊗${n}</sup> = (1/√${1 << n}) ∑<sub>x</sub> |x⟩</p>
                <p>State: |ψ⟩ = (1/√${1 << n}) ∑<sub>x=0</sub><sup>${(1 << n) - 1}</sup> |x⟩</p>
            </div>
        `);
    } else if (step === 1) {
        // Step 2: Apply Oracle
        step++;
        currentStepName = algorithmSteps[step];
        applyOracleAnimated();
        explanations.push(`
            <h4>Step ${step}: Apply Oracle</h4>
            <p>The oracle applies a phase shift based on the function f(x): U_f |x⟩ = (-1)<sup>f(x)</sup> |x⟩</p>
            <div class="math">
                <p>Function type: ${functionType.replace('constant0', 'f(x) = 0').replace('constant1', 'f(x) = 1').replace('balanced', 'f(x) = balanced')}</p>
                <p>State: |ψ⟩ = (1/√${1 << n}) ∑<sub>x</sub> (-1)<sup>f(x)</sup> |x⟩</p>
            </div>
        `);
    } else if (step === 2) {
        // Step 3: Apply Hadamard again
        step++;
        currentStepName = algorithmSteps[step];
        applyHadamardAnimated();
        explanations.push(`
            <h4>Step ${step}: Apply Hadamard Gates Again</h4>
            <p>Apply Hadamard gates again to interfere the states, revealing whether the function is constant or balanced.</p>
            <div class="math">
                <p>State: |ψ⟩ = (1/${1 << n}) ∑<sub>y</sub> ∑<sub>x</sub> (-1)<sup>f(x) + x·y</sup> |y⟩</p>
                <p>For constant f, |0⟩<sup>⊗${n}</sup> has amplitude ±1; for balanced f, it has amplitude 0.</p>
            </div>
        `);
    } else if (step === 3) {
        // Step 4: Measurement
        step++;
        currentStepName = algorithmSteps[step];
        let result = measure();
        explanations.push(`
            <h4>Step ${step}: Measurement</h4>
            <p>Measure the qubits. If the result is |0⟩<sup>⊗${n}</sup>, the function is constant; otherwise, it's balanced.</p>
            <div class="math">
                <p>Measurement outcome: |${result.toString(2).padStart(n, '0')}⟩</p>
                <p>Conclusion: Function is ${result === 0 ? 'constant' : 'balanced'}</p>
                <p>Amplitude of |0⟩: ${complexAbs(state[0]).toFixed(3)}</p>
            </div>
        `);
        updateExplanation();
        updateUI();
        return;
    }
    
    updateExplanation();
}
function updateUI() {
    document.getElementById('currentStep').textContent = currentStepName;
    
    let descriptions = [
        "Click 'Start Algorithm' to begin the Deutsch-Jozsa algorithm demonstration.",
        "Quantum states are now in superposition. Click 'Next Step' to apply the oracle.",
        "Oracle has been applied. Click 'Next Step' to apply Hadamard gates again.",
        "Second Hadamard transformation complete. Click 'Next Step' to measure.",
        "Algorithm complete! Check the measurement result to determine if the function is constant or balanced."
    ];
    
    document.getElementById('stepDescription').textContent = descriptions[step];
    
    let nextBtn = document.getElementById('nextStepBtn');
    if (step === 0) {
        nextBtn.textContent = "Start Algorithm";
    } else if (step < 4) {
        nextBtn.textContent = "Next Step";
    } else {
        nextBtn.textContent = "Algorithm Complete";
        nextBtn.disabled = true;
    }
    
    if (step === 4) {
        nextBtn.disabled = true;
    } else {
        nextBtn.disabled = false;
    }
}

function measure() {
    // Check if |0...0> has significant amplitude
    let zeroAmp = complexAbs(state[0]);
    return zeroAmp > 0.5 ? 0 : 1;
}

function updateExplanation() {
    document.getElementById('explanation').innerHTML = explanations.slice(0, step).join('');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('qubits').addEventListener('change', reset);
    document.getElementById('functionType').addEventListener('change', reset);
    reset(); // Initialize the UI
});