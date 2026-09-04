# AI Workplace Hub

Build a modern, production-ready SaaS dashboard application called "AI Workplace Productivity Assistant". The application must function as a unified, single-page web app with sidebar navigation to toggle between 5 core AI productivity modules.

### IMPORTANT FUNCTIONALITY REQUIREMENT

- Implement realistic functional mock response generators for all 5 tools so the application works seamlessly out-of-the-box without requiring an external API key during evaluations.

- Include a Settings modal in the top header where users can optionally input an OpenAI API key for live calls. If no key is provided, gracefully use the realistic mock output logic.

### UI/UX DESIGN SYSTEM & LAYOUT

- **Overall Layout:** Modern SaaS dashboard with a left-hand collapsible sidebar, top navigation header (showing project title, quick stats, and user avatar), and a primary content area.

- **Color Palette:** Clean slate/indigo tech aesthetic (Slate-900 for dark accents, Indigo-600 primary action buttons, Slate-50 surface background, border-slate-200 cards).

- **Responsive Design:** Mobile-first approach. Sidebar collapses into a hamburger menu on small screens; cards stack vertically on mobile and display side-by-side on desktop.

- **Component Standard:** Use two-panel layouts for the main tools (Left panel = Inputs & Configuration Controls; Right panel = Editable AI Output Card with Action Buttons: "Copy to Clipboard", "Export to TXT", and "Edit Output").

---

### CORE MODULES & FEATURES

1. **Dashboard Home (Overview)**

   - Display a welcome card, quick metrics (Tasks Planned, Emails Drafted, Time Saved), and quick-launch action cards to jump directly into any tool.

   - Include a prominent, styled "Responsible AI Banner" at the top or bottom of every view.

2. **Smart Email Generator**

   - **Inputs:** Topic/Context text area, Recipient Name/Role, Tone Selector (Formal, Friendly, Persuasive, Conciliatory), and Length Slider (Short, Balanced, Detailed).

   - **AI Prompt Logic:** Enforces subject line generation, appropriate salutation, structured body text, clear call-to-action (CTA), and sign-off based on the chosen tone.

   - **Output:** Formatted email template inside an editable text area with copy/export tools. Include a "Load Sample Data" button.

3. **Meeting Notes Summarizer**

   - **Inputs:** Raw meeting transcript / unstructured notes text area, Meeting Title, Date.

   - **AI Prompt Logic:** Extracts raw text and formats output strictly into 3 distinct structured cards:

     - `Executive Summary` (2-3 bullet points)

     - `Key Decisions Made`

     - `Action Items Table` (Columns: Task, Owner, Deadline, Priority)

   - Include a "Load Sample Notes" button.

4. **AI Task Planner & Scheduler**

   - **Inputs:** Unstructured list of tasks/goals, Available Hours per Day, Working Days (Daily vs. Weekly View toggle).

   - **AI Prompt Logic:** Applies Eisenhower Matrix logic (Urgent vs. Important) to prioritize tasks, allocate estimated durations, and output a time-blocked schedule (e.g., 09:00 AM - 10:30 AM).

   - Include a "Load Sample Tasks" button.

5. **AI Research Assistant**

   - **Inputs:** Topic or Raw Article/Notes input text area, Focus Area dropdown (Market Analysis, Technical Summary, Executive Brief).

   - **AI Prompt Logic:** Generates a structured brief with Key Highlights, Industry Insights, Strategic Recommendations, and Potential Risks/Caveats.

6. **Interactive AI Chatbot Interface**

   - **Layout:** Chat interface with message history, clear chat button, quick suggested prompts ("Draft a project delay apology", "Summarize key risks of cloud migration"), and dynamic typing indicator.

   - **Behavior:** Acts as a specialized workplace executive assistant handling general workplace productivity inquiries.

---

### RESPONSIBLE AI & ETHICAL GUARDS

- **Disclaimer Component:** Include an explicit, styled disclaimer banner on all outputs:

  *"Disclaimer: AI-generated outputs are assistance tools and must be reviewed and validated by a human prior to official workplace distribution or decision-making."*

- **Privacy Notice:** Add a subtle micro-copy note near input areas: *"Data processed locally for demonstration. Do not submit sensitive personal identifiable information (PII)."*

---

### INTERACTION & FUNCTIONALITY

- Provide realistic default placeholder examples/templates for every input box so the user can test functionality in 1-click ("Load Demo Data" button for each module).

- Include toast notifications for UI actions (e.g., "Copied to clipboard!", "Schedule generated!").

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://insight-work-ai.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/867fd6d3-ffbe-40d4-9b8b-edbe1d5395da).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
