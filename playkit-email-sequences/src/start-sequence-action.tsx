import type {App} from "attio"
import {showDialog} from "attio/client"
import StartSequenceDialog from "./start-sequence-dialog"

export const startEmailSequence: App.Record.Action = {
    id: "start-email-sequence",
    label: "Start email sequence",
    icon: "Email",
    onTrigger: async ({recordId}) => {
        await showDialog({
            title: "Start Email Sequence",
            Dialog: ({hideDialog}) => {
                return <StartSequenceDialog recordId={recordId} hideDialog={hideDialog} />
            },
        })
    },
    objects: ["companies"],
}
