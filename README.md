BizTrack 🏢

BizTrack is a small business management system that streamlines hiring, workforce operations, and employer-employee interactions — all in one web-based platform.

🔗 Live Demo: biztrackv1.vercel.app

Features

For Employers

Dashboard — High-level overview of business activity, revenue, profit margin, pending requests, and clocked-in employees

Finance & Revenue — Log daily revenue, track operational costs, view payroll breakdowns, and monitor profit margins

Performance — View per-employee performance scores based on task completion. Assign tasks with difficulty ratings (Easy, Medium, Hard), verify or reject submitted tasks, and track score changes in real time

Attendance Management — Monitor clock-ins and clock-outs, view today's summary, and configure the geofence work location and shift times

Employee Management — Add, edit, and remove employee records; review and approve or reject promotion requests

Recruitment — End-to-end hiring pipeline: post jobs to the public Careers Portal, collect applications, rank candidates by merit score, administer aptitude tests, shortlist top candidates, and send offer letters

Leave Management — Review, approve, or reject leave requests with pay status and terms

Benefits — Create a benefits catalogue and assign benefits to individual employees

Complaints & Suggestions — View and resolve submissions from employees

Settings — Update business info, manage employee credentials, configure attendance settings, change password, and manage data (clear tables or reset all data)

For Employees

Dashboard — Personal overview of earnings, hours logged, performance score, and active benefits

My Finance — View attendance-based earnings, hourly rate, and salary advance history

My Tasks — View assigned tasks with difficulty and due dates; submit tasks as complete for employer verification; track verified, pending, and rejected tasks with point impact shown

Attendance — Clock in and out using GPS location verification against the configured work geofence

Request Advance — Submit salary advance requests with repayment plan

Request Promotion — Submit formal promotion requests with justification

Request Leave — Submit leave requests and respond to employer terms once approved

Complaints — Submit complaints, suggestions, or feedback (optionally anonymous)

My Profile — View employment details, performance score, active benefits, and change password

Careers Portal (Public)

Browse Jobs — View all active job postings publicly without logging in

Apply — Submit applications directly through the portal (account required)

Track Application — Log in to monitor live application stage updates

Offer Review — View, accept, decline, or negotiate employment offers with counter-offer submission

General

Real-time Sync — All portals auto-refresh data from Supabase every 5 seconds; changes made by any user are reflected across all active sessions without a manual refresh

Dual Role Login — Separate portals for Employers and Employees with role-based access control

JWT Authentication — Secure token-based auth with bcrypt password hashing

Dark Mode — Toggle between light and dark themes

Responsive UI — Works across desktop and mobile browsers

Performance Scoring

Performance scores are task-driven and start at 100% for every employee.

Difficulty

Points

Easy

+10 pts on verify / −10 pts on reject

Medium

+25 pts on verify / −25 pts on reject

Hard

+50 pts on verify / −50 pts on reject

Score range: 0% – 150%

Overdue or rejected tasks reduce the score

Scores only change once an employer verifies or rejects a submitted task

Task Workflow

Employer assigns task (Easy / Medium / Hard)
        ↓
Employee sees task in "My Tasks" → clicks "Mark Complete"
        ↓
Task status → "Awaiting Verification" (employer notified)
        ↓
Employer clicks Verify or Reject
        ↓
Score updates / Employee sees result


Tech Stack

Layer

Technology

Frontend

HTML, CSS, Vanilla JavaScript

Backend / API

Node.js (Vercel Serverless Functions)

Database

Supabase (PostgreSQL)

Auth

JWT + bcrypt

Deployment

Vercel

Project Structure

biztrack/
├── api/
│   ├── [...route].js      # Main API router (auth, users, data, settings)
│   ├── attendance.js      # Attendance endpoint
│   └── generate-offer.js  # Offer letter generation
├── index.html             # Entire frontend (single-file SPA)
├── vercel.json            # Vercel deployment configuration
├── package.json           # Project dependencies
└── .gitignore


Environment Variables

Set the following in your Vercel project settings (or a local .env file):

Variable

Description

SUPABASE_URL

Your Supabase project URL

SUPABASE_ANON_KEY

Your Supabase anon/public key

JWT_SECRET

Secret key used to sign JWT tokens

GEMINI_API_KEY

Your Google Gemini API Key required for applicant AI scoring and grading

Getting Started

Prerequisites

Node.js v18 or higher

npm

A Supabase project with the required tables

Installation

Clone the repository

git clone [https://github.com/edemkudjoe/biztrack.git](https://github.com/edemkudjoe/biztrack.git)
cd biztrack


Install dependencies

npm install


Set up environment variables
Create a .env file in the root:

SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key


Run the development server

npm run dev


Open your browser and navigate to http://localhost:3000

Supabase Tables Required

The following tables must exist in your Supabase project:

users, attendance, tasks, costs, revenue, leaves, advances, promos, complaints, applicants, job_postings, settings

Deployment

This project is configured for seamless deployment on Vercel.

Push your changes to the main branch

Connect the repository to your Vercel project

Add your environment variables in the Vercel dashboard

Vercel will automatically build and deploy on every push
Or deploy instantly via the Vercel CLI:

npx vercel


Contributing

Contributions are welcome!

Fork the repository

Create a new branch: git checkout -b feature/your-feature-name

Commit your changes: git commit -m "Add your feature"

Push to your fork: git push origin feature/your-feature-name

Open a Pull Request

License

This project is licensed under the MIT License.

Contact

Built by the BizTrack Team.

For questions or feedback, please open an issue.
