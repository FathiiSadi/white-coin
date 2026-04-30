# The White Coin - AI Financial Intelligence Dashboard

A premium, internationalized financial management platform built with Laravel, React, and Gemini AI.

## 🚀 Key Features
- **AI-Driven Insights**: Personalized financial advice powered by Google Gemini.
- **Full Internationalization**: Complete support for English and Arabic (RTL) across all modules.
- **Automated Savings**: "Round Up" savings logic with custom amount support.
- **Multi-Entity Management**: Track income sources, dependents, and real-time transaction history.
- **Premium Design**: Modern, responsive UI with sleek animations and a "Intelligence" aesthetic.

## 🛠 Tech Stack
- **Backend**: Laravel 10 (PHP)
- **Frontend**: React (Vite)
- **Styling**: Tailwind CSS & Vanilla CSS
- **Animations**: Framer Motion
- **Database**: MySQL/PostgreSQL
- **Icons**: Lucide React & Google Material Symbols

## 📥 Installation & Setup

### Prerequisites
- PHP 8.1+
- Composer
- Node.js & NPM
- MySQL/PostgreSQL

### Step 1: Backend Setup
1. Clone the repository and navigate to the project root.
2. Install dependencies:
   ```bash
   composer install
   ```
3. Copy `.env.example` to `.env` and configure your database and API keys:
   ```bash
   cp .env.example .env
   ```
4. Generate application key:
   ```bash
   php artisan key:generate
   ```
5. Run migrations and seeders:
   ```bash
   php artisan migrate --seed
   ```
6. Start the Laravel server:
   ```bash
   php artisan serve
   ```

### Step 2: Frontend Setup
1. Install NPM packages:
   ```bash
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```

### Step 3: Access the App
Open your browser and navigate to `http://localhost:8000`.

## 🌐 Internationalization
The app supports English and Arabic. Toggle the language in the Profile Settings. The UI will automatically switch layout direction (LTR/RTL) and apply appropriate typography.

## 🔒 Security
- **Sanctum Authentication**: Secure API tokens for user sessions.
- **Policy Authorization**: Resource-level permissions for all financial data.

## 📝 Note on Open Banking
This version uses a simulated Open Banking integration for demonstration purposes. In a production environment, you would integrate with providers like Plaid or Salt Edge.

---
Built with ❤️ by the White Coin Team.
