# SJF Visualizer Lab

Interactive CPU Scheduling visualization for Shortest Job First (SJF) Non-Preemptive algorithm. Explore process scheduling concepts with an intuitive UI, Gantt chart animation, and computed metrics.

## Live Demo

Live Demo:  https://sjf-visualizer-lab.vercel.app

## Features

- Input processes with arrival and burst times
- Visual step-by-step SJF non-preemptive scheduling animation
- Gantt chart visualization
- Metrics: waiting time, turnaround time, average values
- Responsive UI built with shadcn-ui and Tailwind CSS

## Tech Stack

- Vite + React + TypeScript
- shadcn-ui + Tailwind CSS

## Local Development

Prerequisites: Node.js 18+ and npm

```sh
git clone https://github.com/devanathsugavasi/sjf-visualizer-lab.git
cd sjf-visualizer-lab
npm install
npm run dev
```

The app runs at `http://localhost:5173` by default.

## Build

```sh
npm run build
npm run preview
```

## Deploy (Vercel)

This project includes a `vercel.json` configured for Vite SPA routing.

Deploy via CLI:

```sh
# First time: login and link the project
vercel login
vercel link --yes

# Build and deploy
npm run build
vercel deploy --prebuilt --prod --yes
```

## License

MIT
