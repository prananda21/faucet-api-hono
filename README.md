<div align="center">

# Faucet API

![Bun version](https://img.shields.io/badge/Bun-1.2.10-white?style=for-the-badge&logo=bun)
![TypeScript version](https://img.shields.io/badge/TypeScript-5.8.2%2B-007ACC?style=for-the-badge&logo=typescript)
![Hono version](https://img.shields.io/badge/Hono-4.7.7-orange?style=for-the-badge&logo=Hono)
![Drizzle ORM version](https://img.shields.io/badge/Drizzle-^0.41.0-green?style=for-the-badge&logo=Drizzle)
![Ethers version](https://img.shields.io/badge/Ethers-5.7.2-white?style=for-the-badge&logo=ethers)
![BullMQ version](https://img.shields.io/badge/BullMQ-5.51.1-red?style=for-the-badge&logo=bullmq)
![Redis version](https://img.shields.io/badge/Redis-7.0%2B-DC382D?style=for-the-badge&logo=redis)
![Postgres version](https://img.shields.io/badge/PostgreSQL-14.13-blue?style=for-the-badge&logo=postgreSQL)

<br/>

</div>

Faucet for transfering token

## ⚡️ Quick Start

### Prerequisites

The project utilizes the following tools:

- **Bun `1.2.5`** : Bun is an all-in-one toolkit for JavaScript and TypeScript apps. It ships as a single executable called bun.
- **TypeScript `5.8.2`** : A superset of JavaScript that allows specifying the types of data being passed around within the code, and has the ability to report errors when the types don't match.
- **PostgreSQL `14`** : An open-source, object-relational database management system (ORDBMS) that supports both relational (SQL) and non-relational (JSON) data types.
- **Redis `7`** : An open-source data structure server belonging to the class of NoSQL databases known as key/value stores.

The project also uses some packages like:

- **Drizzle ORM `^0.41.0`** : Drizzle ORM is a headless TypeScript ORM with a head.
- **Hono `^4.7.7`** : Fast, lightweight, built on Web Standards. Support for any JavaScript runtime.
- **Ethers `5.7.2`** : Library aims to be a complete and compact library for interacting with the Ethereum Blockchain and its ecosystem
- **BullMQ `^5.51.1`** : An Node.js library that implements a fast and robust queue system built on top of Redis that helps in resolving many modern age micro-services architectures.

### Running Backend Server

Install dependencies:

```bash
  bun install
```

Run Migration:

```bash
  bun db:migrate
```

#### Development Environment

Run Server:

```bash
  bun dev
```

#### Production Environment

Compiling Code:

```bash
  bun compile
```

Run Server:

```bash
  bun start
```

**notes**

For effieciency, you can use this command to for compiling and run the server at the same time

```bash
  bun prod
```

$~$

### Folder Structure

The project is organized into the following structure:

```bash
├── node_modules               # modules of dependencies in this project
├── src
│   ├── controller             # handler for routes
│   ├── database               # database configuration (contain repository, entities, migrations and datasource instance)
│   ├── locales                # local message instance (en & id)
│   ├── middleware             # middleware that use in backend service (custom, env, etc.)
│   ├── provider               # provider that used in discord bot (ethers.js, envConfig, etc)
│   ├── routes                 # route for endpoint
│   ├── services               # service that use in controller
│   └── utils                  # utilities that used in discord bot (enum, etc)
├── test
│   ├── performance            # load testing (Artillery)
│   └── utils                  # utilities that used in testing
├── .env.example               # example of .env file
├── .gitignore                 # .gitignore for ignore file that doesn't want to push to github
├── .prettierrc                # style configuration
├── babel.config.json          # babel configuraton for testing
├── Dockerfile                 # Dockerfile configuration
├── eslint.config.mjs          # linter
├── jest.config.ts             # jest configuration for testing
├── nodemon.json               # dev node-ts
├── package.json
├── README.md                  # README file contain docs
├── tsconfig.json              # Typescript configuration
└── yarn.lock                  # Yarn package, same as package-lock.json
```

## Test

This app has several test including Performance Test using Artillery, for more information about K6 you can access [K6 Documentation](https://k6.io).

> **NOTES:**
>
> Make sure to install `K6` globally by using command: `bun add k6`

There's several step before running the performance test, which is:

### Compile the Test Code

K6 running in Javascript, that's why we need to compile it first by using command:

```bash
  bun test:performance:build
```

### Running the Performance Test

After compiling the test code, then use this command for running the performance test

```bash
  bun test:performance:run
```
