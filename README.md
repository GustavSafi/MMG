# gustavsafi.se

Personal site for Gustav Safi, AI & Cloud Engineer. Built with Next.js (App Router), React, TypeScript and Tailwind CSS, hosted on Vercel.

## Pages

- `/`: hero with the system graph, what I do and a teaser for the triage engine
- `/projects`: project list
- `/projects/triage`: interactive triage engine from the Hospition.IT hackathon (1st place)
- `/about`: about me, experience, stack and other
- `/contact`: email and LinkedIn
- Custom 404 where you repair a broken link

## Run locally

Requires Node 18 or newer.

```bash
npm install
npm run dev
```

## Where things live

- `src/content.ts`: all text about me, projects, experience and stack
- `src/lib/triage.ts`: the triage model (weights, red flags, thresholds)
- `src/components/`: header, footer, network background, graphs and interactive parts
