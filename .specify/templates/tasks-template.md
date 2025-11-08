---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**TDD Principles (t-wada)**: If the project constitution requires TDD, MUST follow these principles strictly:

1. **Small Steps (小さなステップ)**: Focus on ONE test case at a time
2. **Red-Green-Refactor**: For EACH test case:
   - **[Red]**: Write ONE failing test
   - **[Green]**: Write minimal code to pass that ONE test
   - **[Refactor]**: Improve code while keeping tests passing
3. **Test-First (テストファースト)**: Always write test before implementation
4. **Test Independence**: Each test must not depend on other tests

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

<!-- 
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.
  
  The /speckit.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/
  
  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment
  
  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize [language] project with [framework] dependencies
- [ ] T003 [P] Configure linting and formatting tools

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

**If TDD is required, follow this pattern for EACH test case**:

#### Test Case 1: [Description of specific test scenario]

- [ ] T004 **[Red]** Write test: [specific behavior to test] (tests/path/to/test.test.ts)
- [ ] T005 **[Green]** Define types/interfaces needed to pass T004 (src/types/...)
- [ ] T006 **[Green]** Implement minimal code to pass T004 (src/path/to/code.ts)
- [ ] T007 **[Green]** Run tests and verify T004 passes
- [ ] T008 **[Refactor]** Clean up code if needed (tests still passing)

#### Test Case 2: [Description of another specific test scenario]

- [ ] T009 **[Red]** Write test: [specific behavior to test] (tests/path/to/test.test.ts)
- [ ] T010 **[Green]** Extend implementation to pass T009
- [ ] T011 **[Green]** Run tests and verify both T004 and T009 pass
- [ ] T012 **[Refactor]** Improve code structure (tests still passing)

**If TDD is NOT required**:

- [ ] T004 Setup database schema and migrations framework
- [ ] T005 [P] Implement authentication/authorization framework
- [ ] T006 [P] Setup API routing and middleware structure
- [ ] T007 Create base models/entities that all stories depend on

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### User Story 1 Implementation

**If TDD is required, follow this pattern for EACH test case**:

#### Test Case 1: [Specific acceptance scenario from spec.md]

- [ ] T013 **[Red]** [US1] Write test: [specific behavior] (tests/path/test_[name].test.ts)
- [ ] T014 **[Green]** [US1] Create minimal types/models to pass T013
- [ ] T015 **[Green]** [US1] Implement minimal code to pass T013
- [ ] T016 **[Green]** [US1] Run tests and verify T013 passes
- [ ] T017 **[Refactor]** [US1] Clean up code (tests still passing)

#### Test Case 2: [Another specific acceptance scenario]

- [ ] T018 **[Red]** [US1] Write test: [specific behavior] (tests/path/test_[name].test.ts)
- [ ] T019 **[Green]** [US1] Extend implementation to pass T018
- [ ] T020 **[Green]** [US1] Run tests and verify both T013 and T018 pass
- [ ] T021 **[Refactor]** [US1] Improve code structure (tests still passing)

[Continue this pattern for each test case from acceptance scenarios]

#### UI and Polish

- [ ] TXXX **[Refactor]** [US1] Apply styling with Tailwind CSS for mobile-first design
- [ ] TXXX **[Refactor]** [US1] Add semantic HTML and accessibility features

**If TDD is NOT required**:

- [ ] T013 [P] [US1] Create [Entity1] model in src/models/[entity1].py
- [ ] T014 [P] [US1] Create [Entity2] model in src/models/[entity2].py
- [ ] T015 [US1] Implement [Service] in src/services/[service].py (depends on T013, T014)
- [ ] T016 [US1] Implement [endpoint/feature] in src/[location]/[file].py
- [ ] T017 [US1] Add validation and error handling

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### User Story 2 Implementation

**If TDD is required, follow Red-Green-Refactor for EACH test case**:

#### Test Case 1: [Specific acceptance scenario from spec.md]

- [ ] TXXX **[Red]** [US2] Write test: [specific behavior] (tests/...)
- [ ] TXXX **[Green]** [US2] Implement minimal code to pass test
- [ ] TXXX **[Green]** [US2] Run tests and verify pass
- [ ] TXXX **[Refactor]** [US2] Clean up code (tests still passing)

[Continue this pattern for each test case from acceptance scenarios]

**If TDD is NOT required**:

- [ ] TXXX [P] [US2] Create [Entity] model in src/models/[entity].py
- [ ] TXXX [US2] Implement [Service] in src/services/[service].py
- [ ] TXXX [US2] Implement [endpoint/feature] in src/[location]/[file].py
- [ ] TXXX [US2] Integrate with User Story 1 components (if needed)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### User Story 3 Implementation

**If TDD is required, follow Red-Green-Refactor for EACH test case**:

#### Test Case 1: [Specific acceptance scenario from spec.md]

- [ ] TXXX **[Red]** [US3] Write test: [specific behavior] (tests/...)
- [ ] TXXX **[Green]** [US3] Implement minimal code to pass test
- [ ] TXXX **[Green]** [US3] Run tests and verify pass
- [ ] TXXX **[Refactor]** [US3] Clean up code (tests still passing)

[Continue this pattern for each test case from acceptance scenarios]

**If TDD is NOT required**:

- [ ] TXXX [P] [US3] Create [Entity] model in src/models/[entity].py
- [ ] TXXX [US3] Implement [Service] in src/services/[service].py
- [ ] TXXX [US3] Implement [endpoint/feature] in src/[location]/[file].py

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### Code Quality Checks

- [ ] TXXX Run full test suite and verify all tests pass (including new tests)
- [ ] TXXX Run TypeScript type check (`npx tsc --noEmit`) and fix errors
- [ ] TXXX Run ESLint and fix linting issues
- [ ] TXXX Code cleanup: remove unused imports and commented code

### Code Review (Constitution Compliance Check)

If the project has a constitution (e.g., .specify/memory/constitution.md), perform these checks:

- [ ] TXXX **[Code Review]** Type safety check: Verify no improper use of `any` type
- [ ] TXXX **[Code Review]** TDD cycle check: Verify all new code was implemented test-first
- [ ] TXXX **[Code Review]** Security patterns check: Verify input validation, XSS protection
- [ ] TXXX **[Code Review]** Performance check: Verify proper use of optimization (e.g., useMemo, caching)
- [ ] TXXX **[Code Review]** Accessibility check: Verify semantic HTML, ARIA labels
- [ ] TXXX **[Code Review]** UI/UX check: Verify proper language/localization for target users
- [ ] TXXX **[Code Review]** Responsive design check: Verify mobile-first implementation

### Functional Testing

- [ ] TXXX Performance testing: Verify performance goals are met
- [ ] TXXX Accessibility testing: Verify keyboard navigation and screen reader compatibility
- [ ] TXXX Mobile testing: Verify layouts at different viewport sizes (320px, 768px, 1024px)
- [ ] TXXX Cross-browser testing: Verify in Chrome, Firefox, Safari
- [ ] TXXX Edge case testing: Verify edge cases from spec.md work correctly

### Documentation

- [ ] TXXX [P] Update project documentation (e.g., README, CLAUDE.md) with latest changes
- [ ] TXXX Run quickstart.md validation: Verify setup instructions work
- [ ] TXXX **[Required]** SPECIFICATION.md更新
  - [ ] バージョン番号の更新
  - [ ] 機能一覧に新機能を追加
  - [ ] データモデル変更の反映（該当する場合）
  - [ ] API仕様に新規関数を追加（該当する場合）
  - [ ] UI/UX仕様に新規ページを追加（該当する場合）
  - [ ] テスト仕様の統計を更新
  - [ ] 変更履歴に実装完了を記録

### Code Review Issue Resolution

- [ ] TXXX **[Fix]** Fix issues identified in code review (if any)
- [ ] TXXX **[Green]** Re-run all tests after fixes and verify they pass
- [ ] TXXX **[Manual]** Manual testing after fixes to verify functionality

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

**If TDD is required (t-wada principles)**:
- **ONE test case at a time**: Never batch multiple test cases together
- **Red-Green-Refactor cycle for EACH test**:
  1. Red: Write ONE failing test
  2. Green: Write minimal code to pass that ONE test
  3. Refactor: Improve code while tests stay passing
- **Small steps**: Each task must focus on ONE specific behavior
- **Test independence**: Each test must run independently

**If TDD is NOT required**:
- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

**IMPORTANT**: If TDD is required, parallel execution is LIMITED by the Red-Green-Refactor cycle:
- **Within a test case**: NEVER run Red-Green-Refactor steps in parallel (must be sequential)
- **Across different test cases for same feature**: Should run SEQUENTIALLY (one test at a time)
- **Across different user stories**: Can run in parallel by different team members

**If TDD is NOT required**:
- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if tests requested):
Task: "Contract test for [endpoint] in tests/contract/test_[name].py"
Task: "Integration test for [user journey] in tests/integration/test_[name].py"

# Launch all models for User Story 1 together:
Task: "Create [Entity1] model in src/models/[entity1].py"
Task: "Create [Entity2] model in src/models/[entity2].py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

**General**:
- [P] tasks = different files, no dependencies (only valid when TDD is NOT required)
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

**TDD-Specific (if required by constitution)**:
- **[Red]**, **[Green]**, **[Refactor]** labels are MANDATORY for all test-related tasks
- **ONE test case at a time**: Never batch multiple test cases into one task
- **Small steps**: Each Red-Green-Refactor cycle should be completable in <30 minutes
- **Verify Red**: Always ensure test FAILS before writing implementation
- **Verify Green**: Always run tests to confirm they PASS after implementation
- **Independent tests**: Each test must run independently without relying on execution order
- **NO parallel execution within same feature**: Tests for same feature MUST run sequentially
