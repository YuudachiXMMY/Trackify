import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { AIChatRequestSchema, AIScanRequestSchema, AIScanResponseSchema } from '@trackify/shared'
import type { ApiResult, AIChatResponse, AIScanResponse } from '@trackify/shared'
import { authGuard } from '../middleware/auth.js'

export const ai = new Hono<{ Variables: { userId: string; email: string } }>()

ai.use('*', authGuard)

const SYSTEM_PROMPT =
  'You are NourishAI, a supportive nutrition assistant. You provide evidence-based nutrition guidance while being sensitive to eating disorders and body image. Never prescribe specific calorie restrictions. Focus on balanced nutrition, food relationships, and well-being. If a user shows signs of disordered eating, gently encourage professional help.'

// POST /api/ai/chat
ai.post('/chat', zValidator('json', AIChatRequestSchema), async (c) => {
  const apiKey = process.env.MINIMAX_API_KEY
  if (!apiKey) {
    console.error('[ai/chat] MINIMAX_API_KEY is not configured')
    return c.json<ApiResult<never>>(
      { ok: false, error: { error: 'AI service is not available', code: 'CONFIGURATION_ERROR' } },
      500
    )
  }

  const modelName = process.env.MINIMAX_MODEL ?? 'MiniMax-Text-01'
  const body = c.req.valid('json')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch('https://api.minimax.io/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...body.messages,
        ],
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[ai/chat] MiniMax API error:', response.status, errorText)
      return c.json<ApiResult<never>>(
        { ok: false, error: { error: 'AI service returned an error', code: 'AI_API_ERROR' } },
        502
      )
    }

    const json = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>
    }

    const aiText = json.choices?.[0]?.message?.content
    if (typeof aiText !== 'string') {
      return c.json<ApiResult<never>>(
        { ok: false, error: { error: 'Unexpected response format from AI service', code: 'AI_PARSE_ERROR' } },
        502
      )
    }

    return c.json<ApiResult<AIChatResponse>>({ ok: true, data: { response: aiText } })
  } catch (err) {
    clearTimeout(timeout)
    if (err instanceof Error && err.name === 'AbortError') {
      return c.json<ApiResult<never>>(
        { ok: false, error: { error: 'AI service request timed out', code: 'TIMEOUT' } },
        504
      )
    }
    console.error('[ai/chat] Unexpected error:', err)
    return c.json<ApiResult<never>>(
      { ok: false, error: { error: 'Failed to contact AI service', code: 'AI_API_ERROR' } },
      502
    )
  }
})

// POST /api/ai/scan
ai.post('/scan', zValidator('json', AIScanRequestSchema), async (c) => {
  const apiKey = process.env.MINIMAX_API_KEY
  if (!apiKey) {
    console.error('[ai/scan] MINIMAX_API_KEY is not configured')
    return c.json<ApiResult<never>>(
      { ok: false, error: { error: 'AI service is not available', code: 'CONFIGURATION_ERROR' } },
      500
    )
  }

  const modelName = process.env.MINIMAX_MODEL ?? 'MiniMax-Text-01'
  const body = c.req.valid('json')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch('https://api.minimax.io/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Identify this food and estimate its nutritional content. Return JSON with: name (string), confidence (0-1), calories (int), protein (float), carbs (float), fat (float), fiber (float). Only return the JSON, no other text.',
              },
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${body.image}` },
              },
            ],
          },
        ],
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[ai/scan] MiniMax API error:', response.status, errorText)
      return c.json<ApiResult<never>>(
        { ok: false, error: { error: 'AI service returned an error', code: 'AI_API_ERROR' } },
        502
      )
    }

    const json = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>
    }

    const rawContent = json.choices?.[0]?.message?.content
    if (typeof rawContent !== 'string') {
      return c.json<ApiResult<never>>(
        { ok: false, error: { error: 'Unexpected response format from AI service', code: 'AI_PARSE_ERROR' } },
        502
      )
    }

    // Strip markdown code fences if present (e.g. ```json ... ```)
    const jsonStr = rawContent
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim()

    let parsed: unknown
    try {
      parsed = JSON.parse(jsonStr)
    } catch {
      console.error('[ai/scan] Failed to parse AI JSON response:', rawContent)
      return c.json<ApiResult<never>>(
        { ok: false, error: { error: 'AI service returned unparseable data', code: 'AI_PARSE_ERROR' } },
        502
      )
    }

    const validation = AIScanResponseSchema.safeParse(parsed)
    if (!validation.success) {
      console.error('[ai/scan] AI response failed schema validation:', validation.error)
      return c.json<ApiResult<never>>(
        { ok: false, error: { error: 'AI service returned invalid nutrition data', code: 'AI_PARSE_ERROR' } },
        502
      )
    }

    return c.json<ApiResult<AIScanResponse>>({ ok: true, data: validation.data })
  } catch (err) {
    clearTimeout(timeout)
    if (err instanceof Error && err.name === 'AbortError') {
      return c.json<ApiResult<never>>(
        { ok: false, error: { error: 'AI service request timed out', code: 'TIMEOUT' } },
        504
      )
    }
    console.error('[ai/scan] Unexpected error:', err)
    return c.json<ApiResult<never>>(
      { ok: false, error: { error: 'Failed to contact AI service', code: 'AI_API_ERROR' } },
      502
    )
  }
})
