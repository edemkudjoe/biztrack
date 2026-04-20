# BizTrack 🏢

**BizTrack** is a small business management system that streamlines hiring, workforce operations, and employer-employee interactions — all in one web-based platform.

🔗 **Live Demo:** [biztrackv1.vercel.app](https://biztrackv1.vercel.app)

---

## Features

### For Employers
- **Dashboard** — Get a high-level overview of business activity at a glance
- **Job Postings** — Create and manage open positions for recruitment
- **Applicant Management** — Review applications, shortlist candidates, and administer aptitude tests
- **Employment Offers** — Send, review, and manage offer letters; handle counter-offers and negotiations
- **Employee Records** — Maintain employee profiles and track workforce data

### For Employees / Applicants
- **Careers Portal** — Browse open positions and submit applications
- **Application Tracking** — Log in to monitor live application status updates
- **Offer Review** — View, accept, decline, or negotiate employment offers
- **Counter-Offer Submission** — Propose custom hourly rates, preferred working hours, and benefit requests

### General
- **Dual Role Login** — Separate portals for Employers and Employees
- **Account Management** — Sign up, log in, and reset passwords via security questions
- **Dark Mode** — Toggle between light and dark themes
- **Responsive UI** — Works across desktop and mobile browsers

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML, CSS, JavaScript |
| Backend / API | Node.js (via `/api` directory) |
| Deployment | [Vercel](https://vercel.com) |

---

## Project Structure

```
biztrack/
├── api/              # Backend API (Node.js serverless functions)
├── index.html        # Main application entry point
├── vercel.json       # Vercel deployment configuration
├── package.json      # Project dependencies and scripts
└── .gitignore
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/edemkudjoe/biztrack.git
   cd biztrack
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000` (or the port shown in your terminal).

---

## Deployment

This project is configured for seamless deployment on **Vercel**.

1. Push your changes to the `main` branch.
2. Connect the repository to your [Vercel](https://vercel.com) project.
3. Vercel will automatically build and deploy on every push.

Alternatively, deploy instantly via the Vercel CLI:
```bash
npx vercel
```

---

## Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m "Add your feature"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Contact

Built by the **BizTrack Team**.  
For questions or feedback, please open an [issue](https://github.com/edemkudjoe/biztrack/issues).
