# ChamberForge Access Controls — Session Management, SSH Keys, Physical Security

**Document Owner**: Security Lead
**Last Reviewed**: 2026-04-03
**Version**: 1.0

---

## 1. Session Management (CC6.7)

### 1.1 Token Lifecycle

| Token Type | Lifetime | Storage | Revocation |
|------------|----------|---------|------------|
| Access Token (JWT) | 30 minutes | Client memory only (never localStorage) | Short-lived; expires naturally |
| Refresh Token | 7 days | HTTP-only secure cookie | Server-side revocation via token blocklist |
| MFA Session | 5 minutes | Server-side session | Expires after use or timeout |
| Client Portal Token | 24 hours | URL parameter (one-time use) | Single use; invalidated after first access |

### 1.2 Token Revocation Mechanisms

- **Logout** — Refresh token added to Redis-backed blocklist; checked on every refresh request
- **Password change** — All existing refresh tokens for the user are invalidated
- **Role change** — Existing tokens invalidated; user must re-authenticate
- **Admin revocation** — Admin can invalidate all sessions for any user via `/api/v1/auth/revoke-sessions/{user_id}`
- **Automatic expiry** — Access tokens expire after 30 minutes; refresh tokens after 7 days

### 1.3 Session Security Controls

| Control | Implementation |
|---------|---------------|
| Token signing | HS256 with rotating secret key |
| Refresh token rotation | New refresh token issued on each refresh; old token invalidated |
| Concurrent session limit | Configurable per workspace (default: 5 active sessions per user) |
| Idle timeout | No activity for 30 minutes triggers re-authentication |
| Blocklist storage | Redis with TTL matching token expiry (automatic cleanup) |

---

## 2. SSH Key Management (CC6.8)

### 2.1 Policy

ChamberForge production infrastructure runs on AWS ECS Fargate (serverless containers), which eliminates direct SSH access to production hosts. For the limited cases where SSH access is required (bastion host for database access), the following controls apply:

### 2.2 SSH Key Requirements

| Requirement | Standard |
|-------------|----------|
| Key type | ED25519 (preferred) or RSA 4096-bit minimum |
| Passphrase | Required; minimum 16 characters |
| Key rotation | Every 90 days |
| Shared keys | Prohibited; one key per individual |
| Key storage | Hardware security key or encrypted keychain only |

### 2.3 SSH Access Controls

| Control | Implementation |
|---------|---------------|
| Bastion host | Single point of entry; no direct SSH to application hosts |
| AWS Session Manager | Preferred over SSH for production access; provides audit logging |
| IP allowlisting | Bastion host accepts connections only from VPN IP range |
| MFA required | AWS SSO with MFA required before Session Manager access |
| Access logging | All SSH/Session Manager sessions logged to CloudWatch |
| Just-in-time access | Production database access granted on-request with 4-hour expiry |

### 2.4 Key Rotation Schedule

| Quarter | Activity | Owner |
|---------|----------|-------|
| Q1 | Rotate all SSH keys; revoke departed employee keys | SRE Lead |
| Q2 | Audit SSH key usage logs; verify no shared keys | Security Lead |
| Q3 | Rotate all SSH keys; review access list | SRE Lead |
| Q4 | Annual access review; remove unused keys | Security Lead |

---

## 3. Physical Access Controls (CC6.9)

### 3.1 AWS Shared Responsibility Model

ChamberForge infrastructure is hosted entirely on AWS. Physical security follows the AWS Shared Responsibility Model:

| Responsibility | Owner | Controls |
|---------------|-------|----------|
| Physical data center security | AWS | 24/7 security guards, biometric access, CCTV, mantrap entries |
| Environmental controls | AWS | Fire suppression, climate control, redundant power, UPS, generators |
| Hardware lifecycle | AWS | Secure media destruction (NIST 800-88), hardware decommissioning |
| Network infrastructure | AWS | DDoS protection (Shield), network segmentation |
| Logical access to cloud resources | ChamberForge | IAM policies, VPC configuration, security groups, encryption |
| Application security | ChamberForge | Authentication, authorization, data encryption, security testing |

### 3.2 AWS Compliance Certifications

AWS data centers maintain the following certifications (inherited by ChamberForge):

- SOC 1 / SOC 2 / SOC 3 Type II
- ISO 27001, ISO 27017, ISO 27018
- PCI DSS Level 1
- FedRAMP (GovCloud)
- CSA STAR Level 2

### 3.3 ChamberForge Office / Remote Work

| Control | Implementation |
|---------|---------------|
| Device encryption | Full disk encryption required on all devices (see `docs/security-handbook.md`) |
| Screen lock | Auto-lock after 5 minutes of inactivity |
| VPN required | VPN required for accessing internal tools and production dashboards |
| Clean desk policy | No sensitive information on physical desks or whiteboards |
| Device management | MDM for company-issued devices; remote wipe capability |
| Visitor access | Escorted access only; visitor log maintained |

---

## 4. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-03 | Security Lead | Initial access controls documentation |
