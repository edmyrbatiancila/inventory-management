# Inventory Management System

Welcome to the Inventory Management System! This project is a modern, full-stack web application designed to help you efficiently manage inventory, users, and settings with a beautiful and intuitive interface.

---

## 🚀 Tech Stack

- **Backend:** [Laravel 12](https://laravel.com/) (PHP Framework)
- **Frontend:** [ReactJS](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [TailwindCSS](https://tailwindcss.com/)
- **Full-Stack Bridge:** [InertiaJS](https://inertiajs.com/) (Seamless SPA experience)

---

## ✨ Features

- **Authentication & Authorization**
	- User registration, login, password reset, and email verification
	- Secure session management
- **Dashboard**
	- Overview of inventory and key metrics (customizable)
- **User Profile & Settings**
	- Update profile info, change password, and manage appearance (light/dark mode)
- **Inventory Management**
	- (Extendable) Add, update, and track inventory items
- **Responsive UI**
	- Mobile-friendly, accessible, and visually appealing
- **Developer Friendly**
	- Modern codebase with TypeScript, ESLint, Prettier, and TailwindCSS best practices

---

## 🛠️ Getting Started

### Prerequisites
- PHP >= 8.2, Composer
- Node.js >= 18, npm or yarn

### Installation
1. **Clone the repository:**
	 ```bash
	 git clone <your-repo-url>
	 cd inventory-management
	 ```
2. **Install backend dependencies:**
	 ```bash
	 composer install
	 cp .env.example .env
	 php artisan key:generate
	 # Set up your database in .env, then:
	 php artisan migrate --seed
	 ```
3. **Install frontend dependencies:**
	 ```bash
	 npm install
	 # or
	 yarn install
	 ```
4. **Run the development servers:**
	 ```bash
	 # In one terminal (backend)
	 php artisan serve
	 # In another terminal (frontend)
	 npm run dev
	 ```
5. **Visit** [http://localhost:8000](http://localhost:8000) in your browser.

---

## 📚 Project Structure

- `app/` - Laravel backend (controllers, models, etc.)
- `resources/js/` - React + TypeScript frontend
- `resources/views/` - Blade templates (Inertia root)
- `routes/` - Laravel route definitions
- `public/` - Public assets and entry point

---

## 🧩 Extending & Customizing

- Add new inventory features by creating React components in `resources/js/components/` and pages in `resources/js/pages/`.
- Backend logic can be extended in `app/Http/Controllers/` and `app/Models/`.
- Update TailwindCSS styles in `resources/css/app.css`.

---

## 🤝 Contributing

We welcome contributions! To get started:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to your fork and open a Pull Request

Please follow the code style and add tests where appropriate. For major changes, open an issue first to discuss your ideas.

---

## 💬 Questions & Support

If you have any questions, suggestions, or need help, feel free to open an issue or start a discussion.

---

## ⭐️ Star this project

If you find this project useful, please consider starring it on GitHub and sharing it with others!

---

Happy coding! 🚀
