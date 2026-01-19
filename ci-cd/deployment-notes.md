# Deployment Notes

## CI/CD Pipeline

This folder contains Jenkins pipeline configurations for the BookMyShow application.

### Files

- **Jenkinsfile.build**: Pipeline for building and testing the application
- **Jenkinsfile.deploy**: Pipeline for deploying the application to Kubernetes

## Build Pipeline

The build pipeline handles:
- Installing dependencies
- Running tests
- Building Docker images
- Pushing images to container registry

## Deploy Pipeline

The deploy pipeline handles:
- Deploying to Kubernetes cluster
- Configuration management
- Rolling updates

## Prerequisites

- Jenkins server with required plugins
- Docker registry access
- Kubernetes cluster credentials
