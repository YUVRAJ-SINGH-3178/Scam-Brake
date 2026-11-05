# SCAM BRAKE: PRODUCTION DEPLOYMENT GUIDE

Scam Brake is packaged for deployment on **Render** using containerized infrastructure as code (`render.yaml`).

---

## 1. Prerequisites
- Render account ([render.com](https://render.com))
- GitHub repository connected to Render
- PayPal Sandbox Client ID & Secret

---

## 2. Infrastructure Architecture on Render

```
[ Render Web Service ]        [ Render Background Worker ]
   (Next.js App & API)        (Durable Payment Monitor)
           │                               │
           └──────────────┬────────────────┘
                          ▼
            [ Render PostgreSQL Database ]
```

1. **Web Service (`scambrake-app`):**
   - Node 26 environment
   - Build: `npm install && npx prisma generate && npm run build`
   - Start: `npm run start`
   - Health check: `/api/health`
2. **Background Worker (`scambrake-background-worker`):**
   - Performs durable 30-second sweeps to evaluate intervention hold expiration and execute automated pre-capture policy voids.
   - Start: `node dist/server/worker/scheduler.js`
3. **Database (`scambrake-db`):**
   - Managed PostgreSQL instance with automated backups and connection pooling.

---

## 3. Deploy via Blueprint

1. Go to your Render Dashboard.
2. Click **New +** > **Blueprint**.
3. Select your `ScamBrake` repository.
4. Render will parse `render.yaml` and configure the web service, background worker, and PostgreSQL database automatically.
5. In the Environment settings, populate your `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`.
6. Click **Apply**.

