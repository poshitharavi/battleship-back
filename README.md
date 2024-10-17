# Battleship Game Backend

This is the backend for a Battleship game built with **NestJS** and **Prisma ORM**, connected to a **PostgreSQL** database. The backend handles game logic, including ship placement, shooting actions, and game state management for both players and computer opponents.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Features

- Place ships for both human players and computers.
- Handle shooting actions on a grid.
- Manage game state transitions (start, in-progress, completed).
- Use Prisma ORM to interact with PostgreSQL for game data persistence.

## Tech Stack

- **NestJS**: Node.js framework for building efficient and scalable server-side applications.
- **Express.js**: Fast, unopinionated web framework for Node.js (NestJS runs on top of it).
- **Prisma ORM**: Database ORM for TypeScript and Node.js that simplifies database operations.
- **PostgreSQL**: Relational database system used for storing game data.

## Project Structure

src/
├── game/ # Contains game-related logic
│ ├── dtos/ # Data Transfer Objects for game-related endpoints
│ ├── game.controller.ts # Game Controller (routes for game-related endpoints)
│ ├── game.service.ts # Game Service (business logic)
│ └── game.module.ts # Game Module
├── ship/ # Handles ship management (placing ships, checking positions)
│ ├── dtos/ # Data Transfer Objects for ship-related endpoints
│ ├── ship.controller.ts # Ship Controller (routes for ship-related actions)
│ ├── ship.service.ts # Ship Service (business logic for ships)
│ └── ship.module.ts # Ship Module
├── prisma/ # Prisma integration for database interactions
│ ├── prisma.module.ts # Prisma Module
│ └── prisma.service.ts # Prisma Service (manages connection to the database)
├── app.module.ts # Root application module
├── app.controller.ts # Main application controller
├── main.ts # Entry point of the application
└── app.service.ts # Application-level services

## Installation

1. Clone the repository:

   git clone <your-repository-url>
   cd battleship-backend

2. Install dependencies:

   yarn install

3. Generate Prisma client:

   npx prisma generate

4. Run Prisma migrations:

   npx prisma migrate dev

## Environment Variables

Create a `.env` file at the root of the project and configure the following variables:

DATABASE_URL=postgresql://<username>:<password>@localhost:5432/<database>
PORT=3000

## Running the Application

1. Start the server in development mode:

   yarn start:dev

2. The server will run on \`http://localhost:3000\`.

## API Endpoints

### Game Endpoints:

- **`POST /game/add-ships`**: Add ships to the player's grid.
- **`PATCH /game/shoot/:id`**: Shoot at a specific position on the grid.
- **`GET /game/status/:id`**: Get the current game status.

### Ship Endpoints:

- **`POST /ship/add-player-ships`**: Add ships for a human player.
- **`POST /ship/add-computer-ships`**: Add ships for the computer.

## Contributing

Feel free to fork this repository and submit pull requests.

## License

This project is licensed under the MIT License.
