# Security Policy

ShipCheck accepts arbitrary URLs to audit, so its network-handling code (URL validation, HTTP fetch, browser navigation) is security-sensitive — see the "Security model" section of the project spec for the SSRF-protection requirements that code must satisfy.

> **This is a skeleton.** A full disclosure process and supported-versions table will be added in a later pass. Until then, please report suspected vulnerabilities privately to the maintainers rather than opening a public issue.
