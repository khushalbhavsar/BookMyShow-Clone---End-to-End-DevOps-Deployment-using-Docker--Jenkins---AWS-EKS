# 🎬 BookMyShow Clone – End-to-End DevOps Deployment using Docker, Jenkins & AWS EKS

---

## 📑 Table of Contents

- [Part I: Docker Deployment](#part-i-docker-deployment)
  - [Step 1: Basic Setup](#step-1-basic-setup)
    - [1.1 Launch VM](#11-launch-vm)
    - [1.2 IAM User Creation](#12-iam-user-creation)
    - [1.3 EKS Cluster Creation](#13-eks-cluster-creation)
  - [Step 2: Tools Installation](#step-2-tools-installation)
    - [2.1 Jenkins Installation](#21-jenkins-installation)
    - [2.2 Docker Installation](#22-docker-installation)
    - [2.3 Trivy Installation](#23-trivy-installation)
    - [2.4 SonarQube Setup](#24-sonarqube-setup)
  - [Step 3: Jenkins Configuration](#step-3-jenkins-configuration)
  - [Step 4: Email Integration](#step-4-email-integration)
  - [Step 5: Pipeline Job](#step-5-pipeline-job)
- [Part II: Kubernetes Deployment & Monitoring](#part-ii-kubernetes-deployment--monitoring)
  - [Step 6: Monitoring Setup](#step-6-monitoring-setup)
    - [6.1 Prometheus Installation](#61-prometheus-installation)
    - [6.2 Node Exporter Installation](#62-node-exporter-installation)
    - [6.3 Prometheus Configuration](#63-prometheus-configuration)
    - [6.4 Grafana Installation](#64-grafana-installation)
- [Cleanup](#cleanup)

---

# Part I: Docker Deployment

## Step 1: Basic Setup

### 1.1 Launch VM

Launch an Ubuntu VM with the following specifications:

| Property | Value |
|----------|-------|
| **OS** | Ubuntu 24.04 |
| **Instance Type** | t2.large |
| **Storage** | 28 GB |
| **Name** | BMS-Server |

#### Security Group Configuration

Open the following ports in the Security Group:

| Type | Protocol | Port Range | Description |
|------|----------|------------|-------------|
| SMTP | TCP | 25 | Email sending between mail servers |
| Custom TCP | TCP | 3000-10000 | Node.js, Grafana, Jenkins, custom web apps |
| HTTP | TCP | 80 | Unencrypted web traffic (Apache, Nginx) |
| HTTPS | TCP | 443 | Secure web traffic (SSL/TLS) |
| SSH | TCP | 22 | Secure Shell for remote access |
| Custom TCP | TCP | 6443 | Kubernetes API server |
| SMTPS | TCP | 465 | Secure SMTP over SSL/TLS |
| Custom TCP | TCP | 30000-32767 | Kubernetes NodePort service range |

---

### 1.2 IAM User Creation

> ⚠️ **Note:** It's not recommended to create EKS Cluster using the Root Account.

#### 1.2.1 Create IAM User

Create a dedicated IAM user for EKS cluster management.

#### 1.2.2 Attach Policies

Attach the following AWS managed policies:

- `AmazonEC2FullAccess`
- `AmazonEKS_CNI_Policy`
- `AmazonEKSClusterPolicy`
- `AmazonEKSWorkerNodePolicy`
- `AWSCloudFormationFullAccess`
- `IAMFullAccess`

**Inline Policy (EKS Full Access):**

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": "eks:*",
            "Resource": "*"
        }
    ]
}
```

#### 1.2.3 Create Access Keys

Generate Access Keys for the IAM user created above.

---

### 1.3 EKS Cluster Creation

Connect to the **BMS-Server** VM and run:

```bash
sudo apt update
```

#### 1.3.1 Install AWS CLI

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
sudo apt install unzip
unzip awscliv2.zip
sudo ./aws/install
aws configure
```

#### 1.3.2 Install kubectl

```bash
curl -o kubectl https://amazon-eks.s3.us-west-2.amazonaws.com/1.19.6/2021-01-05/bin/linux/amd64/kubectl
chmod +x ./kubectl
sudo mv ./kubectl /usr/local/bin
kubectl version --short --client
```

#### 1.3.3 Install eksctl

```bash
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin
eksctl version
```

#### 1.3.4 Create EKS Cluster

Execute the following commands separately:

**(a) Create Cluster (5-10 minutes)**

```bash
eksctl create cluster --name=bookmyshow-eks \
                      --region=us-east-1 \
                      --zones=us-east-1a,us-east-1b \
                      --version=1.30 \
                      --without-nodegroup
```

**(b) Associate IAM OIDC Provider**

```bash
eksctl utils associate-iam-oidc-provider \
    --region us-east-1 \
    --cluster bookmyshow-eks \
    --approve
```

> 💡 **Why OIDC?**
> - Enables IAM roles for service accounts (IRSA)
> - Allows Kubernetes workloads to assume IAM roles securely
> - Without this, Pods would require node-level IAM roles

**(c) Create Node Group (5-10 minutes)**

> ⚠️ Replace `Kastro` with your PEM key name (without `.pem` extension)

```bash
eksctl create nodegroup --cluster=bookmyshow-eks \
                       --region=us-east-1 \
                       --name=node2 \
                       --node-type=t3.medium \
                       --nodes=3 \
                       --nodes-min=2 \
                       --nodes-max=4 \
                       --node-volume-size=20 \
                       --ssh-access \
                       --ssh-public-key=Kastro \
                       --managed \
                       --asg-access \
                       --external-dns-access \
                       --full-ecr-access \
                       --appmesh-access \
                       --alb-ingress-access
```

**(d) Configure Security Group**

Open **All Traffic** in the EKS Cluster security group for internal communication between control plane and worker nodes.

---

## Step 2: Tools Installation

### 2.1 Jenkins Installation

Create the installation script:

```bash
vi jenkins.sh
```

Paste the following content:

```bash
#!/bin/bash

# Install OpenJDK 17 JRE Headless
sudo apt install openjdk-17-jre-headless -y

# Download Jenkins GPG key
sudo wget -O /usr/share/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key

# Add Jenkins repository to package manager sources
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# Update package manager repositories
sudo apt-get update

# Install Jenkins
sudo apt-get install jenkins -y
```

Run the script:

```bash
sudo chmod +x jenkins.sh
./jenkins.sh
```

> 📌 **Post-Installation:** Open Port 8080 and access Jenkins dashboard.

---

### 2.2 Docker Installation

Create the installation script:

```bash
vi docker.sh
```

Paste the following content:

```bash
#!/bin/bash

# Update package manager repositories
sudo apt-get update

# Install necessary dependencies
sudo apt-get install -y ca-certificates curl

# Create directory for Docker GPG key
sudo install -m 0755 -d /etc/apt/keyrings

# Download Docker's GPG key
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc

# Ensure proper permissions for the key
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add Docker repository to Apt sources
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
$(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package manager repositories
sudo apt-get update

# Install Docker
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Run the script:

```bash
sudo chmod +x docker.sh
./docker.sh
```

**Verify Installation:**

```bash
docker --version
```

**Fix Permission Issues (if unable to pull images):**

```bash
sudo chmod 666 /var/run/docker.sock
docker pull hello-world
```

**Login to DockerHub:**

```bash
docker login -u <DockerHubUserName>
# Enter password when prompted
```

---

### 2.3 Trivy Installation

Create the installation script:

```bash
vi trivy.sh
```

Paste the following content:

```bash
#!/bin/bash
sudo apt-get install wget apt-transport-https gnupg
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor | sudo tee /usr/share/keyrings/trivy.gpg > /dev/null
echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb generic main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install trivy
```

Run the script:

```bash
sudo chmod +x trivy.sh
./trivy.sh
trivy --version
```

---

### 2.4 SonarQube Setup

Run SonarQube as a Docker container:

```bash
docker run -d --name sonar -p 9000:9000 sonarqube:lts-community
docker images
docker ps
```

**Access SonarQube:**
- URL: `http://<server-ip>:9000`
- Default credentials: `admin` / `admin`
- Set a new password on first login

---

## Step 3: Jenkins Configuration

### 3.1 Plugin Installation

Install the following plugins:

| Category | Plugins |
|----------|---------|
| **Build Tools** | Eclipse Temurin Installer, NodeJS |
| **Code Quality** | SonarQube Scanner, OWASP Dependency Check |
| **Docker** | Docker, Docker Commons, Docker Pipeline, Docker API, docker-build-step |
| **Kubernetes** | Kubernetes, Kubernetes CLI, Kubernetes Client API, Kubernetes Credentials |
| **Others** | Pipeline Stage View, Email Extension Template, Config File Provider, Prometheus Metrics |

### 3.2 SonarQube Token Creation

Generate a token in SonarQube and configure it in Jenkins.

### 3.3 Credentials Setup

Configure necessary credentials in Jenkins:
- Docker Hub credentials
- SonarQube token
- AWS credentials (for EKS)

### 3.4 Tools Configuration

Configure the following tools in Jenkins:
- JDK 17
- NodeJS
- SonarQube Scanner
- Docker

### 3.5 System Configuration

Configure system settings including SonarQube server URL and Docker registry.

---

## Step 4: Email Integration

### Gmail App Password Setup

1. Go to **Gmail** → Click on your profile icon → **Manage your Google Account**
2. Search for **App Passwords**
3. Create a new app password with name: `jenkins`
4. Copy the generated password (remove spaces)

### Jenkins Email Configuration

1. **Add Email Credentials:**
   - Go to: `Manage Jenkins` → `Credentials` → `Global`
   - Add credentials:
     - Kind: `Username with Password`
     - Username: Your email
     - Password: App password token
     - ID: `email-creds`

2. **Configure Extended Email Notification:**
   - SMTP Server: `smtp.gmail.com`
   - SMTP Port: `465`
   - Enable SSL and OAuth 2.0
   - Default content type: HTML

3. **Configure Email Notification:**
   - SMTP Server: `smtp.gmail.com`
   - Enable SMTP Authentication
   - Enable SSL
   - SMTP Port: `465`
   - Test configuration by sending a test email

4. **Default Triggers:**
   - Enable: Always, Failure-Any, Success

### Install NPM

```bash
apt install npm
```

---

## Step 5: Pipeline Job

### Pre-requisites

Before creating the pipeline:

1. Update `docker-hub username` in the following stages:
   - Tag and Push to DockerHub
   - Deploy to Container

2. Update the `email address` in post actions

### Pipeline Script (Without K8S)

```groovy
pipeline {
    agent any
    tools {
        jdk 'jdk17'
        nodejs 'node23'
    }
    environment {
        SCANNER_HOME = tool 'sonar-scanner'
    }
    stages {
        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }
        stage('Checkout from Git') {
            steps {
                git branch: 'main', url: 'https://github.com/KastroVKiran/Book-My-Show.git'
                sh 'ls -la'
            }
        }
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonar-server') {
                    sh ''' 
                    $SCANNER_HOME/bin/sonar-scanner -Dsonar.projectName=BMS \
                    -Dsonar.projectKey=BMS 
                    '''
                }
            }
        }
        stage('Quality Gate') {
            steps {
                script {
                    waitForQualityGate abortPipeline: false, credentialsId: 'Sonar-token'
                }
            }
        }
        stage('Install Dependencies') {
            steps {
                sh '''
                cd bookmyshow-app
                ls -la
                if [ -f package.json ]; then
                    rm -rf node_modules package-lock.json
                    npm install
                else
                    echo "Error: package.json not found in bookmyshow-app!"
                    exit 1
                fi
                '''
            }
        }
        stage('Trivy FS Scan') {
            steps {
                sh 'trivy fs . > trivyfs.txt'
            }
        }
        stage('Docker Build & Push') {
            steps {
                script {
                    withDockerRegistry(credentialsId: 'docker', toolName: 'docker') {
                        sh ''' 
                        echo "Building Docker image..."
                        docker build --no-cache -t kastrov/bms:latest -f bookmyshow-app/Dockerfile bookmyshow-app

                        echo "Pushing Docker image to registry..."
                        docker push kastrov/bms:latest
                        '''
                    }
                }
            }
        }
        stage('Deploy to Container') {
            steps {
                sh ''' 
                echo "Stopping and removing old container..."
                docker stop bms || true
                docker rm bms || true

                echo "Running new container on port 3000..."
                docker run -d --restart=always --name bms -p 3000:3000 kastrov/bms:latest

                echo "Checking running containers..."
                docker ps -a

                echo "Fetching logs..."
                sleep 5
                docker logs bms
                '''
            }
        }
    }
    post {
        always {
            emailext attachLog: true,
                subject: "'${currentBuild.result}'",
                body: "Project: ${env.JOB_NAME}<br/>" +
                      "Build Number: ${env.BUILD_NUMBER}<br/>" +
                      "URL: ${env.BUILD_URL}<br/>",
                to: 'kastrokiran@gmail.com',
                attachmentsPattern: 'trivyfs.txt,trivyimage.txt'
        }
    }
}
```

**Access the Application:**
```
http://<BMS-Server-Public-IP>:3000
```

---

# Part II: Kubernetes Deployment & Monitoring

## Pre-requisites for K8S Deployment

### Configure Jenkins User for AWS

Check which user Jenkins is running as:

```bash
ps aux | grep jenkins
```

Switch to Jenkins user:

```bash
sudo -su jenkins
pwd      # /home/ubuntu
whoami   # jenkins
```

Configure AWS credentials:

```bash
aws configure
# This creates credentials at /var/lib/jenkins/.aws/credentials
```

Verify credentials:

```bash
aws sts get-caller-identity
```

Expected output:
```json
{
    "UserId": "EXAMPLEUSERID",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/example-user"
}
```

Restart Jenkins and update kubeconfig:

```bash
exit
sudo systemctl restart jenkins
sudo -su jenkins
aws eks update-kubeconfig --name bookmyshow-eks --region us-east-1
```

### Pipeline Script (With K8S)

```groovy
pipeline {
    agent any

    tools {
        jdk 'jdk17'
        nodejs 'node23'
    }

    environment {
        SCANNER_HOME = tool 'sonar-scanner'
        DOCKER_IMAGE = 'kastrov/bms:latest'
        EKS_CLUSTER_NAME = 'bookmyshow-eks'
        AWS_REGION = 'ap-northeast-1'
    }

    stages {
        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }

        stage('Checkout from Git') {
            steps {
                git branch: 'main', url: 'https://github.com/KastroVKiran/Book-My-Show.git'
                sh 'ls -la'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonar-server') {
                    sh ''' 
                    $SCANNER_HOME/bin/sonar-scanner \
                        -Dsonar.projectName=BMS \
                        -Dsonar.projectKey=BMS
                    '''
                }
            }
        }

        stage('Quality Gate') {
            steps {
                script {
                    waitForQualityGate abortPipeline: false, credentialsId: 'Sonar-token'
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                cd bookmyshow-app
                ls -la
                if [ -f package.json ]; then
                    rm -rf node_modules package-lock.json
                    npm install
                else
                    echo "Error: package.json not found in bookmyshow-app!"
                    exit 1
                fi
                '''
            }
        }

        stage('Trivy FS Scan') {
            steps {
                sh 'trivy fs . > trivyfs.txt'
            }
        }

        stage('Docker Build & Push') {
            steps {
                script {
                    withDockerRegistry(credentialsId: 'docker', toolName: 'docker') {
                        sh ''' 
                        echo "Building Docker image..."
                        docker build --no-cache -t $DOCKER_IMAGE -f bookmyshow-app/Dockerfile bookmyshow-app

                        echo "Pushing Docker image to Docker Hub..."
                        docker push $DOCKER_IMAGE
                        '''
                    }
                }
            }
        }

        stage('Deploy to EKS Cluster') {
            steps {
                script {
                    sh '''
                    echo "Verifying AWS credentials..."
                    aws sts get-caller-identity

                    echo "Configuring kubectl for EKS cluster..."
                    aws eks update-kubeconfig --name $EKS_CLUSTER_NAME --region $AWS_REGION

                    echo "Verifying kubeconfig..."
                    kubectl config view

                    echo "Deploying application to EKS..."
                    kubectl apply -f deployment.yml
                    kubectl apply -f service.yml

                    echo "Verifying deployment..."
                    kubectl get pods
                    kubectl get svc
                    '''
                }
            }
        }
    }

    post {
        always {
            emailext attachLog: true,
                subject: "'${currentBuild.result}'",
                body: "Project: ${env.JOB_NAME}<br/>" +
                      "Build Number: ${env.BUILD_NUMBER}<br/>" +
                      "URL: ${env.BUILD_URL}<br/>",
                to: 'kastrokiran@gmail.com',
                attachmentsPattern: 'trivyfs.txt'
        }
    }
}
```

---

## Step 6: Monitoring Setup

### VM Setup

Launch a new Ubuntu VM for monitoring:

| Property | Value |
|----------|-------|
| **OS** | Ubuntu 22.04 |
| **Instance Type** | t2.medium |
| **Name** | Monitoring Server |

---

### 6.1 Prometheus Installation

#### Create Prometheus User

```bash
sudo apt update

sudo useradd \
    --system \
    --no-create-home \
    --shell /bin/false prometheus
```

> 💡 **Explanation:**
> - `--system`: Creates a system account
> - `--no-create-home`: No home directory needed
> - `--shell /bin/false`: Prevents login as Prometheus user

#### Download and Install Prometheus

```bash
# Download Prometheus
sudo wget https://github.com/prometheus/prometheus/releases/download/v2.47.1/prometheus-2.47.1.linux-amd64.tar.gz
tar -xvf prometheus-2.47.1.linux-amd64.tar.gz

# Create directories
sudo mkdir -p /data /etc/prometheus

# Install binaries
cd prometheus-2.47.1.linux-amd64/
sudo mv prometheus promtool /usr/local/bin/

# Install console libraries
sudo mv consoles/ console_libraries/ /etc/prometheus/

# Install configuration
sudo mv prometheus.yml /etc/prometheus/prometheus.yml

# Set ownership
sudo chown -R prometheus:prometheus /etc/prometheus/ /data/

# Cleanup
cd
rm -rf prometheus-2.47.1.linux-amd64.tar.gz

# Verify installation
prometheus --version
```

#### Create Systemd Service

```bash
sudo vi /etc/systemd/system/prometheus.service
```

Paste the following:

```ini
[Unit]
Description=Prometheus
Wants=network-online.target
After=network-online.target
StartLimitIntervalSec=500
StartLimitBurst=5

[Service]
User=prometheus
Group=prometheus
Type=simple
Restart=on-failure
RestartSec=5s
ExecStart=/usr/local/bin/prometheus \
  --config.file=/etc/prometheus/prometheus.yml \
  --storage.tsdb.path=/data \
  --web.console.templates=/etc/prometheus/consoles \
  --web.console.libraries=/etc/prometheus/console_libraries \
  --web.listen-address=0.0.0.0:9090 \
  --web.enable-lifecycle

[Install]
WantedBy=multi-user.target
```

#### Start Prometheus

```bash
sudo systemctl enable prometheus
sudo systemctl start prometheus
sudo systemctl status prometheus
```

**Access Prometheus:**
- URL: `http://<monitoring-server-ip>:9090`
- Navigate to **Status** → **Targets** to verify

---

### 6.2 Node Exporter Installation

```bash
# Create user
sudo useradd --system --no-create-home --shell /bin/false node_exporter

# Download and install
wget https://github.com/prometheus/node_exporter/releases/download/v1.6.1/node_exporter-1.6.1.linux-amd64.tar.gz
tar -xvf node_exporter-1.6.1.linux-amd64.tar.gz
sudo mv node_exporter-1.6.1.linux-amd64/node_exporter /usr/local/bin/
rm -rf node_exporter*

# Verify
node_exporter --version
```

#### Create Systemd Service

```bash
sudo vi /etc/systemd/system/node_exporter.service
```

Paste the following:

```ini
[Unit]
Description=Node Exporter
Wants=network-online.target
After=network-online.target
StartLimitIntervalSec=500
StartLimitBurst=5

[Service]
User=node_exporter
Group=node_exporter
Type=simple
Restart=on-failure
RestartSec=5s
ExecStart=/usr/local/bin/node_exporter --collector.logind

[Install]
WantedBy=multi-user.target
```

#### Start Node Exporter

```bash
sudo systemctl enable node_exporter
sudo systemctl start node_exporter
sudo systemctl status node_exporter
```

---

### 6.3 Prometheus Configuration

Edit the Prometheus configuration:

```bash
sudo vi /etc/prometheus/prometheus.yml
```

Add the following jobs at the end of the file:

```yaml
  - job_name: 'node_exporter'
    static_configs:
      - targets: ['<MonitoringVMip>:9100']

  - job_name: 'jenkins'
    metrics_path: '/prometheus'
    static_configs:
      - targets: ['<your-jenkins-ip>:<your-jenkins-port>']
```

> ⚠️ **Important:** Replace placeholders with actual IP addresses. Keep port `9100` for Node Exporter.

#### Validate and Reload Configuration

```bash
# Validate configuration
promtool check config /etc/prometheus/prometheus.yml

# Reload Prometheus
curl -X POST http://localhost:9090/-/reload
```

**Verify Targets:**
- Open Port `9100` in Security Group
- Access: `http://<prometheus-ip>:9090/targets`
- You should see: Jenkins (1/1 up), Node Exporter (1/1 up), Prometheus (1/1 up)

---

### 6.4 Grafana Installation

```bash
# Install dependencies
sudo apt-get update
sudo apt-get install -y apt-transport-https software-properties-common

# Add GPG key
cd
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -

# Add repository
echo "deb https://packages.grafana.com/oss/deb stable main" | sudo tee -a /etc/apt/sources.list.d/grafana.list

# Install Grafana
sudo apt-get update
sudo apt-get -y install grafana

# Start service
sudo systemctl enable grafana-server
sudo systemctl start grafana-server
sudo systemctl status grafana-server
```

**Access Grafana:**
- URL: `http://<monitoring-server-ip>:3000`
- Default credentials: `admin` / `admin`

#### Configure Grafana

1. **Add Data Source:**
   - Go to **Configuration** → **Data Sources**
   - Add **Prometheus** data source
   - URL: `http://localhost:9090`

2. **Import Dashboards:**
   - **Node Exporter Dashboard:** [ID: 1860](https://grafana.com/grafana/dashboards/1860-node-exporter-full/)
   - **Jenkins Dashboard:** [ID: 9964](https://grafana.com/grafana/dashboards/9964-jenkins-performance-and-health-overview/)

---

## Cleanup

> ⚠️ **Important:** Remember to delete all AWS resources created during this project to avoid unnecessary charges.

**Resources to Delete:**
- [ ] EKS Cluster and Node Groups
- [ ] EC2 Instances (BMS-Server, Monitoring Server)
- [ ] Security Groups
- [ ] IAM Users and Policies
- [ ] Any other associated resources

---

## 📚 Additional Resources

- [AWS EKS Documentation](https://docs.aws.amazon.com/eks/)
- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Docker Documentation](https://docs.docker.com/)

---

**Happy Deploying! 🚀**
