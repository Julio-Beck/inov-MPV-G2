# Feature Specification: Oportuniza Rede

**Feature Branch**: none (Git extension not installed)
**Created**: 2026-11-06
**Status**: Ready for implementation
**Input**: Build realistic interactive MVP pages based on the supplied conversation and market research.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Find and apply to opportunities (Priority: P1)
As a student I find opportunities for my institution, inspect details, save jobs and apply.
**Why this priority**: This is the core value delivered to students.
**Independent Test**: Search a seeded vacancy, open details, save and apply, then inspect applications.
**Acceptance Scenarios**:
1. Given a published vacancy for my institution, when I apply, then one application is recorded.
2. Given an existing application, when I revisit the vacancy, then another application is prevented.
3. Given filters with no matches, then a clear empty state offers a way to reset filters.

### User Story 2 - Publish and recruit across institutions (Priority: P1)
As an employer I publish vacancies to selected institutions and move applicants through stages.
**Why this priority**: Supply and recruitment connect all three personas.
**Independent Test**: Publish a valid vacancy, switch to student and apply, then advance the application.
**Acceptance Scenarios**:
1. Given a valid vacancy with institution audiences, publication makes it visible to those institutions.
2. Given an application, moving its stage updates the student's tracking and institution metrics.
3. Given missing required values or invalid workload, publication is prevented with actionable errors.

### User Story 3 - Manage an institution's career network (Priority: P2)
As an institution I see my opportunities and students, recommend candidates and configure portal branding.
**Why this priority**: Demonstrates a repeatable multi-institution product.
**Independent Test**: Switch institutions; change portal name and theme; verify scoped listings.
**Acceptance Scenarios**:
1. Changing institution does not reveal another institution's student records.
2. Saving branding updates its portal identity after reload.
3. A recommendation is visible alongside the relevant applicant in the employer panel.

### User Story 4 - Maintain profile and operate the demonstration (Priority: P2)
As a student I edit my profile and portfolio; as a presenter I can explore all personas and restore samples.
**Independent Test**: Edit profile, reload, check persistence; confirm reset restores initial records.

### Edge Cases
- Duplicate saves/applications; missing storage permissions; corrupted stored state; long user input.
- No vacancies, no applicants, no matches, institution not included in a vacancy, mobile navigation.
- Demo contract actions must not imply legally binding signatures.

## Requirements *(mandatory)*
### Functional Requirements
- **FR-001**: Provide navigable student, employer and institution workspaces with explicit persona switch.
- **FR-002**: Search and filter vacancies by text, type, work mode and compatible shift.
- **FR-003**: Show detail pages, save/unsave, apply once and track stages.
- **FR-004**: Publish vacancies with title, course, description, mode, shift, compensation and audience.
- **FR-005**: Internship demo validation requires supervisor and workload from 1 to 30 hours weekly.
- **FR-006**: Employers can advance applicant stages and close/reopen their own vacancies.
- **FR-007**: Institution metrics derive from scoped sample and newly created records.
- **FR-008**: Institutions can recommend students and configure their own portal name and accent.
- **FR-009**: Students can edit name, headline, bio and a portfolio project.
- **FR-010**: Persist changes on the current browser; explain unavailable storage without breaking navigation.
- **FR-011**: Provide demo internship status controls and label all signatures as simulated.
- **FR-012**: Provide reset confirmation, accessible dialogs, keyboard support and mobile navigation.
- **FR-013**: All people, jobs and organizations are fictional; figures describe demonstration data.

### Key Entities
Institution, Student, Company, Vacancy, Application, Recommendation, Demo Internship.

## Success Criteria *(mandatory)*
### Measurable Outcomes
- **SC-001**: Publish → apply → shortlist → hire is demonstrable in under five minutes.
- **SC-002**: Reload preserves published jobs, applications, profile and branding.
- **SC-003**: At 390px and 1440px the main pages have no horizontal overflow.
- **SC-004**: Every primary action has visible feedback and duplicate applications are prevented.
- **SC-005**: Switching among three institutions demonstrates different records and shared vacancies.

## Assumptions
- Only interactive frontend pages are requested; real authentication, backend, billing and signatures excluded.
- Personas are seeded demo sessions, not access-control guarantees.
- Pricing and employment statistics from the research are not validated product claims.
- A single employer account manages seeded company vacancies; no actual external submissions.
