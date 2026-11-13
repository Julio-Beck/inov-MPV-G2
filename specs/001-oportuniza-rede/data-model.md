# Data model
- Institution: id, name, shortName, accent; three seeded institutions.
- Student: id, institutionId, name (required, max 80), headline (max 120), course, shift, bio (max 600), project (max 180).
- Company: one active fictional employer plus fictional external vacancy publishers.
- Vacancy: id, companyId, title (required, max 100), course, type, mode, shift, location,
  salary (nonnegative), hours (1..30 for internships), supervisor (required for internships),
  description (required, max 3000), institutionIds (at least one), status (open/closed), createdAt.
- Application: id, vacancyId, studentId, stage (Inscrito/Em análise/Entrevista/Contratado), createdAt.
  Unique vacancyId + studentId; stages may move in either direction for demo correction.
- Saved: unique vacancyId + studentId.
- Recommendation: unique vacancyId + studentId + institutionId; student must belong to institution.
- Internship: derived from hired applications, with demo document status and report status.
All records reside in state version 1. A malformed root falls back to initial samples. No real identity or access boundary.
