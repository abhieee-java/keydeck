# Security reporting

Keydeck is an early preview. No production security audit or complete device compatibility review has been performed.

For a vulnerability involving unauthorized input, credential disclosure, or a compromised release, do not post exploit details or credentials in a public issue. Use GitHub's private vulnerability reporting if the repository's Security tab offers it. Otherwise, open a minimal issue requesting a private contact channel without sensitive details.

Ordinary connection problems belong in the bug-report template. Supported security fixes currently target the newest published preview; no older release support window is promised.

Maintainers: preserve the APK signing key across releases, keep it out of the repository, and verify signatures/checksums before publishing. See [release procedures](docs/RELEASING.md).
