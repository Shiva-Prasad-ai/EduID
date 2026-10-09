import express from 'express';

const router = express.Router();

function cleanAIResponse(rawText) {
  if (!rawText) return '';
  let cleaned = rawText;

  // Remove <think>...</think> XML tags
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '');

  // Strip "Here's a thinking process:" and reasoning preambles
  if (/Here'?s a thinking process:/i.test(cleaned)) {
    const parts = cleaned.split(/Here'?s a thinking process:/i);
    const thinkingBlock = parts[parts.length - 1];
    const lines = thinkingBlock.split('\n');
    let answerStart = -1;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      if (!/^\d+\.\s+/.test(line) && !/^[-*]\s*(?:Analyze|Check|Determine|Formulate|Identify|Verify)/i.test(line)) {
        answerStart = i;
        break;
      }
    }
    if (answerStart !== -1) {
      cleaned = lines.slice(answerStart).join('\n');
    }
  }

  // Strip emojis as per platform guidelines
  cleaned = cleaned.replace(
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
    ''
  );

  return cleaned.trim();
}

/**
 * POST /api/ai/chat
 * Secure AI chat endpoint that keeps all OpenRouter API keys hidden on the server.
 */
router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Valid messages array is required.' });
    }

    const gemmaKey = process.env.GEMMA_API_KEY;
    const nemotronKey = process.env.NEMOTRON_API_KEY;

    if (!gemmaKey && !nemotronKey) {
      return res.status(500).json({
        error: 'AI service keys are not configured on the server.'
      });
    }

    const attempts = [
      { key: gemmaKey, model: 'google/gemma-3-27b-it' },
      { key: gemmaKey, model: 'google/gemma-3-12b-it' },
      { key: nemotronKey, model: 'openrouter/auto' },
      { key: nemotronKey, model: 'nvidia/nemotron-3.5-lightning:free' }
    ].filter(a => Boolean(a.key));

    let replyContent = null;

    for (const attempt of attempts) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${attempt.key}`,
            'HTTP-Referer': 'https://eduid.portal',
            'X-Title': 'EduID Jade AI Advisor',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: attempt.model,
            messages,
            max_tokens: 400,
            temperature: 0.5
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) {
            replyContent = cleanAIResponse(text);
            break;
          }
        }
      } catch (err) {
        console.warn(`[AI Route] Attempt with model ${attempt.model} failed:`, err.message);
      }
    }

    if (!replyContent) {
      return res.status(502).json({
        error: 'Could not obtain AI response from model providers at this time.'
      });
    }

    return res.status(200).json({
      success: true,
      content: replyContent
    });
  } catch (err) {
    console.error('[AI Route] Server Error:', err);
    res.status(500).json({ error: 'Server error processing AI request.' });
  }
});

export default router;
