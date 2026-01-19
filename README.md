# 🎬 BookMyShow Clone – End-to-End DevOps Deployment using Docker, Jenkins & AWS EKS

A full-stack movie ticket booking application built with React.js, featuring a complete DevOps pipeline with Docker, Kubernetes, and Jenkins CI/CD.

![React](https://img.shields.io/badge/React-17.0.1-61DAFB?style=flat&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18-339933?style=flat&logo=node.js)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=flat&logo=docker)
![Kubernetes](https://img.shields.io/badge/Kubernetes-Ready-326CE5?style=flat&logo=kubernetes)
![Jenkins](https://img.shields.io/badge/Jenkins-CI%2FCD-D24939?style=flat&logo=jenkins)

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running Locally](#running-locally)
- [Docker Deployment](#-docker-deployment)
- [Kubernetes Deployment](#-kubernetes-deployment)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Available Scripts](#-available-scripts)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

- 🎥 **Browse Movies** - Explore a wide collection of movies
- 🎟️ **Book Tickets** - Select seats and book movie tickets
- 🏛️ **Cinema Selection** - Choose from multiple cinema locations
- 🍿 **Food & Beverages** - Order snacks with your tickets
- 💳 **Secure Payments** - Integrated payment processing
- 📜 **Booking History** - View past bookings
- 🔐 **User Authentication** - Login and user management
- 📱 **Responsive Design** - Works on all device sizes

---

## 🛠️ Tech Stack

### Frontend
| Technology | Description |
|------------|-------------|
| **React 17** | UI Library |
| **Redux** | State Management |
| **React Router** | Navigation |
| **Material-UI** | UI Components |
| **Ant Design** | Additional UI Components |
| **Axios** | HTTP Client |
| **Styled Components** | CSS-in-JS |

### DevOps & Infrastructure
| Technology | Description |
|------------|-------------|
| **Docker** | Containerization |
| **Kubernetes** | Container Orchestration |
| **Jenkins** | CI/CD Pipeline |
| **SonarQube** | Code Quality Analysis |
| **Trivy** | Security Scanning |
| **OWASP** | Dependency Scanning |

---

## 📁 Project Structure

```
Book-My-Show/
├── bookmyshow-app/           # React Frontend Application
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── app/              # Main App component
│   │   ├── assets/           # Images and styles
│   │   ├── components/       # Reusable components
│   │   │   ├── booking/      # Seating and ticket components
│   │   │   ├── cards/        # Card components
│   │   │   ├── common/       # Navbar, Footer
│   │   │   └── history/      # Booking history
│   │   ├── pages/            # Page components
│   │   │   ├── Auth/         # Login page
│   │   │   ├── Booking/      # Ticket booking
│   │   │   ├── Home/         # Home page
│   │   │   ├── Movie/        # Movie details
│   │   │   ├── Payment/      # Payment processing
│   │   │   └── Summary/      # Booking summary
│   │   ├── redux/            # Redux store and slices
│   │   ├── routes/           # Application routing
│   │   └── utils/            # Utility functions
│   ├── Dockerfile            # Docker configuration
│   └── package.json          # Dependencies
├── ci-cd/                    # CI/CD Configuration
│   ├── Jenkinsfile.build     # Build pipeline
│   └── Jenkinsfile.deploy    # Deployment pipeline
├── k8s/                      # Kubernetes manifests
│   ├── deployment.yml        # K8s Deployment
│   └── service.yml           # K8s Service
├── BMS-Document.md           # DevOps deployment guide
└── README.md                 # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 8.x
- **Docker** (for containerization)
- **kubectl** (for Kubernetes deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KastroVKiran/Book-My-Show.git
   cd Book-My-Show
   ```

2. **Install dependencies**
   ```bash
   cd bookmyshow-app
   npm install
   ```

### Running Locally

```bash
cd bookmyshow-app
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000)

---

## 🐳 Docker Deployment

### Build Docker Image

```bash
cd bookmyshow-app
docker build -t bms:latest .
```

### Run Docker Container

```bash
docker run -d --name bms -p 3000:3000 bms:latest
```

### Using Docker Hub Image

```bash
docker pull kastrov/bms:latest
docker run -d --name bms -p 3000:3000 kastrov/bms:latest
```

---

## ☸️ Kubernetes Deployment

### Deploy to Kubernetes

```bash
# Apply deployment
kubectl apply -f k8s/deployment.yml

# Apply service
kubectl apply -f k8s/service.yml
```

### Verify Deployment

```bash
# Check pods
kubectl get pods -l app=bms

# Check service
kubectl get svc bms-service
```

### Access Application

The application is exposed via a LoadBalancer service on port 80.

---

## 🔄 CI/CD Pipeline

The project includes Jenkins pipelines for automated build and deployment:

### Pipeline Stages

| Stage | Description |
|-------|-------------|
| **Clean Workspace** | Cleans the Jenkins workspace |
| **Checkout** | Clones the repository from Git |
| **SonarQube Analysis** | Code quality analysis |
| **Quality Gate** | Validates code quality standards |
| **Install Dependencies** | Installs npm packages |
| **OWASP FS Scan** | Security vulnerability scanning |
| **Trivy FS Scan** | Container security scanning |
| **Docker Build & Push** | Builds and pushes Docker image |
| **Deploy to Container** | Deploys to Docker container |

### Pipeline Files

- `ci-cd/Jenkinsfile.build` - Build and test pipeline
- `ci-cd/Jenkinsfile.deploy` - Kubernetes deployment pipeline

> 📖 For detailed DevOps setup instructions, refer to [BMS-Document.md](BMS-Document.md)

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Runs the app in development mode |
| `npm test` | Launches the test runner |
| `npm run build` | Builds the app for production |
| `npm run eject` | Ejects from Create React App |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

