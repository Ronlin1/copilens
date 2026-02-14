@echo off
echo Installing Copilens CLI dependencies...
python -m pip install typer rich GitPython radon pandas numpy pydantic textual
echo.
echo Installing Copilens CLI in development mode...
python -m pip install -e .
echo.
echo Installation complete!
echo.
echo Try running: copilens --help
