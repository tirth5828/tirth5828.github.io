---
layout: default
---

<div style="display:flex; gap:14px; align-items:center; flex-wrap:wrap; margin-bottom:18px; font-size:0.95em;">
  <a href="./">Home</a> ·
  <a href="./research.html">Research</a> ·
  <a href="./projects.html">Projects</a> ·
  <a href="./achievements.html">Achievements</a>
</div>

# Statement of Purpose

---

I became interested in AI not through a course or a paper, but through a specific kind of frustration — the moment when a system that worked beautifully in isolation completely failed when placed inside a real environment. I kept encountering this. A routing algorithm that assumed flat asset structures and produced impossible paths. A detection model that missed vulnerability classes it had never seen. An RL agent that knew how to win against one opponent and fell apart against another.

These failures share a structure. They happen when a model's assumptions about the world don't match the actual dependencies, distributions, and adversaries it will face. My research is, at its core, an attempt to build systems that don't make those assumptions silently.

---

## What I Work On

**Graph representations for compositional problems.** My IEEE ICNC 2026 paper on multi-chain blockchain routing grew out of observing that existing DeFi routers treated all assets as equivalent nodes in a flat graph. But many assets are compositionally dependent — you can't hold a liquidity pool share without first holding the underlying pair. Formalizing this as a hierarchical AND/OR dependency graph and designing an algorithm that exploits the empirical shallowness of those dependency chains produced a routing system 8× faster than prior approaches with solutions within 5% of optimal. The lesson wasn't specific to DeFi; it was about what happens when you model structure honestly.

**Privacy as a continuous, compositional quantity.** With Prof. Aaron Ross, I've been developing the Re-Identification Pressure Index — a framework that tracks how anonymity erodes over time as data releases accumulate. Separately, a parallel project under ECCV review formalizes how non-facial signals (gait, posture, behavior) compound re-identification risk across datasets even when no single signal is identifying. The shared idea is that privacy isn't a threshold you either meet or don't — it's a quantity that degrades with each new intersection, and we need tools that measure that degradation.

**Reinforcement learning under partial observability.** With Prof. Honggang Wang, I'm designing coordination policies for heterogeneous IoT agents — a humanoid robot and a remote-controlled vehicle — that must jointly optimize under real-time constraints with noisy sensors and incomplete inter-agent communication. The challenge isn't just training good individual policies; it's that each agent's environment is non-stationary because the other agent is learning too.

---

## How I Think

I came to graduate research through industry. Working as an AI engineer at DZap taught me how fast heuristic systems hit their limits in production — when market conditions shift, when adversarial inputs appear, when the real data-generating process turns out to be more complex than the model assumed. That experience shaped a strong preference for methods that are **explicit about their assumptions** and designed to fail gracefully when those assumptions are violated.

I think about problems in terms of their failure modes first. A model that achieves 95% accuracy on a benchmark concerns me less than understanding what the 5% looks like and whether it clusters around important cases. I'd rather understand a phenomenon clearly than optimize a metric well.

---

## Where I'm Going

My goal is to continue contributing to AI research that is **principled about uncertainty, honest about limitations, and designed for deployment** — not just evaluation. I'm particularly drawn to problems at the intersection of learning and structure: where the topology of a problem (its dependencies, its hierarchy, its adversaries) constrains what a good solution can look like.

I'm drawn to research environments that reward careful, slow thinking over rapid publication — where a paper earns its place by genuinely advancing understanding, not by occupying territory.

---

*Depth over breadth. Systems over demos. Clarity over hype.*

---

[← Back to Home](./)
