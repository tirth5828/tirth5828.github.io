---
layout: default
---

<div style="display:flex; gap:14px; align-items:center; flex-wrap:wrap; margin-bottom:18px; font-size:0.95em;">
  <a href="./">Home</a> ·
  <a href="./projects.html">Projects</a> ·
  <a href="./achievements.html">Achievements</a> ·
  <a href="./pos.html">Statement of Purpose</a>
</div>

# Research

My research addresses a shared challenge across different domains: **AI systems that must reason reliably under uncertainty, adversarial conditions, and compositional complexity.** I work across security, privacy, multi-agent RL, and graph-structured representations — unified by a focus on failure modes that only appear in realistic, multi-component environments.

---

## Publications

### ✅ Published

**Hierarchical Graph Representation for Multi-Chain Blockchain Routing**  
*Tirth Joshi, Honggang Wang*  
**IEEE ICNC 2026 — Invited Paper, Main Program** · [PDF](http://www.conf-icnc.org/2026/papers/p921-joshi.pdf)

Existing DeFi routing models treat assets as flat objects, ignoring that many digital assets are compositionally built from others — LP shares, vault tokens, and wrapped assets all require prerequisite holdings. This paper formalizes cross-chain routing as a **hierarchical sequential optimization problem** over AND/OR dependency graphs, where "OR" nodes represent choices (swaps) and "AND" nodes represent requirements (multi-asset construction). The proposed GHP algorithm exploits the empirical observation that dependency chains in real DeFi systems are shallow, enabling near-optimal routing **8× faster** than exact methods, with solutions within 5% of optimal across tens of thousands of tokens on dozens of chains.

---

### 🔄 Under Review

**Measuring the Statistical Erosion of Anonymity: A Historical Analysis of Re-Identification Potential**  
*Tirth Joshi, Aaron Ross*  
**ACM FAccT (Under Review)**

Introduces the **Re-Identification Pressure Index (RPI)** — a metric quantifying how cumulative data releases and cross-linkages erode individual anonymity over time. Treats privacy not as a binary property but as a continuous quantity that degrades as public datasets accumulate and intersect. The framework tracks re-identification risk across historical data release timelines, providing a principled tool for regulators and dataset curators to assess when a body of releases collectively crosses a risk threshold.

---

**Formalizing Compositional Privacy Risks in Non-Face Re-Identification**  
**ECCV (Under Review)**

Addresses re-identification risk in multi-modal settings where no single signal is identifying, but combined signals (gait, clothing, body shape, behavior) enable re-identification over time. Formalizes **compositional re-identification risk** as datasets and models accumulate non-facial signals, and measures how this risk compounds even in the absence of explicit identifiers. Complements the RPI work by extending the framework from tabular data releases to vision-based, cross-dataset settings.

---

**Soft-Landing Liquidations for Overcollateralized Lending**  
**DeDeFi Workshop (Under Review)**

Current DeFi lending protocols use hard liquidations — a borrower's collateral is sold abruptly when a threshold is crossed, generating bad debt and market instability. This paper introduces **SLLA (Soft-Landing Liquidation Architecture)**, replacing hard liquidations with smooth, tranche-based auctions. Models liquidation sequencing as a **constrained sequential control problem**, demonstrating ~45% reduction in bad debt compared to hard liquidation baselines.

---

### ✅ Presented

**Do Phonetic Patterns Predict Grammatical Structure?**  
*Poster — DuckAI 2025 (Stevens Institute of Technology) · Slides — YU CSE Day 2025*  
🏆 **Best Research Award**, YU CSE Day 2025

A cross-linguistic ML study investigating whether surface-level phonetic features (derived from IPA-converted parallel Bible corpora) carry information about deep grammatical structure across typologically diverse languages. Uses standard classifiers across a broad sample of world languages to test the hypothesis that phonology and syntax are not fully independent.

---

## Research Areas

### Multi-Agent Reinforcement Learning
Designing coordination policies for heterogeneous agents under partial observability. Current system pairs a humanoid robot with a remote-controlled vehicle, each equipped with vision, audio, and motion modalities. Key challenges: sensor fusion under noise, inter-agent communication overhead, and real-time control without centralized state.

### LLM-Based Security Analysis
Building detection frameworks for smart contract vulnerabilities using LLM reasoning augmented with RL-style feedback. Focus on underrepresented vulnerability classes — patterns rare in training data that standard detectors miss. Synthetic data generation pipeline targets adversarial samples and zero-day patterns.

### Graph Representations for Complex Systems
Applying hierarchical and dependency-aware graph representations to multi-chain ecosystems and beyond. Interested in cases where the topology of dependencies, not just node features, determines the validity of solutions.

### Privacy Theory & Fairness
Formalizing how privacy degrades compositionally — across time, datasets, modalities, and models. Developing metrics that are actionable for policymakers, not just descriptive for researchers.

---

## Research Advisors

- **Prof. Shucheng Yu** — LLM security, adversarial ML
- **Prof. Honggang Wang** — Multi-modal systems, graph-based routing, IoT · *Editor-in-Chief, IEEE Transactions on Multimedia*
- **Prof. Aaron Ross** — Privacy, fairness, data ethics

---

[← Back to Home](./)
