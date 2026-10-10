# iHunt

This is the app used by the [Poltergeist](https://www.poltergeistlarp.com) LARP [iHunt: Alpha Access](https://ihunt.poltergeistlarp.com). If you are playing or hoping to play this game, be warned that **spoilers are ahead**!

## How it works

iHunt is four different services: the JS API server, front end, images, and database.

## Setup

### Prerequisites

- Node.JS
- Yarn
- Docker

### Installation

1. Clone this repo via `git clone https://github.com/ChaosExAnima/ihunt.git ihunt`.
2. Install dependencies via `yarn`.
3. Copy `.env.example` to `.env` and update values.
4. Start the external services via `docker compose up -d`.
5. Run the dev server via `yarn dev`.
6. Visit the app at `http://localhost:5173`
