# AI Usage Statement

## Tool Used

Claude (Anthropic), used as a technical assistant during the 3-hour development period.

## How AI Supported the Development

AI was used selectively as a productivity and problem-solving tool to accelerate development while keeping technical decisions, integration, and validation under my responsibility.

- **Technical planning:** Assisted in clarifying requirements, identifying edge cases, and organizing the implementation approach.
- **Implementation assistance:** Consulted for guidance on specific React, TypeScript, API integration, and testing challenges. Suggestions were reviewed and adapted to the project requirements.
- **Code review:** Helped identify potential concurrency issues, asynchronous loading conflicts, and inconsistencies. I evaluated the findings, applied corrections, and added tests.
- **Testing and debugging:** Supported the identification of test scenarios and troubleshooting of TypeScript, configuration, and application issues.
- **Documentation:** Assisted with the structure and wording of the technical documentation, which I reviewed against the final implementation.

## My Contributions and Responsibilities

I remained responsible for the technical direction, integration, and validation of the application.

My work included:

- Setting up the project and development environment.
- Integrating and adapting the application components.
- Implementing and validating the main application workflows.
- Handling API errors, optimistic updates, rollback mechanisms, and asynchronous operations.
- Running automated and manual tests.
- Reviewing the final code to ensure I could explain its logic and behaviour.
- Managing Git commits and prioritizing features within the available time.

## Validation and Quality Assurance

The final implementation was checked through TypeScript type checking (`tsc -b`), 20 automated Vitest tests, manual functional testing, and direct code inspection.

Particular attention was given to error handling, state consistency, asynchronous requests, URL synchronization, and user interactions.

## Limitations and Further Improvements

Given the limited development time, some implementation alternatives were not fully evaluated. Accessibility testing with screen readers and automated accessibility audits were not performed. Dark-mode colours were visually reviewed but not formally checked with a contrast tool.

**AI was used as a targeted development assistant to improve efficiency during the 3-hour assessment. I remained responsible for reviewing, adapting, integrating, and validating the resulting implementation.**