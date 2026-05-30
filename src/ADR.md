# ADR: Subject Existence Validation

## Status
Deferred

## Context
The review module accepts `subject_type` and `subject_id` references without validating that the referenced subject (album, track, artist, podcast) actually exists. This means reviews can reference non-existent subjects.

## Decision
Subject existence validation is deferred until the referenced modules (album, track, artist, podcast) are implemented. At that point, an `ISubjectExistenceChecker` outbound port should be defined and injected into `CreateReviewService` to validate references before persisting.

## Consequences
- Reviews may reference non-existent subjects until validation is added
- The `DomainExceptionFilter` already maps `SUBJECT_NOT_FOUND` to 422, ready for when validation is implemented
- A database migration to add foreign key constraints may be needed
