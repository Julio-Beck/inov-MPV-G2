# Implementation Plan: Oportuniza Rede
**Branch**: none | **Date**: 2026-11-06 | **Spec**: [spec.md](spec.md)

## Summary
Build a complete frontend demonstration of a multi-institution career network. Static HTML, CSS and
JavaScript modules provide routed pages, shared domain state and localStorage persistence.

## Technical Context
**Language/Version**: HTML5, CSS3, JavaScript ES2022 modules.
**Primary Dependencies**: None at runtime; Node built-ins for serving and testing.
**Storage**: Versioned localStorage key; in-memory fallback on denied access.
**Testing**: Node domain tests and browser-driven end-to-end checks.
**Target Platform**: Modern desktop and mobile browsers.
**Project Type**: Static frontend application.
**Performance Goals**: Immediate local interactions; no blocking remote data.
**Constraints**: Simulated sessions and contracts; no actual backend or legal claims.
**Scale/Scope**: Three workspaces, three institutions, vacancy details, candidate board, profile,
branding, internship records, help and restore workflow.

## Constitution Check
PASS before and after design: complete journeys; explicit demo identity; Portuguese and accessible
controls; scoped institution records; no runtime dependencies or unneeded backend.

## Project Structure
Documentation: spec.md, plan.md, research.md, data-model.md, contracts/ui.md, quickstart.md, tasks.md.
Source: dist/index.html, dist/styles.css, dist/app.js, dist/domain.mjs, server.mjs, tests/domain.test.mjs.
**Structure Decision**: Buildless static site avoids installation friction and supports private Sites hosting.

## Complexity Tracking
No constitutional violations. PowerShell setup-plan failed because Defender blocks PowerShell writes;
resolved templates were read successfully and files are authored with the permitted file editor.
