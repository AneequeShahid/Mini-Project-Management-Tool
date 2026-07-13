# The Grand Demo: "A Day in the Life of Gravity"

This script outlines the narrative for the project demo video. The goal is to show the **Cohesive Flow** of the system, not just a list of features.

## 🎬 Scene 1: The Trigger (The la-Infrastructure)
**Visual**: Split screen. Left side: GitHub PR merged. Right side: Gravity Dashboard.
- **Action**: Merge a PR.
- **Narrative**: "It starts with a merge. The moment code hits main, Gravity's Event Bus triggers a chain reaction."
- **Highlight**: Show the `OutboundWebhook` firing and the Event Bus logs in the terminal.

## 🎬 Scene 2: The Intelligence (The AI-OS)
**Visual**: The AI Chat window.
- **Action**: Ask: *"How does this PR affect our sprint risk?"*
- **Narrative**: "The Router Agent recognizes this as a risk assessment. It activates the Architect and QA agents. They traverse the Knowledge Graph to find dependencies."
- **Highlight**: Show the "Reasoning" steps (Thought $\rightarrow$ Tool $\rightarrow$ Observation).

## 🎬 Scene 3: The Digital Twin (Knowledge Graph)
**Visual**: The Interactive Graph Visualization.
- **Action**: Click the new Task created by the PR.
- **Narrative**: "Gravity doesn't just store tasks; it maps them. We can see exactly how this change ripples through the project, identifying potential bottlenecks before they happen."
- **Highlight**: The graph nodes lighting up and showing the "Critical Path."

## 🎬 Scene 4: The Human-in-the-Loop (Governance)
**Visual**: The Proposal Queue.
- **Action**: AI suggests: *"I recommend moving the Sprint deadline by 2 days due to the new dependency."* User clicks **Approve**.
- **Narrative**: "AI proposes, humans dispose. High-risk actions enter the Review Queue, ensuring the AI remains an assistant, not a replacement."
- **Highlight**: The transition from 'Pending' to 'Approved' and the subsequent DB update.

## 🎬 Scene 5: The Narrative (Experience)
**Visual**: The "Project Story" and "Wrapped" view.
- **Action**: Switch to the Story view.
- **Narrative**: "At the end of the day, the la-Infrastructure turns raw data into a story. No more boring spreadsheets—just a narrative of progress and a 'Wrapped' recap of the team's wins."
- **Highlight**: Animated "Wrapped" slides and the AI-generated sprint story.

## 🏁 Outro
**Visual**: Architecture Diagram.
- **Narrative**: "Gravity: An AI-native project intelligence platform. Moving from tracking work to understanding it."
