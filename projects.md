---
layout: default
---

<div style="display:flex; gap:14px; align-items:center; flex-wrap:wrap; margin-bottom:18px; font-size:0.95em;">
  <a href="./">Home</a> ·
  <a href="./research.html">Research</a> ·
  <a href="./achievements.html">Achievements</a> ·
  <a href="./pos.html">Statement of Purpose</a>
</div>

# Projects

Selected builds across competitions, research, and independent work.

---

## Competition Projects

**Synapse — Cross-Chain Investment Co-Pilot**  
*ETH Global '25*

AI-powered DeFi navigator that unifies fragmented wallets and protocols into an intent-driven interface. Users describe what they want in natural language; Synapse decomposes the intent into executable on-chain steps. Integrated **Ocean Protocol** for compute-to-data, **The Graph** and **Neo4j** for on-chain analytics, and **Circle SDK + CCTP** for cross-chain settlement.

---

**HomeOnTheEdge — AI Insurance Risk Platform**  
*Hacklytics '25*

Multi-agent, multimodal architecture predicting disaster risks and analyzing insurance coverage gaps for homeowners. Trained a multi-label **XGBoost** model on FEMA + NOAA historical data to forecast floods, hurricanes, and wildfires simultaneously. Achieved **AUC-ROC 0.9243, F1 0.73** across hazard categories. The platform flags coverage gaps between a user's actual policy and their predicted risk exposure.

---

**Autonomous Racing Agent**  
*AWS DeepRacer — Finalist, Top 0.80% Globally (19 / 2,362)*

Trained a continuous-control **PPO** agent for autonomous track racing. Designed reward functions incorporating speed, steering smoothness, and track-center deviation — learning a policy that balances aggression with stability. Reached finalist standing in the AWS DeepRacer Student League; ranked 19th out of 2,362 students globally in the July 2023 qualifier.

---

## Research & Systems Projects

**Re-ID and Realness Index API**  
*[GitHub](https://github.com/tirth5828)*

PyTorch-based person re-identification and spoof-detection API. Combines **ResNet embeddings** with **contrastive loss** for identity verification across camera views, paired with a realness classifier for liveness detection. Achieved 92% accuracy on a multi-camera dataset. Intended as infrastructure for security applications requiring reliable identity verification without facial recognition.

---

**Adaptive Game Agent — Real-Time Opponent Modelling**

A game-playing agent that learns opponent behavior in real time from user interactions using **online RL**. Adapts its policy dynamically without environment resets — no access to a simulator, no pre-collected dataset. The agent updates from a live stream of observations, demonstrating non-stationary policy adaptation in a setting where the "environment" is another learning agent.

---

**Political Bonds RAG**  
*[GitHub](https://github.com/tirth5828/Political-Bonds-RAG)*

Retrieval-augmented generation pipeline built over Indian political bonds data. Processes structured financial disclosure data into a queryable knowledge base, enabling natural-language analysis of political funding patterns.

---

## Exploration Projects

**Build Your Own Story**  
Interactive branching narrative engine powered by LLM-generated prompts and images. Users make choices at branch points; the LLM generates the next scene and a matching image, maintaining narrative consistency across branches.

**Traveling Salesman Problem via Quantum Computing**  
Implemented and analyzed QAOA and quantum annealing approaches to TSP. Companion to a [published article](https://medium.com/the-quantastic-journal/traveling-salesman-problem-using-quantum-computing-02ae6356544b) in *The Quantastic Journal* exploring practical quantum optimization for combinatorial problems.

---

[← Back to Home](./)
