<div align="center">

# Faucet API

![TypeScript version](https://img.shields.io/badge/TypeScript-5.6.3%2B-007ACC?style=for-the-badge&logo=typescript)
![Ethers version](https://img.shields.io/badge/Ethers/api-15.1.1-white?style=for-the-badge&logo=ethers)
![BullMQ version](https://img.shields.io/badge/BullMQ-15.1.1-red?style=for-the-badge&logo=bullmq)
![Redis version](https://img.shields.io/badge/Redis-7.0%2B-DC382D?style=for-the-badge&logo=redis)
![Postgres version](https://img.shields.io/badge/PostgreSQL-14.13-blue?style=for-the-badge&logo=postgreSQL)

<br/>

Faucet for transfering token

</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#quick-start">⚡️ Quick Start</a>
    <li><a href="#prerequisites">Prerequisites</a></li>
    <li><a href="#running-backend-server">Running Backend Server</a></li>
    <li><a href="#running-indexer">Running Indexer</a></li>
    <li><a href="#commands-options">⚙️ Commands & Options</a>
      <ul>
        <li><a href="#migration">Migration</a></li>
        <li><a href="#seeder">Seeder</a></li>
        <li><a href="#building-the-app">Building the App</a></li>
        <li><a href="#testing">Testing</a></li>
        <li><a href="#indexer-commands">Indexer Commands</a></li>
      </ul>
    </li>
    <li><a href="#documentation">📚 Documentation</a></li>
  </ol>
</details>

## ⚡️ Quick Start

### Prerequisites

The project utilizes the following tools:

- **Bun `1.2.5`** : Bun is an all-in-one toolkit for JavaScript and TypeScript apps. It ships as a single executable called bun.
- **TypeScript `5.8.2`** : A superset of JavaScript that allows specifying the types of data being passed around within the code, and has the ability to report errors when the types don't match.
- **PostgreSQL `14`** : An open-source, object-relational database management system (ORDBMS) that supports both relational (SQL) and non-relational (JSON) data types.
- **Redis `7`** : An open-source data structure server belonging to the class of NoSQL databases known as key/value stores.

The project also uses some packages like:

- **Drizzle ORM `^0.41.0`** : Drizzle ORM is a headless TypeScript ORM with a head.
- **Hono `^4.7.5`** : Fast, lightweight, built on Web Standards. Support for any JavaScript runtime.
- **Ethers `5.7`** : Library aims to be a complete and compact library for interacting with the Ethereum Blockchain and its ecosystem
- **BullMQ `^5.46.1`** : An Node.js library that implements a fast and robust queue system built on top of Redis that helps in resolving many modern age micro-services architectures.

### Running Backend Server

Install dependencies:

```bash
  bun install
```

Run Migration:

```bash
  bun migrate
```

#### Development Environment

Run Server:

```bash
  bun dev
```

#### Production Environment

Compiling Code:

```bash
  bun build
```

Run Server:

```bash
  bun dev
```

$~$

### Folder Structure

The project is organized into the following structure:

```bash
├── node_modules               # modules of dependencies in this project
├── drizzle                    # contain migration folder
├── src
│   ├── database               # database configuration (contain repository, schema, database instance)
│   ├── locales                # local message instance (en & id)
│   ├── middleware             # middleware that use in backend service (origin, validation.)
│   ├── provider               # provider that used in app (ethers, queue, redis)
│   └── utils                  # utilities that used in app
├── test
│   └── performance            # load testing (K6)
├── .env.example               # example of .env file
├── .gitignore                 # .gitignore for ignore file that doesn't want to push to github
├── .prettierrc                # style configuration
├── bun.lock                   # Bun lock file
├── docker-compose.yml         # docker compose configuration
├── Dockerfile                 # Dockerfile configuration
├── drizzle.config.ts          # Drizze configuration
├── package.json
├── README.md                  # README file contain docs
└── tsconfig.json              # Typescript configuration
```

## Test

This app has several test including Performance Test using Artillery, for more information about K6 you can access [K6 Documentation](https://grafana.com/docs/k6/latest/).

> **NOTES:**
>
> Make sure to install `K6` globally by using command: `yarn add -g k6`

The command to run performance test for `transaction` API:

1. Build the Test Script

```bash
  bun test:performance:build
```

2. Run Script Test

```bash
  bun test:performance:run
```
