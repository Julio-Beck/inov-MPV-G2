# Tasks: Oportuniza Rede
**Input**: spec.md, plan.md, research.md, data-model.md, contracts/ui.md.

## Phase 1: Setup
- [ ] T001 Create static entry and local server in dist/index.html and server.mjs.
## Phase 2: Foundation
- [ ] T002 Implement seed records, scoped selectors and domain mutations in dist/domain.mjs.
- [ ] T003 Implement accessible responsive shell, navigation and persistence in dist/app.js and dist/styles.css.
## Phase 3: US1 — Student opportunities
Independent test: filter, inspect, save and apply to one vacancy without duplicates.
- [ ] T004 [US1] Build filters, vacancy cards and details in dist/app.js.
- [ ] T005 [US1] Build saved vacancies and application progress in dist/app.js.
## Phase 4: US2 — Employer recruitment
Independent test: publish a vacancy and advance a seeded or new candidate.
- [ ] T006 [US2] Build vacancy form, validation and employer list in dist/app.js.
- [ ] T007 [US2] Build employer dashboard, applicant stages and vacancy closing in dist/app.js.
## Phase 5: US3 — Institution management
Independent test: scoped records, recommendation and persistent branding.
- [ ] T008 [US3] Build institution dashboard and talent recommendations in dist/app.js.
- [ ] T009 [US3] Build portal branding and simulated internship management in dist/app.js.
## Phase 6: US4 — Profile and demo operation
Independent test: edit profile, reload, cancel/confirm restore.
- [ ] T010 [US4] Build profile form, portfolio, help and reset in dist/app.js.
## Phase 7: Polish
- [ ] T011 Verify domain invariants in tests/domain.test.mjs and browser journeys; record evidence in verification.md.
- [ ] T012 Document operation in README.md and package/deploy static dist/.

## Dependencies & Execution Order
T001 → T002 → T003 → US1 → US2 → US3 → US4 → verification → packaging.
Story components share app.js; implementation runs sequentially. Independent documentation can be
authored while browser checks run; no parallel agent work is required.

## Implementation Strategy
Deliver the student slice first, then connect employer and institution mutations to the same state.
Validate each slice against the independent test above; only then mark its tasks completed.
