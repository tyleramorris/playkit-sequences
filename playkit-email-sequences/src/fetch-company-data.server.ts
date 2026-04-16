import {ATTIO_API_TOKEN} from "attio/server"
import {z} from "zod"
import type {CompanyData, LinkedPerson} from "./sequence-types"

const ATTIO_API_BASE = "https://api.attio.com/v2"

const attioHeaders = () => ({
    Authorization: `Bearer ${ATTIO_API_TOKEN}`,
    "Content-Type": "application/json",
    Accept: "application/json",
})

const NameValueSchema = z.object({
    first_name: z.string().nullable().optional(),
    last_name: z.string().nullable().optional(),
    full_name: z.string().nullable().optional(),
})

const EmailValueSchema = z.object({
    email_address: z.string(),
})

const RecordValueSchema = z.object({
    target_record_id: z.string(),
    target_object: z.string(),
})

const PersonRecordSchema = z.object({
    id: z.object({
        record_id: z.string(),
    }),
    values: z.object({
        name: z.array(NameValueSchema).optional(),
        email_addresses: z.array(EmailValueSchema).optional(),
    }),
})

const PeopleQueryResponseSchema = z.object({
    data: z.array(PersonRecordSchema),
})

const CompanyNameValueSchema = z.object({
    value: z.string().nullable().optional(),
})

const DomainValueSchema = z.object({
    domain: z.string(),
})

const CompanyRecordSchema = z.object({
    id: z.object({
        record_id: z.string(),
    }),
    values: z.object({
        name: z.array(CompanyNameValueSchema).optional(),
        domains: z.array(DomainValueSchema).optional(),
        team: z.array(RecordValueSchema).optional(),
    }),
})

const CompanyRecordResponseSchema = z.object({
    data: CompanyRecordSchema,
})

export default async function fetchCompanyData(companyRecordId: string): Promise<CompanyData> {
    const tokenAvailable = typeof ATTIO_API_TOKEN === "string" && ATTIO_API_TOKEN.length > 0
    console.log(
        `[Attio API] Fetching company ${companyRecordId}, token available: ${tokenAvailable}, token length: ${ATTIO_API_TOKEN?.length ?? 0}`
    )

    if (!tokenAvailable) {
        console.error("[Attio API] ATTIO_API_TOKEN is missing or empty")
        throw new Error(
            "Attio API token is not available. Ensure the app has the required permissions."
        )
    }

    const companyUrl = `${ATTIO_API_BASE}/objects/companies/records/${companyRecordId}`
    console.log(`[Attio API] GET ${companyUrl}`)

    const companyResponse = await fetch(companyUrl, {method: "GET", headers: attioHeaders()})

    if (!companyResponse.ok) {
        const errorBody = await companyResponse.json().catch(() => null)
        console.error(
            `[Attio API] Failed to fetch company: ${companyResponse.status} ${companyResponse.statusText}`,
            JSON.stringify(errorBody)
        )
        throw new Error(
            `Failed to fetch company details: ${companyResponse.status} ${errorBody?.message ?? companyResponse.statusText}`
        )
    }

    const companyJson = await companyResponse.json().catch(() => null)
    if (!companyJson) {
        throw new Error("Failed to parse company response")
    }

    const companyData = CompanyRecordResponseSchema.parse(companyJson)
    const rawName = companyData.data.values.name?.[0]?.value ?? "Unknown Company"
    const domains = companyData.data.values.domains?.map((d) => d.domain) ?? []
    const companyName =
        domains.length > 0 && domains.some((d) => rawName === d)
            ? rawName.split(".")[0].charAt(0).toUpperCase() + rawName.split(".")[0].slice(1)
            : rawName
    const teamMemberIds =
        companyData.data.values.team
            ?.filter((ref) => ref.target_object === "people")
            .map((ref) => ref.target_record_id) ?? []

    if (teamMemberIds.length === 0) {
        return {name: companyName, people: []}
    }

    const peopleResponse = await fetch(`${ATTIO_API_BASE}/objects/people/records/query`, {
        method: "POST",
        headers: attioHeaders(),
        body: JSON.stringify({
            filter: {
                record_id: {
                    $in: teamMemberIds,
                },
            },
        }),
    })

    if (!peopleResponse.ok) {
        const errorBody = await peopleResponse.json().catch(() => null)
        console.error(
            `[Attio API] Failed to fetch people: ${peopleResponse.status} ${peopleResponse.statusText}`,
            JSON.stringify(errorBody)
        )
        throw new Error(
            `Failed to fetch linked people: ${peopleResponse.status} ${errorBody?.message ?? peopleResponse.statusText}`
        )
    }

    const peopleJson = await peopleResponse.json().catch(() => null)
    if (!peopleJson) {
        throw new Error("Failed to parse people response")
    }

    const peopleData = PeopleQueryResponseSchema.parse(peopleJson)

    const people: LinkedPerson[] = peopleData.data
        .map((person) => {
            const name = person.values.name?.[0]?.full_name ?? "Unknown"
            const email = person.values.email_addresses?.[0]?.email_address ?? ""
            return {
                recordId: person.id.record_id,
                name,
                email,
            }
        })
        .filter((p) => p.email.length > 0)

    return {name: companyName, people}
}
