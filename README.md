# rezeptly

rezeptly is a modern, web-based application designed to help you discover, organize, and manage your favorite recipes with ease. Whether you're a seasoned chef or just starting your culinary journey, rezeptly provides an intuitive and elegant interface for all your cooking needs.

<div align="center">
   <img width="720" alt="Preview of rezeptly" src="https://github.com/user-attachments/assets/0a6868eb-adf3-493f-99b7-a9ccdc2eb178" />
</div>

## ✨ Features

- **Create & Manage Recipes:** Easily add, edit, and delete your own recipes.
- **Detailed Instructions:** Add structured instructions with step-by-step guidance.
- **Ingredient Lists:** Keep track of all the necessary ingredients for your recipes.
- **Responsive Design:** Access your recipes from any device—desktop, tablet, or mobile.
- **AI Import:** Restore family recipes by image and AI migration,

## 🚀 Getting Started

Follow these instructions to get a local copy of rezeptly up and running on your machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (20.19+, 22.13+, or 24+)
- [pnpm](https://pnpm.io/installation)
- [Docker](https://www.docker.com/products/docker-desktop/)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/rezeptly.git
   cd rezeptly
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Set up environment variables:**

   Create a `.env` file by copying the example file:

   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your database credentials and other environment-specific settings.

4. **Start the database:**

   Make sure Docker is running, then start the PostgreSQL database service:

   ```bash
   pnpm db:start
   ```

5. **Apply database schema:**

   Push the latest schema changes to your database:

   ```bash
   pnpm db:push
   ```

6. **Seed the database (optional):**

   Populate the database with sample recipes for development and testing. Run the interactive seed menu:

   ```bash
   pnpm db:seed
   ```

   The interactive menu will present you with the following options:
   - **Option 1:** Seed database (keep existing data)
   - **Option 2:** Clear database and seed with fresh data
   - **Option 3:** Clear database only (no seeding)
   - **Option 4:** Exit

   Alternatively, you can use CLI flags for non-interactive mode:

   ```bash
   # Clear and seed the database
   pnpm db:seed -- --clear

   # Seed only (keep existing data)
   pnpm db:seed -- --seed
   ```

   **Note:** You must run `pnpm db:start` and `pnpm db:push` before seeding the database.

### Running the Development Server

Once the setup is complete, you can start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`.
