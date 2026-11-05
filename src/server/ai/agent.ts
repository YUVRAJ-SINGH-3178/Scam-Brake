import type { InterventionMessage, InterventionSession } from '../../types/index.ts';
import { dbRepository } from '../db/repository.ts';
import { elasticScamEngine } from '../elastic/search.ts';
import { kernelVerificationClient } from '../kernel/client.ts';

export interface AIAgentResponse {
  message: string;
  quickReplies?: string[];
  flaggedKeywords?: string[];
  coercionIndicatorsDetected: string[];
  updatedConfidenceScore: number;
  recommendedNextStep: 'CONTINUE_INTERVIEW' | 'OFFER_KERNEL_VERIFY' | 'OFFER_TRUSTED_CONTACT' | 'RECOMMEND_VOID' | 'PERMIT_CAPTURE';
  provider: 'ASTROPODS' | 'OPENAI' | 'DETERMINISTIC_SAFE_AGENT';
}

export class ScamBrakeInterventionAgent {
  /**
   * Generates the next turn in the empathetic safety intervention
   */
  public static async processCustomerMessage(params: {
    paymentId: string;
    customerMessage: string;
  }): Promise<AIAgentResponse> {
    const { paymentId, customerMessage } = params;
    const payment = await dbRepository.getPaymentById(paymentId);
    if (!payment) throw new Error(`Payment ${paymentId} not found.`);

    const session = await dbRepository.getInterventionByPaymentId(paymentId);
    const textLower = customerMessage.toLowerCase();

    // 1. Identify Coercion & Impersonation Keywords
    const detectedIndicators: string[] = [];
    const flaggedKeywords: string[] = [];

    const IMPERSONATION_TRIGGERS = ['irs', 'tax', 'federal', 'police', 'sheriff', 'agent', 'officer', 'fbi', 'warrant', 'arrest', 'court', 'chase', 'bank', 'fraud department'];
    const SECRECY_TRIGGERS = ['secret', 'tell no one', 'stay on the line', 'do not hang up', 'keep quiet', 'private'];
    const URGENCY_TRIGGERS = ['immediately', 'right now', 'arrested', 'jail', 'penalty', 'today', 'urgent'];
    const TECH_SUPPORT_TRIGGERS = ['anydesk', 'teamviewer', 'virus', 'hacked', 'support', 'compromised'];

    for (const kw of IMPERSONATION_TRIGGERS) {
      if (textLower.includes(kw)) {
        flaggedKeywords.push(kw);
        detectedIndicators.push('AUTHORITY_IMPERSONATION');
      }
    }
    for (const kw of SECRECY_TRIGGERS) {
      if (textLower.includes(kw)) {
        flaggedKeywords.push(kw);
        detectedIndicators.push('SECRECY_COERCION');
      }
    }
    for (const kw of URGENCY_TRIGGERS) {
      if (textLower.includes(kw)) {
        flaggedKeywords.push(kw);
        detectedIndicators.push('URGENCY_THREAT');
      }
    }
    for (const kw of TECH_SUPPORT_TRIGGERS) {
      if (textLower.includes(kw)) {
        flaggedKeywords.push(kw);
        detectedIndicators.push('REMOTE_ACCESS_COERCION');
      }
    }

    // Deduplicate
    const uniqueIndicators = Array.from(new Set(detectedIndicators));

    // 2. Query Elastic Knowledge Base for pattern grounding
    const elasticMatches = await elasticScamEngine.searchPatterns(customerMessage);
    const topMatch = elasticMatches[0];

    // 3. Check Astropods API or OpenAI credentials if provided
    const astropodsKey = process.env.ASTROPODS_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;

    if (astropodsKey) {
      // Execute through Astropods agent endpoint
      try {
        const res = await fetch('https://api.astropods.io/v1/interventions/chat', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${astropodsKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentId,
            message: customerMessage,
            indicators: uniqueIndicators,
            elasticCluster: topMatch?.document?.clusterName,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          return {
            message: data.reply,
            quickReplies: data.quickReplies,
            flaggedKeywords,
            coercionIndicatorsDetected: uniqueIndicators,
            updatedConfidenceScore: data.confidenceScore || 0.95,
            recommendedNextStep: data.recommendedStep || 'OFFER_KERNEL_VERIFY',
            provider: 'ASTROPODS',
          };
        }
      } catch (e) {
        console.warn('[AI] Astropods call failed, falling back to local safe reasoning:', e);
      }
    }

    if (openAiKey) {
      // Execute through OpenAI endpoint
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${openAiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are Scam Brake's empathetic safety agent. The customer has a temporary hold of $${payment.amount} for "${payment.productName}". Do not shame them. Explain that legitimate agencies NEVER demand gift cards or secrecy. Ask exactly ONE calm question. Do not ask for passwords or credit cards. Suggest independent verification.`,
              },
              { role: 'user', content: customerMessage },
            ],
            temperature: 0.2,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const reply = data.choices[0]?.message?.content || '';
          return {
            message: reply,
            quickReplies: ['I was told not to tell anyone', 'They said I would be arrested', 'I want to cancel this payment'],
            flaggedKeywords,
            coercionIndicatorsDetected: uniqueIndicators,
            updatedConfidenceScore: 0.94,
            recommendedNextStep: 'OFFER_KERNEL_VERIFY',
            provider: 'OPENAI',
          };
        }
      } catch (e) {
        console.warn('[AI] OpenAI call failed, using deterministic safe reasoning:', e);
      }
    }

    // 4. Deterministic Empathetic Agent Engine (Guaranteed zero hallucination & strict safety)
    let reply = '';
    let quickReplies: string[] = [];
    let nextStep: AIAgentResponse['recommendedNextStep'] = 'CONTINUE_INTERVIEW';

    if (textLower.includes('irs') || textLower.includes('tax') || textLower.includes('sheriff') || textLower.includes('warrant')) {
      reply =
        'Thank you for telling me. It is very important to know: The IRS, police, and government departments will NEVER demand payment via gift cards or store vouchers. Scammers frequently spoof real phone numbers to make you feel in danger. Would you like to check the official IRS directory number independently right now?';
      quickReplies = ['Yes, verify official phone', 'They said I will be arrested', 'Cancel payment immediately'];
      nextStep = 'OFFER_KERNEL_VERIFY';
    } else if (textLower.includes('secret') || textLower.includes('tell no one') || textLower.includes('stay on')) {
      reply =
        'Demanding that you keep a transaction secret is a hallmark tactic used to isolate you from people who care about you. Would you like us to alert a trusted contact so you have someone in your corner before any funds are moved?';
      quickReplies = ['Notify trusted contact', 'No, keep private', 'I want to cancel payment'];
      nextStep = 'OFFER_TRUSTED_CONTACT';
    } else if (textLower.includes('cancel') || textLower.includes('stop') || textLower.includes('fake') || textLower.includes('scam')) {
      reply =
        'You are entirely in control. Because PayPal has placed a temporary authorization hold, no money has left your account yet. You can void this authorization right now with zero fees and complete safety.';
      quickReplies = ['Confirm pre-capture void', 'I want to verify first'];
      nextStep = 'RECOMMEND_VOID';
    } else if (textLower.includes('fine') || textLower.includes('legitimate') || textLower.includes('real') || textLower.includes('gift for')) {
      reply =
        'Thank you. We ask because scammers frequently coerce people into buying cards under pretexts. If you are entirely certain this is for your own personal use and no caller instructed you to buy this, you can proceed to capture.';
      quickReplies = ['I am confident, proceed', 'Let me double check'];
      nextStep = 'PERMIT_CAPTURE';
    } else {
      reply =
        'I appreciate you sharing that. To protect your funds, can you let me know: did anyone call or message you earlier today instructing you to make this purchase?';
      quickReplies = ['Yes, someone called me', 'No, this is my own purchase', 'Someone sent me a message'];
      nextStep = 'CONTINUE_INTERVIEW';
    }

    return {
      message: reply,
      quickReplies,
      flaggedKeywords,
      coercionIndicatorsDetected: uniqueIndicators,
      updatedConfidenceScore: uniqueIndicators.length > 0 ? 0.96 : 0.4,
      recommendedNextStep: nextStep,
      provider: 'DETERMINISTIC_SAFE_AGENT',
    };
  }
}
