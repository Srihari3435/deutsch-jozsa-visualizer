# Deutsch-Jozsa-visualizer
An interactive visualization of the Deutsch-Jozsa quantum algorithm using p5.js. Learn how quantum computing achieves exponential speedup through superposition, parallelism, and interference—all in one click.

# Live Demo
Explore the project live at: https://srihari3435.github.io/deutsch-jozsa-visualizer/

# Features
Interactive Controls: Select 1–3 qubits and function type (Constant f(x)=0, f(x)=1, or Balanced).
Visualization: Real-time p5.js canvas showing quantum state amplitudes and phases.
Educational: Detailed explanations with mathematical derivations for each step (superposition, oracle, interference, measurement).


# Technologies Used

HTML/CSS: Structured layout and styling.
JavaScript: Core logic for quantum state calculations and UI interactions.
p5.js: Visualization of quantum states.

# How It Works

The Deutsch-Jozsa algorithm solves the problem of determining if a function f(x) is:

Constant: Same output (0 or 1) for all inputs.
Balanced: Outputs 0 for half the inputs and 1 for the other half.

Classically, this requires up to 2^(n-1)+1 queries. The quantum algorithm uses:

Superposition: Hadamard gates create a state |ψ⟩ = (1/√2^n)∑|x⟩.
Oracle: Applies phase (-1)^f(x) to encode function behavior.
Interference: Hadamard gates cause constructive/destructive interference.
Measurement: |0⟩^⊗n indicates constant; other states indicate balanced.

Usage

Select the number of qubits (1–3) and function type.
Click "Start Algorithm" to step wise execute and continue execution by clicking next step.
Observe the canvas for amplitude/phase visualizations and read mathematical explanations below.


# Contact
Connect with me on LinkedIn or open an issue for feedback! : linkedin.com/in/srihari-kulkarni-8aa25a290

