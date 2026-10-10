# Ask FORGE AI backend

Prepared, not yet activated. GitHub Pages serves the website; this server-only Worker supplies actual AI answers via the OpenAI Responses API. It gives the model tools to search all stored FORGE entries, read section comparisons/PGI/source dates, and review update notices. The model can call tools multiple times before generating an explanation. Follow-ups include recent conversation history. Answers link to read sections; unknown citation IDs and answers without tool use are rejected.

## Activation

Enable the OpenAI Developers plugin and use its `openai-platform-api-key` setup, then deploy this Worker through a supported server hosting connection. Store `OPENAI_API_KEY` as a runtime secret and configure `OPENAI_MODEL` to an enabled Responses/tool-calling model. Do not put the key in source, frontend configuration, GitHub Pages, or chat. Configure provider budget limits and platform rate limiting before public launch; the included in-memory per-isolate throttle is not a global spend cap.

Set `alternate/agent-config.json` endpoint to the deployed HTTPS `/api/chat` URL and add its exact origin to the alternate page CSP `connect-src`. Keep `ALLOWED_ORIGIN` restricted to the FORGE website. CORS is not authentication; use platform access control if the assistant should be limited to staff. No questions/history are persisted by this code; questions are sent to the configured AI provider. Provider retention policies still apply.

## Contract

POST `/api/chat`: `{messages: [{role: "user"|"assistant", content: string}], sectionId?: string}`. At most 10 recent messages, 3000 characters each, 20 KB request. Result: `{answer: string, sources: [{id,title,url,links}], reviewed: string}`. Errors: `{error: string}` with an appropriate HTTP status. Responses contain plain text, never executable HTML.

Source freshness: fetch and merge public kb.json, updates.json, and mappings.json server-side, cached five minutes. The model cannot verify live official sites or compensate for missing/unreviewed deviations. These limitations are included in its instructions.

Validation: `node --test tests/forge-agent.test.mjs`. Mocked model responses validate tool calls, grounded answers/citations, missing credentials, input rejection, and CORS; a live AI answer must be checked after activation.
