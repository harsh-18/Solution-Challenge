# ReliefSetu 🌉

> AI-powered field intelligence and volunteer dispatch platform for Indian NGOs.

Built for the **Google Solution Challenge**, ReliefSetu bridges the gap between on-the-ground field reports and actionable task dispatching. It leverages modern web technologies and AI processing to streamline disaster relief, resource allocation, and volunteer coordination.

## 🚀 Features

- **Field Report Intake**: Submit and analyze field intelligence rapidly.
- **AI-Powered Extraction**: Automatically parse and categorize critical information from reports using Gemini AI.
- **Command Center Dashboard**: Real-time overview of active tasks, unassigned reports, and resource statuses.
- **Task Queue & Volunteer Matching**: Intelligently match tasks to available and qualified volunteers.
- **Extraction Review & Settings**: Administrator controls and review pipelines to ensure data accuracy.

## 💻 Tech Stack

This project is built with a modern frontend stack:
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🛠️ Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/harsh-18/Solution-Challenge.git
   cd Solution-Challenge
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the local URL provided in the terminal (usually `http://localhost:5173`).

### Building for Production

To create a production-ready build, run:
```bash
npm run build
```
The compiled assets will be placed in the `dist` folder.

## 📁 Project Structure

- `/src/components`: Shared, reusable UI components (badges, chips, metrics, etc.).
- `/src/pages`: Main application views (Command Center, Intake, Task Queue, Settings, etc.).
- `/src/hooks`: Custom React hooks for global state and logic.
- `/src/types`: TypeScript interfaces and data models.
- `/src/main.tsx`: Application entry point.

---
*Built for the Google Solution Challenge.*
