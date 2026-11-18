# CloudFusion project report

## Objective

CloudFusion investigates whether explainable adaptive placement can balance a multi-account storage pool better than first-fit or round-robin allocation while preserving Google Drive failover.

## Contributions

This project retains the original CloudMerge authentication, Google Drive integration, unified file index and quota workflow. CloudFusion adds a provider-neutral placement engine, three selectable algorithms, factor-level adaptive explanations, and a deterministic simulator that is safe for demonstrations.

## Evaluation method

Use identical simulated accounts and file workloads for all algorithms. Measure success/failure counts, per-account utilization, utilization imbalance and decision execution time. Actual API reliability must be reported separately from simulated reliability.

## Limitations and future work

Only Google Drive is currently implemented. Persistent round-robin cursors, duplicate SHA-256 metadata, upload-attempt history and reliability aggregation should be added in the next iteration. Dropbox and OneDrive adapters can then implement the provider boundary without changing the placement engine.
