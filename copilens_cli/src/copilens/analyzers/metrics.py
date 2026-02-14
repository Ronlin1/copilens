"""Metrics calculation and aggregation"""
from typing import List, Dict
import pandas as pd
from pydantic import BaseModel


class FileMetrics(BaseModel):
    """Metrics for a single file"""
    file_path: str
    ai_percentage: float
    added_lines: int
    deleted_lines: int
    complexity: int
    risk_score: float
    risk_level: str


class AggregateMetrics(BaseModel):
    """Aggregated metrics across all files"""
    total_files: int
    total_added_lines: int
    total_deleted_lines: int
    average_ai_percentage: float
    average_risk_score: float
    high_risk_files: int
    total_complexity_delta: int


class MetricsEngine:
    """Calculates and aggregates metrics"""
    
    def __init__(self):
        self.file_metrics: List[FileMetrics] = []
    
    def add_file_metrics(self, metrics: FileMetrics) -> None:
        """Add metrics for a file"""
        self.file_metrics.append(metrics)
    
    def calculate_aggregate(self) -> AggregateMetrics:
        """Calculate aggregate metrics"""
        if not self.file_metrics:
            return AggregateMetrics(
                total_files=0,
                total_added_lines=0,
                total_deleted_lines=0,
                average_ai_percentage=0.0,
                average_risk_score=0.0,
                high_risk_files=0,
                total_complexity_delta=0
            )
        
        total_added = sum(m.added_lines for m in self.file_metrics)
        total_deleted = sum(m.deleted_lines for m in self.file_metrics)
        avg_ai = sum(m.ai_percentage for m in self.file_metrics) / len(self.file_metrics)
        avg_risk = sum(m.risk_score for m in self.file_metrics) / len(self.file_metrics)
        high_risk = sum(1 for m in self.file_metrics if m.risk_level in ["high", "critical"])
        total_complexity = sum(m.complexity for m in self.file_metrics)
        
        return AggregateMetrics(
            total_files=len(self.file_metrics),
            total_added_lines=total_added,
            total_deleted_lines=total_deleted,
            average_ai_percentage=round(avg_ai, 2),
            average_risk_score=round(avg_risk, 2),
            high_risk_files=high_risk,
            total_complexity_delta=total_complexity
        )
    
    def to_dataframe(self) -> pd.DataFrame:
        """Convert metrics to pandas DataFrame"""
        data = [m.model_dump() for m in self.file_metrics]
        return pd.DataFrame(data)
    
    def export_csv(self, file_path: str) -> None:
        """Export metrics to CSV"""
        df = self.to_dataframe()
        df.to_csv(file_path, index=False)
    
    def export_json(self, file_path: str) -> None:
        """Export metrics to JSON"""
        df = self.to_dataframe()
        df.to_json(file_path, orient='records', indent=2)
