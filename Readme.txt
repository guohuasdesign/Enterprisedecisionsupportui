IDSS: Intelligent Decision Support
System
Project Overview
This Intelligent Decision Support System (IDSS) is a sophisticated multi-agent platform
designed to optimize maritime logistics and resource management. By integrating real-time
external data with internal ERP resources, the system provides decision-makers with three
distinct, probability-weighted scenarios to streamline complex operations.
The system acts as an "AI Brain," orchestrating various specialized agents to handle everything
from legal compliance to ship rerouting, eventually closing the loop by training models based on
decision feedback.
System Architecture
1. Multi-Agent Layer
The core functionality is distributed across specialized agents built and managed via N8N:
● News Agent: Monitors global events affecting maritime routes.
● Legal Agent: Ensures compliance with international maritime laws and regulations.
● Ship Route Controlling Agent: Manages navigation and real-time positioning.
● Incident Agent: Detects and analyzes disruptions or emergencies.
2. Orchestration & Intelligence
● Main Orchestrating Agent: The central AI "Brain" that synthesizes agent outputs and
Internal ERP inputs (shareholder factors & company resources).
● Mathematical Models: Employs supervised models to calculate costs, probability, and
impact scales for three generated scenarios.
3. Execution Pipeline
● Frontend: Developed with V0, providing a modern UI for decision-makers.
● Backend: Connected via JSON HTTP requests to the N8N orchestration flows.
● Geospatial Logic: Uses GeoJSON for precise ship location tracking and incident-based
rerouting.
● Integration: Final decisions are implemented directly into the ERP workflow as the
production platform.
Tech Stack
● Workflow Automation: N8N (Agent management & orchestration)
● Frontend: V0 (React-based UI)
● Data Format: JSON & GeoJSON
● Version Control: GitHub
● Design/Logic Mapping: Miro
Repository Structure
All core logic, workflows, and models are stored in JSON format for easy versioning and
deployment:
● /n8n-workflows/: Contains the exported JSON files for the agent flows.
● /models/: JSON representations of the mathematical supervised models.
● /data-engineering/: Data transformation and engineering scripts (JSON).
● /design/: Exported Miro boards and architectural diagrams (JSON/PDF).
Future Roadmap
● Feedback Loop: Implement a data-capture mechanism to record the outcomes of
chosen scenarios.
● Continuous Learning: Use decision feedback to re-train the supervised models,
improving probability accuracy over time.
Note for Contributors: Ensure all JSON exports from N8N are validated before pushing to the
repository to maintain workflow integrity.
