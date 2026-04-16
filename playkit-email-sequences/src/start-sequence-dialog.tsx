import {Banner, Forms, LoadingState, useAsyncCache, useForm} from "attio/client"
import React, {Suspense, useCallback, useEffect, useRef, useState} from "react"
import fetchCompanyData from "./fetch-company-data.server"
import fetchEmailTemplates from "./fetch-email-templates.server"
import type {
    Cadence,
    CompanyData,
    EmailTemplate,
    LinkedPerson,
    StartSequencePayload,
} from "./sequence-types"
import startSequence from "./start-sequence.server"

function resolveTemplate({
    template,
    firstName,
    companyName,
}: {
    template: EmailTemplate
    firstName: string
    companyName: string
}): {subject: string; body: string} {
    const subject = template.subject
        .replace("{{companyName}}", companyName)
        .replace("{{firstName}}", firstName)
    const body = template.body
        .replace("{{companyName}}", companyName)
        .replace("{{firstName}}", firstName)
    return {subject, body}
}

function TemplateSyncer({
    templateId,
    onSync,
}: {
    templateId: string
    onSync: (id: string) => void
}): React.ReactElement {
    useEffect(() => {
        onSync(templateId)
    }, [templateId, onSync])
    return React.createElement(React.Fragment)
}

function SequenceForm({
    companyData,
    templates,
    companyRecordId,
    hideDialog,
}: {
    companyData: CompanyData
    templates: EmailTemplate[]
    companyRecordId: string
    hideDialog: () => void
}) {
    const [submitError, setSubmitError] = useState<string | null>(null)
    const lastTemplateRef = useRef<string>(templates[0].id)
    const defaultTemplate = templates[0]

    const recipientOptions = companyData.people.map((person: LinkedPerson) => ({
        label: `${person.name} (${person.email})`,
        value: person.email,
    }))

    const templateOptions = templates.map((t) => ({
        label: t.name,
        value: t.id,
    }))

    const cadenceOptions = [
        {label: "Standard (1, 2, 2 business days)", value: "standard"},
        {label: "Delayed (1, 4, 4 business days)", value: "delayed"},
    ]

    const defaultRecipient = companyData.people[0]
    const defaultFirstName = defaultRecipient?.name.split(" ")[0] ?? ""

    const {subject: defaultSubject, body: defaultBody} = resolveTemplate({
        template: defaultTemplate,
        firstName: defaultFirstName,
        companyName: companyData.name,
    })

    lastTemplateRef.current = defaultTemplate.id

    const {Form, Combobox, TextInput, TextArea, SubmitButton, WithState, change} = useForm(
        {
            template: Forms.string(),
            cadence: Forms.string(),
            recipient: Forms.string(),
            cc: Forms.string().optional(),
            subject: Forms.string(),
            body: Forms.string().multiline(),
        },
        {
            template: defaultTemplate.id,
            cadence: "standard" as string,
            recipient: defaultRecipient?.email ?? "",
            cc: "",
            subject: defaultSubject,
            body: defaultBody,
        }
    )

    const syncTemplate = useCallback(
        (currentTemplateId: string) => {
            if (currentTemplateId === lastTemplateRef.current) {
                return
            }
            lastTemplateRef.current = currentTemplateId
            const t = templates.find((tmpl) => tmpl.id === currentTemplateId)
            if (!t) {
                return
            }
            const {subject, body} = resolveTemplate({
                template: t,
                firstName: defaultFirstName,
                companyName: companyData.name,
            })
            change("subject", subject)
            change("body", body)
        },
        [templates, change, companyData.name, defaultFirstName]
    )

    const handleSubmit = async (values: {
        template: string
        cadence: string
        recipient: string
        cc?: string
        subject: string
        body: string
    }) => {
        setSubmitError(null)
        const selectedPerson = companyData.people.find((p) => p.email === values.recipient)
        const ccList = values.cc
            ? values.cc
                  .split(",")
                  .map((e: string) => e.trim())
                  .filter((e: string) => e.length > 0)
            : []

        const payload: StartSequencePayload = {
            recipientEmail: values.recipient,
            recipientName: selectedPerson?.name ?? "",
            cc: ccList,
            subject: values.subject,
            body: values.body,
            companyName: companyData.name,
            companyRecordId,
            cadence: values.cadence as Cadence,
        }

        try {
            const result = await startSequence(payload)
            console.log(`[StartSequenceDialog] Success: ${result}`)
            hideDialog()
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error"
            console.error(`[StartSequenceDialog] Submit failed: ${message}`)
            setSubmitError(message)
        }
    }

    if (companyData.people.length === 0) {
        return (
            <Banner variant="warning">
                No people with email addresses are linked to this company. Add team members in Attio
                first.
            </Banner>
        )
    }

    return (
        <Form onSubmit={handleSubmit}>
            {submitError ? <Banner variant="error">Failed to send: {submitError}</Banner> : null}
            <WithState values>
                {({values}) => (
                    <TemplateSyncer templateId={values.template} onSync={syncTemplate} />
                )}
            </WithState>
            <Combobox
                name="template"
                label="Template"
                options={templateOptions}
                searchPlaceholder="Search templates..."
            />
            <Combobox
                name="cadence"
                label="Cadence"
                options={cadenceOptions}
                searchPlaceholder="Select cadence..."
            />
            <Combobox
                name="recipient"
                label="Recipient"
                options={recipientOptions}
                searchPlaceholder="Search people..."
            />
            <TextInput name="cc" label="CC" placeholder="Comma-separated email addresses" />
            <TextInput name="subject" label="Subject" placeholder="Email subject line" />
            <TextArea name="body" label="Body" resizable />
            <SubmitButton label="Send" />
        </Form>
    )
}

function SequenceFormLoader({
    companyRecordId,
    hideDialog,
}: {
    companyRecordId: string
    hideDialog: () => void
}) {
    const {
        values: {companyData, templates},
    } = useAsyncCache({
        companyData: [fetchCompanyData, companyRecordId],
        templates: fetchEmailTemplates,
    })

    if (templates.length === 0) {
        return (
            <Banner variant="error">
                No email templates found. Please add templates in the app settings.
            </Banner>
        )
    }

    return (
        <SequenceForm
            companyData={companyData}
            templates={templates}
            companyRecordId={companyRecordId}
            hideDialog={hideDialog}
        />
    )
}

function ErrorFallback({error}: {error: string}) {
    return (
        <Banner variant="error">
            Failed to load company data: {error}. Please close and try again.
        </Banner>
    )
}

export default function StartSequenceDialog({
    recordId,
    hideDialog,
}: {
    recordId: string
    hideDialog: () => void
}) {
    const [error, setError] = useState<string | null>(null)

    if (error) {
        return <ErrorFallback error={error} />
    }

    return (
        <Suspense fallback={<LoadingState />}>
            <ErrorCatcher onError={setError}>
                <SequenceFormLoader companyRecordId={recordId} hideDialog={hideDialog} />
            </ErrorCatcher>
        </Suspense>
    )
}

class ErrorCatcher extends React.Component<
    {children: React.ReactNode; onError: (error: string) => void},
    {hasError: boolean}
> {
    constructor(props: {children: React.ReactNode; onError: (error: string) => void}) {
        super(props)
        this.state = {hasError: false}
    }

    static getDerivedStateFromError(): {hasError: boolean} {
        return {hasError: true}
    }

    componentDidCatch(error: unknown): void {
        const message = error instanceof Error ? error.message : "Unknown error"
        console.error("[StartSequenceDialog]", message)
        this.props.onError(message)
    }

    render(): React.ReactNode {
        if (this.state.hasError) {
            return null
        }
        return this.props.children
    }
}
