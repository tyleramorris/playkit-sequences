import {z} from "zod"
import type {StartSequencePayload} from "./sequence-types"

const SEQUENCE_API_BASE = "https://playkit-sequences-production.up.railway.app"

const StartSequenceResponseSchema = z.object({
    success: z.boolean().optional(),
    message: z.string().optional(),
})

export default async function startSequence(payload: StartSequencePayload): Promise<string> {
    const url = `${SEQUENCE_API_BASE}/sequence/start`

    const requestBody = {
        recipients: [payload.recipientEmail],
        firstNames: [payload.recipientName.split(" ")[0] ?? ""],
        cc: payload.cc,
        subject: payload.subject,
        body: payload.body,
        companyName: payload.companyName,
        dealId: payload.companyRecordId,
        cadence: payload.cadence,
    }

    const serializedBody = JSON.stringify(requestBody, null, 2)
    console.log(`[Sequence API] Sending POST to ${url}`)
    console.log(`[Sequence API] Full payload:\n${serializedBody}`)

    let response: Response
    try {
        response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(requestBody),
        })
    } catch (networkError) {
        const message = networkError instanceof Error ? networkError.message : String(networkError)
        console.error(`[Sequence API] Network error — fetch failed: ${message}`)
        throw new Error(`Network error reaching sequence API: ${message}`)
    }

    console.log(`[Sequence API] Response status: ${response.status} ${response.statusText}`)

    if (!response.ok) {
        const rawBody = await response.text().catch(() => null)
        console.error(`[Sequence API] Non-OK response (${response.status} ${response.statusText})`)
        console.error(
            `[Sequence API] Response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`
        )
        console.error(`[Sequence API] Response body:\n${rawBody}`)

        let errorMessage = `HTTP ${response.status}`
        if (rawBody) {
            try {
                const errorJson: unknown = JSON.parse(rawBody)
                if (
                    typeof errorJson === "object" &&
                    errorJson !== null &&
                    "message" in errorJson &&
                    typeof (errorJson as Record<string, unknown>).message === "string"
                ) {
                    errorMessage = (errorJson as Record<string, unknown>).message as string
                }
            } catch {
                errorMessage = rawBody.slice(0, 500)
            }
        }
        throw new Error(`Failed to start sequence: ${errorMessage}`)
    }

    const data = await response.json().catch(() => null)
    if (!data) {
        console.error("[Sequence API] Response body was not valid JSON")
        throw new Error("Failed to parse sequence API response")
    }

    console.log(`[Sequence API] Response data: ${JSON.stringify(data)}`)

    const parsed = StartSequenceResponseSchema.parse(data)
    return parsed.message ?? "Sequence started successfully"
}
