from setuptools import setup, find_packages

setup(
    name="copilens",
    version="0.1.0",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    install_requires=[
        "typer>=0.9.0",
        "rich>=13.0.0",
        "GitPython>=3.1.40",
        "radon>=6.0.1",
        "pandas>=2.0.0",
        "numpy>=1.24.0",
        "pydantic>=2.0.0",
        "textual>=0.41.0",
    ],
    entry_points={
        "console_scripts": [
            "copilens=copilens.cli:app",
        ],
    },
    python_requires=">=3.8",
)
