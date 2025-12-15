### Mini Project Management System

A multi-tenant project management system built using Django + GraphQL (Graphene) on the backend and React + TypeScript + Apollo Client + TailwindCSS on the frontend.

Each organization has its own isolated workspace with projects, tasks, comments, and progress tracking.

Tech Stack
Backend

Django

GraphQL (Graphene)

PostgreSQL / SQLite (configurable)

Organization-based multi-tenancy

Frontend

React (Vite)

TypeScript

Apollo Client

TailwindCSS

Backend Setup (Windows)

# Important Note
This project was developed on Windows.
The repository does not include a virtual environment, as virtual environments are machine-specific.
You must create and activate your own virtual environment locally.

Step 1: Navigate to the backend folder
cd backend

Step 2: Create a virtual environment
python -m venv venv


This command automatically creates the venv/ folder and the pyvenv.cfg file.
You do not need to configure pyvenv.cfg manually.

Step 3: Activate the virtual environment (Windows)
venv\Scripts\activate

Step 4: Install backend dependencies
pip install -r requirements.txt

Step 5: Start the Django server
python manage.py runserver


Once the server is running, the backend will be available at:

http://127.0.0.1:8000/graphql/


The backend exposes a single GraphQL endpoint, built using Django + Graphene.

Frontend Setup
Step 1: Navigate to the frontend folder
cd frontend

Step 2: Install dependencies
npm install

Step 3: Start the development server
npm run dev


The frontend will start on:

http://localhost:5173


# Important:
Backend CORS permissions are configured only for port 5173, so the frontend must run on this port.

Application Flow & Usage

Once both backend and frontend are running, the application is ready to use.

The user begins by logging in using an organization slug.

If the organization does not exist, a new organization can be created.

Example Walkthrough

A new organization named NovaLabs is created with the contact email admin@novalabs.com
.

After creation or login, the user is redirected to a personalized organization dashboard displaying:

Active projects

Completed projects

Task throughput and progress metrics

From the dashboard, a new project named Product Launch Tracker is created with a description and due date.

Inside the project, tasks such as:

Design Marketing Assets

Develop Landing Page

QA Release Checklist
can be added and assigned.

Tasks can be moved between To Do, In Progress, and Done using drag and drop.

Each task supports comments for collaboration and status updates.

The application also supports light and dark mode for improved usability.

# Key Features
Multi-tenant architecture with organization-level data isolation
Project and task management
Task comments for collaboration
Real-time project statistics
Drag-and-drop task status updates
Light and dark theme support
Single GraphQL endpoint with a clean schema design

# Notes & Future Improvements
Authentication and role-based access control were intentionally excluded to keep the scope aligned with the assignment.
Possible future enhancements include:
User authentication
Role-based permissions
Real-time updates via GraphQL subscriptions
Pagination and search
Dockerization and cloud deployment

Conclusion
This project demonstrates a clean, scalable, and modern full-stack architecture using GraphQL and React, with a strong focus on multi-tenancy, data isolation, and developer experience.
