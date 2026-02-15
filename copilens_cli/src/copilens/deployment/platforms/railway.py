"""
Railway Platform Deployer
"""

import os
import subprocess
import json
from pathlib import Path
from typing import Optional, Dict, Any, List
from ..base import DeploymentPlatform, DeploymentResult, DeploymentStatus


class RailwayDeployer(DeploymentPlatform):
    """Deploy to Railway.app"""
    
    def __init__(self, api_key: Optional[str] = None, config: Optional[Dict[str, Any]] = None):
        super().__init__(api_key, config)
        self.api_key = api_key or os.getenv("RAILWAY_API_KEY")
    
    def is_available(self) -> bool:
        """Check if Railway CLI is installed"""
        try:
            result = subprocess.run(
                ['railway', '--version'],
                capture_output=True,
                text=True,
                timeout=5
            )
            return result.returncode == 0
        except Exception:
            return False
    
    def is_compatible(self, project_path: str) -> bool:
        """Check if project is compatible with Railway"""
        path = Path(project_path)
        
        # Railway supports Node.js, Python, Go, Ruby, etc.
        compatible_files = [
            'package.json',      # Node.js
            'requirements.txt',  # Python
            'Pipfile',           # Python
            'go.mod',            # Go
            'Gemfile',           # Ruby
            'Dockerfile'         # Docker
        ]
        
        return any((path / f).exists() for f in compatible_files)
    
    def prepare(self, project_path: str) -> Dict[str, Any]:
        """Prepare project for Railway deployment"""
        path = Path(project_path)
        preparation = {'files_created': [], 'modifications': []}
        
        # Check for railway.json
        if not (path / 'railway.json').exists():
            railway_config = {
                "build": {
                    "builder": "NIXPACKS"
                },
                "deploy": {
                    "startCommand": self._detect_start_command(path),
                    "restartPolicyType": "ON_FAILURE",
                    "restartPolicyMaxRetries": 10
                }
            }
            
            with open(path / 'railway.json', 'w') as f:
                json.dump(railway_config, f, indent=2)
            
            preparation['files_created'].append('railway.json')
        
        # Ensure .railwayignore exists
        if not (path / '.railwayignore').exists():
            with open(path / '.railwayignore', 'w') as f:
                f.write('\n'.join([
                    'node_modules',
                    '__pycache__',
                    '.git',
                    '.env',
                    'dist',
                    'build',
                    'coverage'
                ]))
            preparation['files_created'].append('.railwayignore')
        
        return preparation
    
    def deploy(self, project_path: str, **kwargs) -> DeploymentResult:
        """Deploy to Railway"""
        result = DeploymentResult(
            status=DeploymentStatus.PENDING,
            platform="railway"
        )
        
        try:
            # Check if logged in
            result.logs.append("Checking Railway authentication...")
            if not self._is_logged_in():
                result.status = DeploymentStatus.FAILED
                result.error = "Not logged in to Railway. Run: railway login"
                return result
            
            # Initialize Railway project if needed
            result.logs.append("Initializing Railway project...")
            self._init_project(project_path)
            
            # Deploy
            result.status = DeploymentStatus.DEPLOYING
            result.logs.append("Deploying to Railway...")
            
            deploy_result = subprocess.run(
                ['railway', 'up', '--detach'],
                cwd=project_path,
                capture_output=True,
                text=True,
                timeout=300
            )
            
            if deploy_result.returncode == 0:
                result.status = DeploymentStatus.SUCCESS
                result.logs.append("Deployment successful!")
                
                # Get deployment URL
                url = self._get_deployment_url(project_path)
                result.url = url
                result.logs.append(f"URL: {url}")
            else:
                result.status = DeploymentStatus.FAILED
                result.error = deploy_result.stderr
                result.logs.append(f"Deployment failed: {deploy_result.stderr}")
        
        except Exception as e:
            result.status = DeploymentStatus.FAILED
            result.error = str(e)
            result.logs.append(f"Error: {e}")
        
        return result
    
    def get_status(self, deployment_id: str) -> DeploymentStatus:
        """Get deployment status"""
        try:
            result = subprocess.run(
                ['railway', 'status'],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if 'success' in result.stdout.lower():
                return DeploymentStatus.SUCCESS
            elif 'failed' in result.stdout.lower():
                return DeploymentStatus.FAILED
            else:
                return DeploymentStatus.DEPLOYING
        except Exception:
            return DeploymentStatus.FAILED
    
    def rollback(self, deployment_id: str) -> bool:
        """Rollback deployment (not directly supported, would need redeploy)"""
        return False
    
    def get_logs(self, deployment_id: str) -> List[str]:
        """Get deployment logs"""
        try:
            result = subprocess.run(
                ['railway', 'logs'],
                capture_output=True,
                text=True,
                timeout=10
            )
            return result.stdout.split('\n')
        except Exception:
            return []
    
    def _is_logged_in(self) -> bool:
        """Check if logged in to Railway"""
        try:
            result = subprocess.run(
                ['railway', 'whoami'],
                capture_output=True,
                text=True,
                timeout=5
            )
            return result.returncode == 0
        except Exception:
            return False
    
    def _init_project(self, project_path: str):
        """Initialize Railway project"""
        try:
            # Check if already initialized
            if (Path(project_path) / '.railway').exists():
                return
            
            # Initialize
            subprocess.run(
                ['railway', 'init', '--yes'],
                cwd=project_path,
                capture_output=True,
                timeout=30
            )
        except Exception:
            pass
    
    def _get_deployment_url(self, project_path: str) -> Optional[str]:
        """Get deployment URL"""
        try:
            result = subprocess.run(
                ['railway', 'domain'],
                cwd=project_path,
                capture_output=True,
                text=True,
                timeout=10
            )
            
            # Parse URL from output
            for line in result.stdout.split('\n'):
                if 'http' in line:
                    return line.strip()
            
            return None
        except Exception:
            return None
    
    def _detect_start_command(self, path: Path) -> str:
        """Detect start command"""
        if (path / 'package.json').exists():
            return "npm start"
        elif (path / 'requirements.txt').exists():
            if (path / 'app.py').exists():
                return "python app.py"
            elif (path / 'main.py').exists():
                return "python main.py"
            return "gunicorn app:app"
        elif (path / 'go.mod').exists():
            return "go run ."
        
        return "npm start"
