# Rezeptly

Rezeptly is a modern, web-based application designed to help you discover, organize, and manage your favorite recipes with ease. Whether you're a seasoned chef or just starting your culinary journey, Rezeptly provides an intuitive and elegant interface for all your cooking needs.

## ✨ Features

- **Create & Manage Recipes:** Easily add, edit, and delete your own recipes.
- **Detailed Instructions:** Add structured instructions with step-by-step guidance.
- **Ingredient Lists:** Keep track of all the necessary ingredients for your recipes.
- **Responsive Design:** Access your recipes from any device—desktop, tablet, or mobile.

## 🚀 Getting Started

Follow these instructions to get a local copy of Rezeptly up and running on your machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v22 or later)
- [pnpm](https://pnpm.io/installation)
- [Docker](https://www.docker.com/products/docker-desktop/)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/rezeptly.git
    cd rezeptly
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**

    Create a `.env` file by copying the example file:

    ```bash
    cp .env.example .env
    ```

    Update the `.env` file with your database credentials and other environment-specific settings.

4.  **Start the database:**

    Make sure Docker is running, then start the PostgreSQL database service:

    ```bash
    pnpm db:start
    ```

5.  **Apply database schema:**

    Push the latest schema changes to your database:

    ```bash
    pnpm db:push
    ```

### Running the Development Server

Once the setup is complete, you can start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`.

## 📜 Available Scripts

- `pnpm dev`: Starts the development server with hot-reloading.
- `pnpm build`: Builds the application for production.
- `pnpm preview`: Serves the production build locally for previewing.
- `pnpm check`: Runs Svelte check for type-checking.
- `pnpm lint`: Lints the codebase using ESLint and Prettier.
- `pnpm format`: Formats the code using Prettier.

### Database Management

- `pnpm db:start`: Starts the PostgreSQL database using Docker Compose.
- `pnpm db:push`: Pushes the current Drizzle schema to the database.
- `pnpm db:migrate`: Creates a new SQL migration file based on schema changes.
- `pnpm db:studio`: Opens Drizzle Studio to browse and manage your data.

## 🛠️ Built With

- [SvelteKit](https://kit.svelte.dev/) - The core web framework.
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM for database access.
- [PostgreSQL](https://www.postgresql.org/) - The relational database.
- [Tailwind CSS](https://tailwindcss.com/) - For styling the user interface.
- [TypeScript](https://www.typescriptlang.org/) - For type-safe code.
- [Vite](https.vitejs.dev/) - The build tool and development server.