# 🌐 KnowHub Community

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()
[![Contributors](https://img.shields.io/github/contributors/knowhub-dev/knowhub-community.svg)]()
[![Issues](https://img.shields.io/github/issues/knowhub-dev/knowhub-community.svg)]()
[![Stars](https://img.shields.io/github/stars/knowhub-dev/knowhub-community.svg?style=social)]()

KnowHub Community is an open-source hub that brings developers together through articles, discussions, live code examples, and collaborative knowledge sharing. Our goal is to make learning, mentoring, and building side-by-side simple and enjoyable.

## 🎯 Quick Links
- 🚀 **Installation:** See [QUICK_START.md](QUICK_START.md) for local setup and container usage.
- 🗺️ **Future Plans:** Explore the roadmap in [docs/ROADMAP.md](docs/ROADMAP.md).

## 🖼️ Visual Showcase
- **Dashboard Screenshot:** _Add your latest UI capture here._
- **Code Runner Demo GIF:** _Showcase the Piston-powered interactive code execution._

## 🛡️ Tech Stack Badges
![Laravel](https://img.shields.io/badge/Laravel-11-ff2d20?logo=laravel&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=nextdotjs&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ed?logo=docker&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-cache-dc382d?logo=redis&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-data-4169e1?logo=postgresql&logoColor=white)

## 🏗️ Architecture Overview
- **Backend (Laravel API):** Provides RESTful endpoints, authentication, notifications, and queue-backed workloads.
  Connects to Redis for caching and PostgreSQL/MySQL for persistence.
- **Frontend (Next.js):** Consumes the Laravel API, renders dashboards and content feeds, and delivers real-time UX.
  Listens for WebSocket events and API calls to keep pages in sync.
- **Microservices (Piston):** Runs untrusted code snippets in isolated sandboxes.
  Laravel orchestrates requests to Piston while the frontend displays live results to users.

## ✨ Core Capabilities
- Articles, posts, comments, tags, and community wiki pages.
- OAuth and email authentication with role-based controls.
- Interactive code runner backed by Piston microservices.
- Notifications, trends, leaderboards, bookmarks, and gamification.
- Analytics-ready dashboards for users and admins.

## 🚀 Getting Started (Summary)
- Backend: Laravel 11 (PHP 8.2+), Redis, and PostgreSQL/MySQL.
- Frontend: Next.js 14 with TypeScript, Tailwind CSS, and React Query.
- DevOps: Docker, Docker Compose, Nginx, and Supervisor for production hardening.

For step-by-step commands, environment setup, and deployment guidance, follow [QUICK_START.md](QUICK_START.md).

## 🔑 Environment Reference
| Variable | Scope | Purpose |
| --- | --- | --- |
| `PISTON_HOST` | Backend `.env` | URL of the Piston service used for sandboxed code execution (e.g., `http://piston:2000`). |
| `OPENAI_API_KEY` | Backend `.env` | API key for OpenAI-powered recommendations and AI features. Leave unset to disable AI integrations. |

## 🐳 Docker Notes
- **Development:** `docker-compose up -d` spins up app, database, Redis, and Piston services. Run `docker-compose exec app php artisan migrate --seed` after the first boot.
- **Production:** Use `deploy.sh` for automated SSL, build, migrations, and Nginx configuration. Adjust environment variables before running.

## 🛠️ Troubleshooting
- **Containers keep restarting:** Check misconfigured environment variables (`APP_KEY`, database credentials, `PISTON_HOST`). Run `docker-compose logs -f app` for details.
- **Database connection failures:** Ensure the database service is healthy (`docker-compose ps`) and host/port match your `.env`. Re-run migrations after fixing credentials.
- **Slow or failing `npm install` inside containers:** Increase memory limits or run the command on the host and mount `node_modules` if permitted.
- **Port conflicts (80/443/3000/8000):** Stop any services occupying those ports before starting Docker, or override published ports in `docker-compose.yml`.

## 🤝 Contributing
We welcome issues, discussions, and pull requests. Please open an issue to propose significant changes and follow conventional commit messages for clarity.

## 📜 License
Released under the MIT License. See [LICENSE](LICENSE) for details.
