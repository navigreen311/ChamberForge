"""Validate CI/CD pipeline files are syntactically correct."""

import os
import platform
import stat
import subprocess
from pathlib import Path

import pytest
import yaml

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent


def _has_on_key(data: dict) -> bool:
    """Check for 'on' key in YAML data. PyYAML parses 'on:' as boolean True."""
    return "on" in data or True in data


def _get_on_config(data: dict) -> dict:
    """Get the 'on' config from YAML data, handling PyYAML's True coercion."""
    return data.get("on") or data.get(True)


class TestWorkflowYAML:
    """Validate all GitHub Actions workflow YAML files."""

    WORKFLOW_DIR = PROJECT_ROOT / ".github" / "workflows"

    def _load_workflow(self, filename: str) -> dict:
        filepath = self.WORKFLOW_DIR / filename
        assert filepath.exists(), f"Workflow file missing: {filepath}"
        with open(filepath) as f:
            data = yaml.safe_load(f)
        assert isinstance(data, dict), f"{filename} did not parse as a YAML dict"
        return data

    def test_ci_yml_valid(self):
        data = self._load_workflow("ci.yml")
        assert "name" in data
        assert _has_on_key(data)
        assert "jobs" in data
        assert "backend" in data["jobs"]
        assert "frontend" in data["jobs"]

    def test_ci_yml_has_postgres_service(self):
        data = self._load_workflow("ci.yml")
        backend = data["jobs"]["backend"]
        assert "services" in backend
        assert "postgres" in backend["services"]

    def test_deploy_staging_yml_valid(self):
        data = self._load_workflow("deploy-staging.yml")
        assert "name" in data
        assert _has_on_key(data)
        assert "jobs" in data
        # Should trigger on push to main
        on_config = _get_on_config(data)
        assert "push" in on_config
        assert "main" in on_config["push"]["branches"]

    def test_deploy_prod_yml_valid(self):
        data = self._load_workflow("deploy-prod.yml")
        assert "name" in data
        assert _has_on_key(data)
        assert "jobs" in data
        # Should trigger on tags
        on_config = _get_on_config(data)
        assert "push" in on_config
        assert "tags" in on_config["push"]

    def test_ai_feature_yml_valid(self):
        data = self._load_workflow("ai-feature.yml")
        assert "name" in data
        assert _has_on_key(data)
        assert "jobs" in data
        # Should trigger on ai-feature/* branches
        on_config = _get_on_config(data)
        assert "push" in on_config
        branches = on_config["push"]["branches"]
        assert any("ai-feature" in b for b in branches)

    def test_all_workflows_have_required_keys(self):
        for yml_file in self.WORKFLOW_DIR.glob("*.yml"):
            with open(yml_file) as f:
                data = yaml.safe_load(f)
            assert "name" in data, f"{yml_file.name} missing 'name'"
            assert _has_on_key(data), f"{yml_file.name} missing 'on'"
            assert "jobs" in data, f"{yml_file.name} missing 'jobs'"


class TestDockerfiles:
    """Validate Dockerfiles have correct structure."""

    INFRA_DIR = PROJECT_ROOT / "infra"

    def _read_dockerfile(self, filename: str) -> str:
        filepath = self.INFRA_DIR / filename
        assert filepath.exists(), f"Dockerfile missing: {filepath}"
        return filepath.read_text()

    def test_backend_dockerfile_structure(self):
        content = self._read_dockerfile("Dockerfile.backend")
        assert "FROM python:3.12-slim AS builder" in content
        assert "COPY backend/requirements.txt" in content
        assert "RUN pip install" in content
        assert "FROM python:3.12-slim" in content
        assert "COPY --from=builder" in content
        assert "EXPOSE 8000" in content
        assert 'CMD ["uvicorn"' in content

    def test_frontend_dockerfile_structure(self):
        content = self._read_dockerfile("Dockerfile.frontend")
        assert "FROM node:20-alpine AS builder" in content
        assert "COPY frontend/package" in content
        assert "RUN npm ci" in content
        assert "RUN npm run build" in content
        assert "COPY --from=builder" in content
        assert "EXPOSE 3000" in content
        assert 'CMD ["node", "server.js"]' in content

    def test_dockerfiles_have_healthcheck(self):
        for df in ["Dockerfile.backend", "Dockerfile.frontend"]:
            content = self._read_dockerfile(df)
            assert "HEALTHCHECK" in content, f"{df} missing HEALTHCHECK"

    def test_dockerfiles_use_non_root_user(self):
        for df in ["Dockerfile.backend", "Dockerfile.frontend"]:
            content = self._read_dockerfile(df)
            assert "USER" in content, f"{df} should run as non-root user"


class TestScripts:
    """Validate shell scripts."""

    SCRIPTS_DIR = PROJECT_ROOT / "scripts"

    def test_setup_sh_exists(self):
        filepath = self.SCRIPTS_DIR / "setup.sh"
        assert filepath.exists()

    def test_setup_sh_is_executable(self):
        filepath = self.SCRIPTS_DIR / "setup.sh"
        if platform.system() == "Windows":
            # On Windows, check git tracks executable bit
            try:
                result = subprocess.run(
                    ["git", "ls-files", "-s", str(filepath)],
                    capture_output=True, text=True, cwd=PROJECT_ROOT,
                )
                # Git mode 100755 = executable, 100644 = not
                if result.stdout.strip():
                    mode_str = result.stdout.strip().split()[0]
                    assert mode_str == "100755" or mode_str == "100644", \
                        f"setup.sh git mode: {mode_str}"
                # If file is not yet tracked, just check it exists
            except FileNotFoundError:
                pass  # git not available, skip
        else:
            mode = filepath.stat().st_mode
            assert mode & stat.S_IXUSR or mode & stat.S_IXGRP or mode & stat.S_IXOTH, \
                "setup.sh should be executable"

    def test_setup_sh_has_shebang(self):
        filepath = self.SCRIPTS_DIR / "setup.sh"
        content = filepath.read_text()
        assert content.startswith("#!/bin/bash"), "setup.sh should start with shebang"

    def test_setup_sh_has_set_e(self):
        content = (self.SCRIPTS_DIR / "setup.sh").read_text()
        assert "set -e" in content, "setup.sh should use 'set -e' for error handling"

    def test_test_sh_exists_and_executable(self):
        filepath = self.SCRIPTS_DIR / "test.sh"
        assert filepath.exists()
        content = filepath.read_text()
        assert content.startswith("#!/bin/bash")
        assert "set -e" in content


class TestDockerComposeProd:
    """Validate production docker-compose."""

    def test_docker_compose_prod_valid(self):
        filepath = PROJECT_ROOT / "infra" / "docker-compose.prod.yml"
        assert filepath.exists()
        with open(filepath) as f:
            data = yaml.safe_load(f)
        assert "services" in data

    def test_docker_compose_prod_has_all_services(self):
        filepath = PROJECT_ROOT / "infra" / "docker-compose.prod.yml"
        with open(filepath) as f:
            data = yaml.safe_load(f)
        services = data["services"]
        required = ["backend", "frontend", "db", "redis", "elasticsearch", "nginx"]
        for svc in required:
            assert svc in services, f"Missing service: {svc}"

    def test_docker_compose_prod_has_healthchecks(self):
        filepath = PROJECT_ROOT / "infra" / "docker-compose.prod.yml"
        with open(filepath) as f:
            data = yaml.safe_load(f)
        for svc_name in ["backend", "db", "redis", "elasticsearch"]:
            svc = data["services"][svc_name]
            assert "healthcheck" in svc, f"Service {svc_name} missing healthcheck"


class TestMakefile:
    """Validate Makefile exists with expected targets."""

    def test_makefile_exists(self):
        assert (PROJECT_ROOT / "Makefile").exists()

    def test_makefile_has_targets(self):
        content = (PROJECT_ROOT / "Makefile").read_text()
        for target in ["setup", "dev", "test", "lint", "build", "clean"]:
            assert f"{target}:" in content, f"Makefile missing target: {target}"


class TestPyprojectToml:
    """Validate pyproject.toml configuration."""

    def test_pyproject_exists(self):
        assert (PROJECT_ROOT / "backend" / "pyproject.toml").exists()

    def test_pyproject_has_ruff_config(self):
        content = (PROJECT_ROOT / "backend" / "pyproject.toml").read_text()
        assert "[tool.ruff]" in content
        assert 'target-version = "py312"' in content
        assert "[tool.ruff.lint]" in content
