export interface LinkedPerson {
    recordId: string
    name: string
    email: string
}

export interface CompanyData {
    name: string
    people: LinkedPerson[]
}

export type Cadence = "standard" | "delayed"

export interface EmailTemplate {
    id: string
    name: string
    subject: string
    body: string
}

export interface StartSequencePayload {
    recipientEmail: string
    recipientName: string
    cc: string[]
    subject: string
    body: string
    companyName: string
    companyRecordId: string
    cadence: Cadence
    startDate: string
}
