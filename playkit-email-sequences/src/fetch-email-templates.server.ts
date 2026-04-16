import {z} from "zod"
import type {EmailTemplate} from "./sequence-types"

const SEQUENCE_API_BASE = "https://playkit-sequences-production.up.railway.app"

const EmailTemplateSchema = z.object({
    id: z.string(),
    name: z.string(),
    subject: z.string(),
    body: z.string(),
})

const EmailTemplatesResponseSchema = z.array(EmailTemplateSchema)

export default async function fetchEmailTemplates(): Promise<EmailTemplate[]> {
    const url = `${SEQUENCE_API_BASE}/templates`
    console.log(`[Email Templates] GET ${url}`)

    let response: Response
    try {
        response = await fetch(url, {
            method: "GET",
            headers: {Accept: "application/json"},
        })
    } catch (networkError) {
        const message = networkError instanceof Error ? networkError.message : String(networkError)
        console.error(`[Email Templates] Network error: ${message}`)
        throw new Error(`Failed to reach template server: ${message}`)
    }

    console.log(`[Email Templates] Response status: ${response.status} ${response.statusText}`)

    if (!response.ok) {
        const rawBody = await response.text().catch(() => null)
        console.error(`[Email Templates] Error response body:\n${rawBody}`)
        throw new Error(`Failed to fetch templates: HTTP ${response.status}`)
    }

    const rawBody = await response.text().catch(() => null)
    console.log(`[Email Templates] Raw response body:\n${rawBody}`)

    if (!rawBody) {
        throw new Error("Empty response from template server")
    }

    let json: unknown
    try {
        json = JSON.parse(rawBody)
    } catch {
        console.error("[Email Templates] Response is not valid JSON")
        throw new Error("Failed to parse templates response")
    }

    const templates = EmailTemplatesResponseSchema.parse(json)
    console.log(`[Email Templates] Loaded ${templates.length} template(s)`)
    return templates
}
