# CloudFusion architecture

CloudFusion is an incremental evolution of [LOVENISH87/CloudMerge](https://github.com/LOVENISH87/CloudMerge), retained under its original MIT license and attribution.

## Current system

The React 19/Vite frontend calls an Express 5 REST API. Prisma persists users, connected Google Drive accounts, folders and the unified file index in MySQL. Google OAuth tokens remain encrypted using the existing AES-256-GCM utility.

Placement is isolated in `backend/src/strategies/placementEngine.ts`. It accepts provider-neutral account facts and returns a decision plus factor-level explanations. The upload route adapts Google account records into that interface; a future Dropbox or OneDrive adapter can use the same contract without changing the algorithms.

The unauthenticated `/simulator` endpoint is intentionally demo-only. It mutates an in-memory copy of the submitted accounts and never calls a cloud provider.

Quota synchronization stores Google Drive's `usageInDrive` value. Google Workspace's broader `usage` field can include pooled organization storage outside Drive and must not be presented as this application's Drive usage.

## Request flow

1. The browser selects an algorithm and sends it with the multipart upload.
2. The upload service loads connected Google accounts and asks the placement strategy for an ordered candidate list.
3. Google Drive performs the upload. Existing quota failover remains in place.
4. The unified file record is created only after the provider confirms the upload.

## Boundaries and limitations

Google Drive is the only implemented provider. Duplicate hashing, persistent placement history and reliability statistics are not yet wired to the database; the adaptive engine uses a neutral `0.5` default for those optional factors. The simulator is deterministic and should be used for academic comparison without presenting its results as real API measurements.
