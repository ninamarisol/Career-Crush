

## Plan: Contact Detail View with Interactions + Smarter Next Steps

### 1. Create Contact Detail Dialog (`src/components/contacts/ContactDetailDialog.tsx`)

A new dialog/sheet that opens when clicking a contact card. It will display:
- **Header**: Avatar, name, role, company, strength badge, contact links (email/phone/LinkedIn)
- **Interaction Timeline**: Fetches interactions via `useContactInteractions(contactId)` and renders them as a vertical timeline with type icons, dates, notes, and outcomes styled with the retro card aesthetic
- **Actions footer**: "Log Interaction" and "Schedule Follow-up" buttons
- Empty state when no interactions exist yet

### 2. Update ContactCard to open the detail dialog

- Make the contact card body clickable (not just the menu) to open the new `ContactDetailDialog`
- Pass through the necessary callbacks (onLogInteraction, onScheduleFollowUp)

### 3. Update Contacts page to wire up the detail dialog

- Add state for `selectedContact` to track which contact's detail view is open
- Render `ContactDetailDialog` with the selected contact
- Pass `useContactInteractions` data into the dialog

### 4. Enhance Smart Next Steps with interaction data (`src/hooks/useSmartSteps.tsx`)

Update `useSmartSteps` to also accept contacts and their interactions:
- **New step type: "reconnect"** — If a contact with strength "close" or "mentor" hasn't been contacted in 30+ days, suggest reconnecting
- **Interaction-aware follow-ups** — If a recent interaction has an `outcome` field mentioning next steps (e.g., "will send resume"), surface that as a smart step
- **Network activity consideration** — If contacts have recent interactions with companies the user has applied to, suggest leveraging those connections
- Update the `SmartStep` type to include the new `"reconnect"` step type
- Update `SmartStepDialog` to handle the new type with appropriate content

### 5. Wire contacts data into Home page

- Import `useContacts` and `useContactInteractions` in `Home.tsx` (contacts already imported, need to pass to `useSmartSteps`)
- Update `useSmartSteps` signature to accept contacts array
- Pass contacts into `CrushWidgets` → `NextActionsWidget` flow

### Files to create:
- `src/components/contacts/ContactDetailDialog.tsx`

### Files to modify:
- `src/components/contacts/ContactCard.tsx` — add onClick to open detail
- `src/pages/Contacts.tsx` — add selectedContact state, render detail dialog
- `src/hooks/useSmartSteps.tsx` — accept contacts param, add reconnect/interaction-based steps
- `src/pages/Home.tsx` — pass contacts to useSmartSteps
- `src/components/dialogs/SmartStepDialog.tsx` — handle "reconnect" type

