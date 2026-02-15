"""
Base classes for deployment platforms
"""

from abc import ABC, abstractmethod
from enum import Enum
from dataclasses import dataclass
from typing import Optional, Dict, Any, List
from datetime import datetime


class DeploymentStatus(Enum):
    """Deployment status"""
    PENDING = "pending"
    PREPARING = "preparing"
    BUILDING = "building"
    DEPLOYING = "deploying"
    SUCCESS = "success"
    FAILED = "failed"
    ROLLED_BACK = "rolled_back"


@dataclass
class DeploymentResult:
    """Result of a deployment"""
    status: DeploymentStatus
    platform: str
    url: Optional[str] = None
    deployment_id: Optional[str] = None
    logs: List[str] = None
    error: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.logs is None:
            self.logs = []
        if self.metadata is None:
            self.metadata = {}
        if self.started_at is None:
            self.started_at = datetime.now()


class DeploymentPlatform(ABC):
    """Abstract base class for deployment platforms"""
    
    def __init__(self, api_key: Optional[str] = None, config: Optional[Dict[str, Any]] = None):
        self.api_key = api_key
        self.config = config or {}
        self.name = self.__class__.__name__.replace('Deployer', '').lower()
    
    @abstractmethod
    def is_available(self) -> bool:
        """Check if platform is available/configured"""
        pass
    
    @abstractmethod
    def is_compatible(self, project_path: str) -> bool:
        """Check if project is compatible with this platform"""
        pass
    
    @abstractmethod
    def prepare(self, project_path: str) -> Dict[str, Any]:
        """Prepare project for deployment"""
        pass
    
    @abstractmethod
    def deploy(self, project_path: str, **kwargs) -> DeploymentResult:
        """Deploy the project"""
        pass
    
    @abstractmethod
    def get_status(self, deployment_id: str) -> DeploymentStatus:
        """Get deployment status"""
        pass
    
    @abstractmethod
    def rollback(self, deployment_id: str) -> bool:
        """Rollback deployment"""
        pass
    
    @abstractmethod
    def get_logs(self, deployment_id: str) -> List[str]:
        """Get deployment logs"""
        pass
    
    def get_platform_name(self) -> str:
        """Get platform name"""
        return self.name
