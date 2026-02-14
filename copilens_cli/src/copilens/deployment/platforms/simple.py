"""
Simple Deployment Platform - Works without CLI tools
Uses direct file generation for deployment
"""

import os
import json
from pathlib import Path
from typing import Optional, Dict, Any, List
from ..base import DeploymentPlatform, DeploymentResult, DeploymentStatus


class SimpleDeployer(DeploymentPlatform):
    """
    Simple deployer that prepares project for deployment
    without requiring external CLI tools
    """
    
    def __init__(self, api_key: Optional[str] = None, config: Optional[Dict[str, Any]] = None):
        super().__init__(api_key, config)
        self.name = "simple"
    
    def is_available(self) -> bool:
        """Always available - no external dependencies"""
        return True
    
    def is_compatible(self, project_path: str) -> bool:
        """Compatible with any project"""
        return True
    
    def prepare(self, project_path: str) -> Dict[str, Any]:
        """Prepare project - generate all deployment configs"""
        path = Path(project_path)
        preparation = {'files_created': [], 'modifications': [], 'instructions': []}
        
        # Detect project type
        has_package_json = (path / 'package.json').exists()
        has_requirements = (path / 'requirements.txt').exists()
        has_go_mod = (path / 'go.mod').exists()
        
        # Generate Dockerfile if missing
        if not (path / 'Dockerfile').exists():
            if has_package_json:
                dockerfile = self._generate_node_dockerfile(path)
            elif has_requirements:
                dockerfile = self._generate_python_dockerfile(path)
            elif has_go_mod:
                dockerfile = self._generate_go_dockerfile(path)
            else:
                dockerfile = self._generate_generic_dockerfile()
            
            with open(path / 'Dockerfile', 'w') as f:
                f.write(dockerfile)
            preparation['files_created'].append('Dockerfile')
        
        # Generate .dockerignore
        if not (path / '.dockerignore').exists():
            dockerignore = """node_modules
__pycache__
*.pyc
.git
.gitignore
.env
*.log
dist
build
coverage
.pytest_cache
.vscode
.idea
"""
            with open(path / '.dockerignore', 'w') as f:
                f.write(dockerignore)
            preparation['files_created'].append('.dockerignore')
        
        # Generate .env.example
        if (path / '.env').exists() and not (path / '.env.example').exists():
            with open(path / '.env', 'r') as f:
                env_content = f.read()
            
            env_example = '\n'.join([
                line.split('=')[0] + '=' if '=' in line else line
                for line in env_content.split('\n')
            ])
            
            with open(path / '.env.example', 'w') as f:
                f.write(env_example)
            preparation['files_created'].append('.env.example')
        
        # Generate README if missing
        if not (path / 'README.md').exists():
            readme = f"""# {path.name}

## Quick Start

```bash
# Install dependencies
{"npm install" if has_package_json else "pip install -r requirements.txt" if has_requirements else "# Add install command"}

# Run
{"npm start" if has_package_json else "python app.py" if has_requirements else "# Add run command"}
```

## Deployment

This project is ready for deployment!

### Using Docker
```bash
docker build -t {path.name} .
docker run -p 3000:3000 {path.name}
```

### Environment Variables
See `.env.example` for required environment variables.
"""
            with open(path / 'README.md', 'w') as f:
                f.write(readme)
            preparation['files_created'].append('README.md')
        
        # Generate deployment instructions
        preparation['instructions'] = self._generate_deployment_instructions(
            has_package_json, has_requirements, has_go_mod
        )
        
        return preparation
    
    def deploy(self, project_path: str, **kwargs) -> DeploymentResult:
        """
        'Deploy' by preparing project and providing instructions
        """
        result = DeploymentResult(
            status=DeploymentStatus.SUCCESS,
            platform="simple"
        )
        
        try:
            # Prepare project
            result.logs.append("Preparing project for deployment...")
            prep = self.prepare(project_path)
            
            for file in prep['files_created']:
                result.logs.append(f"✓ Created {file}")
            
            # Build deployment package info
            result.logs.append("\n✅ Project is deployment-ready!")
            result.logs.append("\nNext steps:")
            
            for instruction in prep['instructions']:
                result.logs.append(f"  {instruction}")
            
            result.metadata = prep
            
        except Exception as e:
            result.status = DeploymentStatus.FAILED
            result.error = str(e)
            result.logs.append(f"Error: {e}")
        
        return result
    
    def get_status(self, deployment_id: str) -> DeploymentStatus:
        """Status check not applicable for simple deployer"""
        return DeploymentStatus.SUCCESS
    
    def rollback(self, deployment_id: str) -> bool:
        """Rollback not applicable"""
        return False
    
    def get_logs(self, deployment_id: str) -> List[str]:
        """No logs for simple deployer"""
        return []
    
    def _generate_node_dockerfile(self, path: Path) -> str:
        """Generate Node.js Dockerfile"""
        # Check package manager
        if (path / 'package-lock.json').exists():
            pkg_manager = "npm"
            install_cmd = "npm ci"
        elif (path / 'yarn.lock').exists():
            pkg_manager = "yarn"
            install_cmd = "yarn install --frozen-lockfile"
        elif (path / 'pnpm-lock.yaml').exists():
            pkg_manager = "pnpm"
            install_cmd = "pnpm install --frozen-lockfile"
        else:
            pkg_manager = "npm"
            install_cmd = "npm install"
        
        return f"""# Node.js Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
{"COPY yarn.lock ./" if pkg_manager == "yarn" else ""}
{"COPY pnpm-lock.yaml ./" if pkg_manager == "pnpm" else ""}

{"RUN npm install -g pnpm" if pkg_manager == "pnpm" else ""}
RUN {install_cmd}

COPY . .

RUN {pkg_manager} run build || true

EXPOSE 3000

CMD ["{pkg_manager}", "start"]
"""
    
    def _generate_python_dockerfile(self, path: Path) -> str:
        """Generate Python Dockerfile"""
        return """# Python Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "app.py"]
"""
    
    def _generate_go_dockerfile(self, path: Path) -> str:
        """Generate Go Dockerfile"""
        return """# Go Dockerfile
FROM golang:1.21-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o main .

FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/main .

EXPOSE 8080

CMD ["./main"]
"""
    
    def _generate_generic_dockerfile(self) -> str:
        """Generate generic Dockerfile"""
        return """# Generic Dockerfile
FROM alpine:latest

WORKDIR /app
COPY . .

# Add your build and run commands here
CMD ["sh", "-c", "echo 'Add your start command to Dockerfile'"]
"""
    
    def _generate_deployment_instructions(
        self, has_node: bool, has_python: bool, has_go: bool
    ) -> List[str]:
        """Generate deployment instructions"""
        instructions = []
        
        instructions.append("📦 Option 1: Deploy with Docker")
        instructions.append("   docker build -t myapp .")
        instructions.append("   docker run -p 3000:3000 myapp")
        instructions.append("")
        
        instructions.append("🌐 Option 2: Deploy to platforms")
        instructions.append("   - Heroku: heroku container:push web && heroku container:release web")
        instructions.append("   - Fly.io: fly launch")
        instructions.append("   - Render: Connect GitHub repo (auto-detects Dockerfile)")
        instructions.append("")
        
        instructions.append("🔑 Option 3: Use Copilens Railway deployer")
        instructions.append("   - Install Railway CLI: npm install -g @railway/cli")
        instructions.append("   - Run: railway login")
        instructions.append("   - Run: copilens deploy --platform railway")
        instructions.append("")
        
        instructions.append("📖 See DEPLOYMENT_GUIDE.md for detailed instructions")
        
        return instructions
