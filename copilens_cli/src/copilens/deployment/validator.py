"""
Deployment Validator and Fix Suggester
Pre-checks before deployment and suggests automatic fixes
"""

from pathlib import Path
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from rich.console import Console
from rich.table import Table
from rich.panel import Panel

console = Console()


@dataclass
class ValidationIssue:
    """Represents a deployment validation issue"""
    level: str  # 'error', 'warning', 'info'
    category: str  # 'config', 'security', 'dependency', 'architecture'
    message: str
    fix_suggestion: Optional[str] = None
    auto_fixable: bool = False
    fix_code: Optional[str] = None


class DeploymentValidator:
    """Validates project deployment readiness"""
    
    def __init__(self, project_dir: Path = None):
        self.project_dir = project_dir or Path.cwd()
        self.issues: List[ValidationIssue] = []
    
    def validate(self) -> Tuple[bool, List[ValidationIssue]]:
        """
        Run all validation checks
        
        Returns:
            (is_ready: bool, issues: List[ValidationIssue])
        """
        self.issues = []
        
        # Run all checks
        self._check_required_files()
        self._check_environment_variables()
        self._check_dependencies()
        self._check_security()
        self._check_build_config()
        self._check_ports_and_urls()
        self._check_database_config()
        
        # Determine if ready
        has_errors = any(issue.level == 'error' for issue in self.issues)
        is_ready = not has_errors
        
        return is_ready, self.issues
    
    def _check_required_files(self):
        """Check for required configuration files"""
        
        # Detect project type
        has_package_json = (self.project_dir / 'package.json').exists()
        has_requirements = (self.project_dir / 'requirements.txt').exists()
        has_composer = (self.project_dir / 'composer.json').exists()
        has_go_mod = (self.project_dir / 'go.mod').exists()
        
        # Node.js project
        if has_package_json:
            if not (self.project_dir / 'package-lock.json').exists():
                self.issues.append(ValidationIssue(
                    level='warning',
                    category='dependency',
                    message='Missing package-lock.json - inconsistent dependencies across deploys',
                    fix_suggestion='Run: npm install',
                    auto_fixable=True,
                    fix_code='npm install'
                ))
        
        # Python project
        if has_requirements:
            # Check for runtime version specification
            runtime_files = ['runtime.txt', '.python-version', 'Pipfile']
            has_runtime = any((self.project_dir / f).exists() for f in runtime_files)
            
            if not has_runtime:
                self.issues.append(ValidationIssue(
                    level='warning',
                    category='config',
                    message='Missing runtime.txt - Python version not specified',
                    fix_suggestion='Create runtime.txt with: python-3.11',
                    auto_fixable=True,
                    fix_code='echo "python-3.11" > runtime.txt'
                ))
        
        # Dockerfile
        if not (self.project_dir / 'Dockerfile').exists():
            self.issues.append(ValidationIssue(
                level='warning',
                category='config',
                message='Missing Dockerfile - consider adding for containerization',
                fix_suggestion='Generate Dockerfile with: copilens generate dockerfile',
                auto_fixable=False
            ))
        
        # .gitignore
        if not (self.project_dir / '.gitignore').exists():
            self.issues.append(ValidationIssue(
                level='warning',
                category='config',
                message='Missing .gitignore - sensitive files may be committed',
                fix_suggestion='Create .gitignore with common patterns',
                auto_fixable=True,
                fix_code=self._create_gitignore_content()
            ))
    
    def _check_environment_variables(self):
        """Check for environment variable configuration"""
        
        has_env_example = (self.project_dir / '.env.example').exists()
        has_env = (self.project_dir / '.env').exists()
        
        if has_env and not has_env_example:
            self.issues.append(ValidationIssue(
                level='warning',
                category='config',
                message='Has .env but missing .env.example - others won\'t know required variables',
                fix_suggestion='Create .env.example from .env (without sensitive values)',
                auto_fixable=False
            ))
        
        # Check .env is in .gitignore
        if has_env:
            gitignore = self.project_dir / '.gitignore'
            if gitignore.exists():
                content = gitignore.read_text()
                if '.env' not in content:
                    self.issues.append(ValidationIssue(
                        level='error',
                        category='security',
                        message='.env file not in .gitignore - SECURITY RISK!',
                        fix_suggestion='Add .env to .gitignore',
                        auto_fixable=True,
                        fix_code='echo ".env" >> .gitignore'
                    ))
    
    def _check_dependencies(self):
        """Check dependency configurations"""
        
        package_json = self.project_dir / 'package.json'
        if package_json.exists():
            import json
            try:
                data = json.loads(package_json.read_text())
                
                # Check for start script
                scripts = data.get('scripts', {})
                if 'start' not in scripts:
                    self.issues.append(ValidationIssue(
                        level='error',
                        category='config',
                        message='Missing "start" script in package.json',
                        fix_suggestion='Add "start": "node server.js" to scripts',
                        auto_fixable=False
                    ))
                
                # Check for build script (if relevant)
                if 'build' not in scripts and any(dep in data.get('dependencies', {}) for dep in ['react', 'vue', 'next', '@angular/core']):
                    self.issues.append(ValidationIssue(
                        level='warning',
                        category='config',
                        message='Missing "build" script for frontend framework',
                        fix_suggestion='Add build script for production bundle',
                        auto_fixable=False
                    ))
            except:
                pass
    
    def _check_security(self):
        """Check for security issues"""
        
        # Check for exposed secrets
        common_secret_files = [
            '.env',
            'config/secrets.yml',
            'secrets.json',
            'credentials.json',
            'service-account.json'
        ]
        
        gitignore_path = self.project_dir / '.gitignore'
        if gitignore_path.exists():
            gitignore_content = gitignore_path.read_text()
            
            for secret_file in common_secret_files:
                file_path = self.project_dir / secret_file
                if file_path.exists() and secret_file not in gitignore_content:
                    self.issues.append(ValidationIssue(
                        level='error',
                        category='security',
                        message=f'Secret file {secret_file} not in .gitignore!',
                        fix_suggestion=f'Add {secret_file} to .gitignore',
                        auto_fixable=True,
                        fix_code=f'echo "{secret_file}" >> .gitignore'
                    ))
        
        # Check for hardcoded secrets in common files
        check_files = ['app.py', 'server.js', 'config.js', 'settings.py']
        secret_patterns = ['password', 'api_key', 'secret_key', 'token']
        
        for filename in check_files:
            file_path = self.project_dir / filename
            if file_path.exists():
                try:
                    content = file_path.read_text().lower()
                    for pattern in secret_patterns:
                        if f'{pattern} = "' in content or f'{pattern}="' in content:
                            self.issues.append(ValidationIssue(
                                level='error',
                                category='security',
                                message=f'Potential hardcoded secret in {filename}',
                                fix_suggestion='Move secrets to environment variables',
                                auto_fixable=False
                            ))
                            break
                except:
                    pass
    
    def _check_build_config(self):
        """Check build configuration"""
        
        # Check for production mode settings
        package_json = self.project_dir / 'package.json'
        if package_json.exists():
            import json
            try:
                data = json.loads(package_json.read_text())
                scripts = data.get('scripts', {})
                
                # Check if start script uses production mode
                start_script = scripts.get('start', '')
                if 'NODE_ENV=production' not in start_script and 'node ' in start_script:
                    self.issues.append(ValidationIssue(
                        level='warning',
                        category='config',
                        message='Start script may not be using production mode',
                        fix_suggestion='Set NODE_ENV=production in start script',
                        auto_fixable=False
                    ))
            except:
                pass
    
    def _check_ports_and_urls(self):
        """Check port configurations"""
        
        # Look for hardcoded ports
        check_files = ['server.js', 'app.py', 'main.go', 'server.py']
        
        for filename in check_files:
            file_path = self.project_dir / filename
            if file_path.exists():
                try:
                    content = file_path.read_text()
                    
                    # Check for hardcoded port
                    if 'listen(3000' in content or 'port = 3000' in content or 'PORT = 3000' in content:
                        if 'process.env.PORT' not in content and 'os.getenv' not in content:
                            self.issues.append(ValidationIssue(
                                level='warning',
                                category='config',
                                message=f'Hardcoded port in {filename} - should use environment variable',
                                fix_suggestion='Use process.env.PORT || 3000 (Node.js) or os.getenv("PORT", 3000) (Python)',
                                auto_fixable=False
                            ))
                except:
                    pass
    
    def _check_database_config(self):
        """Check database configuration"""
        
        # Check for database URL configuration
        check_files = ['.env.example', 'config.py', 'database.js']
        
        has_db_config = False
        for filename in check_files:
            file_path = self.project_dir / filename
            if file_path.exists():
                try:
                    content = file_path.read_text()
                    if 'DATABASE_URL' in content or 'DB_HOST' in content:
                        has_db_config = True
                        break
                except:
                    pass
        
        # Check if using database but no config
        package_json = self.project_dir / 'package.json'
        if package_json.exists():
            import json
            try:
                data = json.loads(package_json.read_text())
                deps = {**data.get('dependencies', {}), **data.get('devDependencies', {})}
                
                db_packages = ['pg', 'mysql', 'mongodb', 'mongoose', 'sequelize', 'typeorm']
                uses_db = any(pkg in deps for pkg in db_packages)
                
                if uses_db and not has_db_config:
                    self.issues.append(ValidationIssue(
                        level='warning',
                        category='config',
                        message='Database package detected but no configuration found',
                        fix_suggestion='Add DATABASE_URL to .env.example',
                        auto_fixable=False
                    ))
            except:
                pass
    
    def _create_gitignore_content(self) -> str:
        """Generate .gitignore content"""
        return """# Created by Copilens
# Environment variables
.env
.env.local
.env.*.local

# Dependencies
node_modules/
__pycache__/
*.pyc
vendor/

# Build outputs
dist/
build/
*.log

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
"""
    
    def display_results(self, is_ready: bool, issues: List[ValidationIssue]):
        """Display validation results"""
        
        if is_ready and not issues:
            console.print(Panel(
                "[bold green]✓ Deployment Ready![/bold green]\n\n"
                "No issues found. Your project is ready to deploy!",
                border_style="green",
                title="Validation Results"
            ))
            return
        
        # Categorize issues
        errors = [i for i in issues if i.level == 'error']
        warnings = [i for i in issues if i.level == 'warning']
        infos = [i for i in issues if i.level == 'info']
        
        # Summary
        status = "❌ Not Ready" if errors else "⚠️  Ready with Warnings"
        status_color = "red" if errors else "yellow"
        
        console.print(f"\n[bold {status_color}]{status}[/bold {status_color}]\n")
        
        # Create table
        table = Table(title="Deployment Validation Issues", show_header=True)
        table.add_column("Level", style="bold", width=8)
        table.add_column("Category", width=12)
        table.add_column("Issue", width=50)
        table.add_column("Fix", width=40)
        
        for issue in errors + warnings + infos:
            level_color = {
                'error': 'red',
                'warning': 'yellow',
                'info': 'cyan'
            }.get(issue.level, 'white')
            
            level_icon = {
                'error': '❌',
                'warning': '⚠️ ',
                'info': 'ℹ️ '
            }.get(issue.level, '')
            
            table.add_row(
                f"[{level_color}]{level_icon} {issue.level.upper()}[/{level_color}]",
                issue.category,
                issue.message,
                issue.fix_suggestion or "-"
            )
        
        console.print(table)
        
        # Show auto-fixable count
        auto_fixable = [i for i in issues if i.auto_fixable]
        if auto_fixable:
            console.print(f"\n[bold cyan]✨ {len(auto_fixable)} issue(s) can be automatically fixed![/bold cyan]")
            console.print("[dim]Run with --auto-fix to apply fixes[/dim]")
    
    def apply_fixes(self) -> int:
        """
        Apply automatic fixes
        
        Returns:
            Number of fixes applied
        """
        fixed = 0
        
        for issue in self.issues:
            if not issue.auto_fixable or not issue.fix_code:
                continue
            
            try:
                # Handle different fix types
                if issue.fix_code.startswith('echo '):
                    # File write operations
                    self._apply_echo_fix(issue.fix_code)
                    console.print(f"[green]✓ Fixed: {issue.message}[/green]")
                    fixed += 1
                elif issue.category == 'config':
                    # Config fixes
                    console.print(f"[yellow]⚠️  Manual fix required: {issue.fix_suggestion}[/yellow]")
                
            except Exception as e:
                console.print(f"[red]✗ Failed to fix: {issue.message} - {e}[/red]")
        
        return fixed
    
    def _apply_echo_fix(self, fix_code: str):
        """Apply echo-based fix"""
        # Parse echo command
        import shlex
        parts = shlex.split(fix_code)
        
        if len(parts) >= 3 and parts[0] == 'echo':
            content = parts[1]
            operator = parts[2]  # > or >>
            filename = parts[3] if len(parts) > 3 else None
            
            if filename:
                file_path = self.project_dir / filename
                
                if operator == '>':
                    # Overwrite
                    file_path.write_text(content + '\n')
                elif operator == '>>':
                    # Append
                    existing = file_path.read_text() if file_path.exists() else ''
                    file_path.write_text(existing + content + '\n')
