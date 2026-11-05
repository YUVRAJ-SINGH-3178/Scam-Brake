-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'OPERATOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Merchant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "webhookSecret" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Merchant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantUser" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'OPERATOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MerchantUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "accountAgeMonths" INTEGER NOT NULL DEFAULT 12,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerSession" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "sessionToken" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "clientTelemetry" JSONB,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckoutSession" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "customerSessionId" TEXT,
    "clientReference" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "productName" TEXT NOT NULL,
    "productCategory" TEXT NOT NULL,
    "isGiftCard" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'INITIALIZED',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckoutSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "paymentReference" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "checkoutSessionId" TEXT,
    "customerId" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "productName" TEXT NOT NULL,
    "productCategory" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'CREATED',
    "authorizationStatus" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    "interventionStatus" TEXT NOT NULL DEFAULT 'NOT_REQUIRED',
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "riskLevel" TEXT NOT NULL DEFAULT 'LOW',
    "authorizedAt" TIMESTAMP(3),
    "holdExpiresAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "resolutionNotes" TEXT,
    "concurrencyLock" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayPalOrder" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "paypalOrderId" TEXT NOT NULL,
    "intent" TEXT NOT NULL DEFAULT 'AUTHORIZE',
    "status" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "rawResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayPalOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentAuthorization" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "paypalAuthorizationId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "expirationTime" TIMESTAMP(3),
    "sellerProtection" JSONB,
    "rawResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentAuthorization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentCapture" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "paypalCaptureId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "finalCapture" BOOLEAN NOT NULL DEFAULT true,
    "rawResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentCapture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentOperation" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "operationType" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "requestPayload" JSONB,
    "responsePayload" JSONB,
    "errorMessage" TEXT,
    "executedBy" TEXT NOT NULL DEFAULT 'SYSTEM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentOperation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskAssessment" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "policyOutcome" TEXT NOT NULL,
    "aiHypothesis" TEXT,
    "aiConfidence" DOUBLE PRECISION,
    "telemetrySnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiskAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskSignal" (
    "id" TEXT NOT NULL,
    "riskAssessmentId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "metadata" JSONB,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiskSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantRiskPolicy" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "autoHoldThreshold" INTEGER NOT NULL DEFAULT 60,
    "autoCaptureThreshold" INTEGER NOT NULL DEFAULT 25,
    "interventionTimeoutMinutes" INTEGER NOT NULL DEFAULT 10,
    "timeoutAction" TEXT NOT NULL DEFAULT 'VOID',
    "requireTrustedContactOver" DECIMAL(10,2),
    "prohibitRemoteDesktopGiftCard" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchantRiskPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterventionSession" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'INITIALIZING',
    "scamHypothesis" TEXT,
    "coercionIndicators" JSONB,
    "confidenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "customerDecision" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "InterventionSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationMessage" (
    "id" TEXT NOT NULL,
    "interventionSessionId" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "quickReplies" JSONB,
    "flaggedKeywords" JSONB,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndependentVerification" (
    "id" TEXT NOT NULL,
    "interventionSessionId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'KERNEL_VERIFY',
    "targetOrganization" TEXT NOT NULL,
    "officialPhone" TEXT NOT NULL,
    "officialDomain" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "verificationRef" TEXT,
    "notes" TEXT,
    "retrievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IndependentVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrustedContact" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrustedContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrustedContactConsent" (
    "id" TEXT NOT NULL,
    "interventionSessionId" TEXT NOT NULL,
    "trustedContactId" TEXT NOT NULL,
    "consentGranted" BOOLEAN NOT NULL DEFAULT false,
    "grantedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "ipAddress" TEXT,

    CONSTRAINT "TrustedContactConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrustedContactNotification" (
    "id" TEXT NOT NULL,
    "trustedContactConsentId" TEXT NOT NULL,
    "trustedContactId" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'SMS',
    "status" TEXT NOT NULL DEFAULT 'DISPATCHED',
    "dispatchReference" TEXT,
    "payloadSummary" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "responseOutcome" TEXT,

    CONSTRAINT "TrustedContactNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'PAYPAL',
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "resourceId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "signatureValid" BOOLEAN NOT NULL DEFAULT false,
    "payload" JSONB NOT NULL,
    "processedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT,
    "eventType" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "details" JSONB,
    "immutableHash" TEXT NOT NULL,
    "prevHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScamKnowledgeReference" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'ELASTIC_INDEX',
    "clusterName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "keywords" JSONB NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScamKnowledgeReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimulationScenario" (
    "id" TEXT NOT NULL,
    "scenarioKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "coercionVector" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "merchantName" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "expectedOutcome" TEXT NOT NULL,
    "sampleConversation" JSONB NOT NULL,
    "investigationFindings" JSONB NOT NULL,

    CONSTRAINT "SimulationScenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimulationRun" (
    "id" TEXT NOT NULL,
    "simulationScenarioId" TEXT NOT NULL,
    "paymentId" TEXT,
    "status" TEXT NOT NULL,
    "actualOutcome" TEXT,
    "logs" JSONB,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SimulationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SponsorIntegration" (
    "id" TEXT NOT NULL,
    "sponsorKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'MOCK_ACTIVE',
    "purpose" TEXT NOT NULL,
    "interfaceMethod" TEXT NOT NULL,
    "docsUrl" TEXT NOT NULL,
    "latencyMs" INTEGER NOT NULL DEFAULT 30,
    "lastHealthCheck" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "healthStatus" TEXT NOT NULL DEFAULT 'HEALTHY',

    CONSTRAINT "SponsorIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BackgroundJob" (
    "id" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "nextRunAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" TIMESTAMP(3),
    "lockedBy" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BackgroundJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationEndpoint" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secretKey" TEXT NOT NULL,
    "events" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AutomationEndpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationDelivery" (
    "id" TEXT NOT NULL,
    "automationEndpointId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "statusCode" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "error" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AutomationDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Investigator" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'FRAUD_ANALYST',
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Investigator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestigationCase" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "caseReference" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "priority" TEXT NOT NULL DEFAULT 'HIGH',
    "hypothesis" TEXT NOT NULL,
    "assignedToId" TEXT,
    "deadlineAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "InvestigationCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledAssignment" (
    "id" TEXT NOT NULL,
    "investigationCaseId" TEXT NOT NULL,
    "investigatorId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,

    CONSTRAINT "ScheduledAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_slug_key" ON "Merchant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_apiKey_key" ON "Merchant"("apiKey");

-- CreateIndex
CREATE UNIQUE INDEX "MerchantUser_merchantId_userId_key" ON "MerchantUser"("merchantId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerSession_sessionToken_key" ON "CustomerSession"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "CheckoutSession_clientReference_key" ON "CheckoutSession"("clientReference");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paymentReference_key" ON "Payment"("paymentReference");

-- CreateIndex
CREATE INDEX "Payment_merchantId_idx" ON "Payment"("merchantId");

-- CreateIndex
CREATE INDEX "Payment_state_idx" ON "Payment"("state");

-- CreateIndex
CREATE INDEX "Payment_authorizationStatus_idx" ON "Payment"("authorizationStatus");

-- CreateIndex
CREATE INDEX "Payment_paymentReference_idx" ON "Payment"("paymentReference");

-- CreateIndex
CREATE UNIQUE INDEX "PayPalOrder_paymentId_key" ON "PayPalOrder"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "PayPalOrder_paypalOrderId_key" ON "PayPalOrder"("paypalOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAuthorization_paymentId_key" ON "PaymentAuthorization"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAuthorization_paypalAuthorizationId_key" ON "PaymentAuthorization"("paypalAuthorizationId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentCapture_paymentId_key" ON "PaymentCapture"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentCapture_paypalCaptureId_key" ON "PaymentCapture"("paypalCaptureId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentOperation_idempotencyKey_key" ON "PaymentOperation"("idempotencyKey");

-- CreateIndex
CREATE INDEX "PaymentOperation_paymentId_idx" ON "PaymentOperation"("paymentId");

-- CreateIndex
CREATE INDEX "PaymentOperation_idempotencyKey_idx" ON "PaymentOperation"("idempotencyKey");

-- CreateIndex
CREATE INDEX "RiskAssessment_paymentId_idx" ON "RiskAssessment"("paymentId");

-- CreateIndex
CREATE INDEX "RiskSignal_riskAssessmentId_idx" ON "RiskSignal"("riskAssessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "MerchantRiskPolicy_merchantId_key" ON "MerchantRiskPolicy"("merchantId");

-- CreateIndex
CREATE UNIQUE INDEX "InterventionSession_paymentId_key" ON "InterventionSession"("paymentId");

-- CreateIndex
CREATE INDEX "ConversationMessage_interventionSessionId_idx" ON "ConversationMessage"("interventionSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "IndependentVerification_interventionSessionId_key" ON "IndependentVerification"("interventionSessionId");

-- CreateIndex
CREATE INDEX "TrustedContact_customerId_idx" ON "TrustedContact"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "TrustedContactConsent_interventionSessionId_key" ON "TrustedContactConsent"("interventionSessionId");

-- CreateIndex
CREATE INDEX "TrustedContactNotification_trustedContactId_idx" ON "TrustedContactNotification"("trustedContactId");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookEvent_eventId_key" ON "WebhookEvent"("eventId");

-- CreateIndex
CREATE INDEX "WebhookEvent_eventId_idx" ON "WebhookEvent"("eventId");

-- CreateIndex
CREATE INDEX "WebhookEvent_resourceId_idx" ON "WebhookEvent"("resourceId");

-- CreateIndex
CREATE INDEX "WebhookEvent_status_idx" ON "WebhookEvent"("status");

-- CreateIndex
CREATE INDEX "AuditLog_paymentId_idx" ON "AuditLog"("paymentId");

-- CreateIndex
CREATE INDEX "AuditLog_immutableHash_idx" ON "AuditLog"("immutableHash");

-- CreateIndex
CREATE UNIQUE INDEX "SimulationScenario_scenarioKey_key" ON "SimulationScenario"("scenarioKey");

-- CreateIndex
CREATE UNIQUE INDEX "SponsorIntegration_sponsorKey_key" ON "SponsorIntegration"("sponsorKey");

-- CreateIndex
CREATE INDEX "BackgroundJob_status_nextRunAt_idx" ON "BackgroundJob"("status", "nextRunAt");

-- CreateIndex
CREATE INDEX "AutomationDelivery_automationEndpointId_idx" ON "AutomationDelivery"("automationEndpointId");

-- CreateIndex
CREATE UNIQUE INDEX "InvestigationCase_paymentId_key" ON "InvestigationCase"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "InvestigationCase_caseReference_key" ON "InvestigationCase"("caseReference");

-- CreateIndex
CREATE INDEX "ScheduledAssignment_investigatorId_idx" ON "ScheduledAssignment"("investigatorId");

-- CreateIndex
CREATE INDEX "ScheduledAssignment_investigationCaseId_idx" ON "ScheduledAssignment"("investigationCaseId");

-- AddForeignKey
ALTER TABLE "MerchantUser" ADD CONSTRAINT "MerchantUser_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantUser" ADD CONSTRAINT "MerchantUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerSession" ADD CONSTRAINT "CustomerSession_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckoutSession" ADD CONSTRAINT "CheckoutSession_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckoutSession" ADD CONSTRAINT "CheckoutSession_customerSessionId_fkey" FOREIGN KEY ("customerSessionId") REFERENCES "CustomerSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_checkoutSessionId_fkey" FOREIGN KEY ("checkoutSessionId") REFERENCES "CheckoutSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayPalOrder" ADD CONSTRAINT "PayPalOrder_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAuthorization" ADD CONSTRAINT "PaymentAuthorization_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentCapture" ADD CONSTRAINT "PaymentCapture_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentOperation" ADD CONSTRAINT "PaymentOperation_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskAssessment" ADD CONSTRAINT "RiskAssessment_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskSignal" ADD CONSTRAINT "RiskSignal_riskAssessmentId_fkey" FOREIGN KEY ("riskAssessmentId") REFERENCES "RiskAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantRiskPolicy" ADD CONSTRAINT "MerchantRiskPolicy_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterventionSession" ADD CONSTRAINT "InterventionSession_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationMessage" ADD CONSTRAINT "ConversationMessage_interventionSessionId_fkey" FOREIGN KEY ("interventionSessionId") REFERENCES "InterventionSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndependentVerification" ADD CONSTRAINT "IndependentVerification_interventionSessionId_fkey" FOREIGN KEY ("interventionSessionId") REFERENCES "InterventionSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustedContact" ADD CONSTRAINT "TrustedContact_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustedContactConsent" ADD CONSTRAINT "TrustedContactConsent_interventionSessionId_fkey" FOREIGN KEY ("interventionSessionId") REFERENCES "InterventionSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustedContactConsent" ADD CONSTRAINT "TrustedContactConsent_trustedContactId_fkey" FOREIGN KEY ("trustedContactId") REFERENCES "TrustedContact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustedContactNotification" ADD CONSTRAINT "TrustedContactNotification_trustedContactConsentId_fkey" FOREIGN KEY ("trustedContactConsentId") REFERENCES "TrustedContactConsent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustedContactNotification" ADD CONSTRAINT "TrustedContactNotification_trustedContactId_fkey" FOREIGN KEY ("trustedContactId") REFERENCES "TrustedContact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationRun" ADD CONSTRAINT "SimulationRun_simulationScenarioId_fkey" FOREIGN KEY ("simulationScenarioId") REFERENCES "SimulationScenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationEndpoint" ADD CONSTRAINT "AutomationEndpoint_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationDelivery" ADD CONSTRAINT "AutomationDelivery_automationEndpointId_fkey" FOREIGN KEY ("automationEndpointId") REFERENCES "AutomationEndpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investigator" ADD CONSTRAINT "Investigator_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestigationCase" ADD CONSTRAINT "InvestigationCase_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestigationCase" ADD CONSTRAINT "InvestigationCase_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledAssignment" ADD CONSTRAINT "ScheduledAssignment_investigationCaseId_fkey" FOREIGN KEY ("investigationCaseId") REFERENCES "InvestigationCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledAssignment" ADD CONSTRAINT "ScheduledAssignment_investigatorId_fkey" FOREIGN KEY ("investigatorId") REFERENCES "Investigator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

