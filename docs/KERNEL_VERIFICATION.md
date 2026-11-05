# SCAM BRAKE — KERNEL INDEPENDENT DIRECTORY VERIFICATION

**Sponsor:** KERNEL  
**Classification:** `MOCK_MODE` (Certified Local Registry Active; `REAL_INTEGRATION` enabled when `KERNEL_API_KEY` is provided).

---

## 1. Problem Space: Caller ID Spoofing

Scammers routinely manipulate caller ID metadata to display:
- "INTERNAL REVENUE SERVICE"
- "US TREASURY"
- "CHASE BANK FRAUD DEPT"
- Local police department phone numbers

Victims who call back the number displayed on their incoming caller ID reconnect directly with the fraud syndicate.

---

## 2. KERNEL Solution

Scam Brake integrates **KERNEL Out-of-Band Directory Verification**:
1. When a customer reports caller affiliation during the intervention, Scam Brake initiates a certified directory lookup.
2. The user interface prominently warns the customer:
   > *"Caller ID can be spoofed by anyone with basic internet software. Do NOT trust the number that called you. Hang up and call the certified public switchboard below."*
3. Displays the authentic public telephone switchboard (e.g. `1-800-829-1040` for IRS).
4. When `KERNEL_API_KEY` is present, KERNEL's cloud browser navigates to the government or financial institution's official security domain and cryptographically verifies the current SSL/TLS certificate.

---

## 3. Strict SSRF Security Controls

To prevent Server-Side Request Forgery:
- Non-allowlisted external URLs and private internal IP addresses (`127.0.0.1`, `10.*`, `192.168.*`, `169.254.169.254`) are rejected by `kernelVerificationClient.isUrlAllowed()`.
- Only explicitly authorized financial and government domains (`irs.gov`, `ssa.gov`, `ftc.gov`, `chase.com`, `apple.com`, `microsoft.com`) are navigable.

