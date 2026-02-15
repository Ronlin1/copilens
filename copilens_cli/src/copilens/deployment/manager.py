"""
Deployment Manager for Copilens
Orchestrates deployments across platforms
"""

import os
from pathlib import Path
from typing import Optional, Dict, Any, List
from datetime import datetime
import json

from .base import DeploymentPlatform, DeploymentResult, DeploymentStatus
from copilens.analyzers.architecture_detector import ArchitectureDetector


class DeploymentManager:
    """Manages deployments across multiple platforms"""
    
    def __init__(self, project_path: str = "."):
        self.project_path = Path(project_path)
        self.platforms: List[DeploymentPlatform] = []
        self.state_file = Path.home() / '.copilens' / 'deployments.json'
        self.state_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Register platforms
        self._register_platforms()
    
    def _register_platforms(self):
        """Register available deployment platforms"""
        # Always add simple deployer first (no dependencies)
        try:
            from .platforms.simple import SimpleDeployer
            self.platforms.append(SimpleDeployer())
        except Exception:
            pass
        
        # Add Railway if available
        try:
            from .platforms.railway import RailwayDeployer
            railway = RailwayDeployer()
            if railway.is_available():
                self.platforms.append(railway)
        except Exception:
            pass
        
        # Add more platforms as they're implemented
        # from .platforms.vercel import VercelDeployer
        # from .platforms.netlify import NetlifyDeployer
        # etc.
    
    def auto_select_platform(self) -> Optional[DeploymentPlatform]:
        """Automatically select best platform"""
        detector = ArchitectureDetector(str(self.project_path))
        arch = detector.detect()
        
        # Find compatible and available platforms
        compatible = [
            p for p in self.platforms
            if p.is_available() and p.is_compatible(str(self.project_path))
        ]
        
        if not compatible:
            return None
        
        # Prefer recommended platform if available
        if arch.recommended_platform:
            for platform in compatible:
                if arch.recommended_platform in platform.get_platform_name():
                    return platform
        
        # Return first compatible
        return compatible[0]
    
    def prepare_deployment(self) -> Dict[str, Any]:
        """Prepare project for deployment"""
        platform = self.auto_select_platform()
        
        if not platform:
            return {
                'success': False,
                'error': 'No compatible platform found'
            }
        
        prep_result = platform.prepare(str(self.project_path))
        
        return {
            'success': True,
            'platform': platform.get_platform_name(),
            'preparation': prep_result
        }
    
    def deploy(
        self, 
        platform_name: Optional[str] = None,
        **kwargs
    ) -> DeploymentResult:
        """Deploy project"""
        
        # Select platform
        if platform_name:
            platform = self._get_platform_by_name(platform_name)
            if not platform:
                return DeploymentResult(
                    status=DeploymentStatus.FAILED,
                    platform=platform_name,
                    error=f"Platform {platform_name} not available"
                )
        else:
            platform = self.auto_select_platform()
            if not platform:
                return DeploymentResult(
                    status=DeploymentStatus.FAILED,
                    platform="auto",
                    error="No compatible platform found"
                )
        
        # Prepare
        platform.prepare(str(self.project_path))
        
        # Deploy
        result = platform.deploy(str(self.project_path), **kwargs)
        
        # Save deployment state
        self._save_deployment(result)
        
        return result
    
    def get_deployment_status(self, deployment_id: str) -> Optional[DeploymentStatus]:
        """Get deployment status"""
        deployment = self._load_deployment(deployment_id)
        if not deployment:
            return None
        
        platform = self._get_platform_by_name(deployment['platform'])
        if not platform:
            return None
        
        return platform.get_status(deployment_id)
    
    def list_deployments(self) -> List[Dict[str, Any]]:
        """List all deployments"""
        try:
            if self.state_file.exists():
                with open(self.state_file, 'r') as f:
                    data = json.load(f)
                    return data.get('deployments', [])
        except Exception:
            pass
        
        return []
    
    def _get_platform_by_name(self, name: str) -> Optional[DeploymentPlatform]:
        """Get platform by name"""
        for platform in self.platforms:
            if name.lower() in platform.get_platform_name().lower():
                return platform
        return None
    
    def _save_deployment(self, result: DeploymentResult):
        """Save deployment to state file"""
        try:
            deployments = []
            if self.state_file.exists():
                with open(self.state_file, 'r') as f:
                    data = json.load(f)
                    deployments = data.get('deployments', [])
            
            deployment = {
                'id': result.deployment_id or datetime.now().isoformat(),
                'platform': result.platform,
                'status': result.status.value,
                'url': result.url,
                'timestamp': datetime.now().isoformat(),
                'project_path': str(self.project_path)
            }
            
            deployments.append(deployment)
            
            # Keep only last 50 deployments
            deployments = deployments[-50:]
            
            with open(self.state_file, 'w') as f:
                json.dump({'deployments': deployments}, f, indent=2)
        
        except Exception:
            pass
    
    def _load_deployment(self, deployment_id: str) -> Optional[Dict[str, Any]]:
        """Load deployment from state"""
        deployments = self.list_deployments()
        for d in deployments:
            if d['id'] == deployment_id:
                return d
        return None


class SimpleDockerDeployer:
    """
    Simple Docker-based deployment for any platform
    Generates Dockerfile and docker-compose.yml
    """
    
    @staticmethod
    def generate_dockerfile(project_path: Path) -> str:
        """Generate Dockerfile based on project type"""
        
        # Detect project type
        if (project_path / 'package.json').exists():
            return SimpleDockerDeployer._node_dockerfile(project_path)
        elif (project_path / 'requirements.txt').exists():
            return SimpleDockerDeployer._python_dockerfile(project_path)
        elif (project_path / 'go.mod').exists():
            return SimpleDockerDeployer._go_dockerfile()
        
        return ""
    
    @staticmethod
    def _node_dockerfile(project_path: Path) -> str:
        """Generate Node.js Dockerfile"""
        # Detect Node version
        node_version = "20"
        
        # Check if using pnpm, yarn, or npm
        pkg_manager = "npm"
        if (project_path / 'pnpm-lock.yaml').exists():
            pkg_manager = "pnpm"
        elif (project_path / 'yarn.lock').exists():
            pkg_manager = "yarn"
        
        return f"""# Node.js Dockerfile
FROM node:{node_version}-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
{"COPY pnpm-lock.yaml ./" if pkg_manager == "pnpm" else ""}
{"COPY yarn.lock ./" if pkg_manager == "yarn" else ""}

# Install dependencies
{"RUN npm install -g pnpm && pnpm install --frozen-lockfile" if pkg_manager == "pnpm" else ""}
{"RUN yarn install --frozen-lockfile" if pkg_manager == "yarn" else ""}
{"RUN npm ci" if pkg_manager == "npm" else ""}

# Copy app files
COPY . .

# Build if needed
RUN {"pnpm build" if pkg_manager == "pnpm" else "yarn build" if pkg_manager == "yarn" else "npm run build"} || true

# Expose port
EXPOSE 3000

# Start command
CMD ["{pkg_manager}", "start"]
"""
    
    @staticmethod
    def _python_dockerfile(project_path: Path) -> str:
        """Generate Python Dockerfile"""
        python_version = "3.11"
        
        return f"""# Python Dockerfile
FROM python:{python_version}-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app files
COPY . .

# Expose port
EXPOSE 8000

# Start command (adjust based on your app)
CMD ["python", "app.py"]
"""
    
    @staticmethod
    def _go_dockerfile() -> str:
        """Generate Go Dockerfile"""
        return """# Go Dockerfile
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build
RUN go build -o main .

# Final stage
FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/main .

# Expose port
EXPOSE 8080

# Run
CMD ["./main"]
"""
