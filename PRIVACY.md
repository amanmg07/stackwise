# StackWise Privacy Policy

**Last updated:** 2026-05-09

> **DRAFT — must be reviewed by qualified legal counsel before being
> linked from the App Store, in-app, or any production surface.** The
> language below is an engineer-written first draft that accurately
> reflects how the application currently handles data; it has not been
> reviewed for jurisdictional compliance with GDPR, CCPA, Washington's
> My Health My Data Act, HIPAA, or any other framework you may be
> subject to.

## 1. Who we are

StackWise is a peptide and supplement education and tracking
application. References to "we", "us", or "our" mean the operator of
the StackWise mobile app.

## 2. What information we collect

### 2.1 On-device only — never sent to any server

The following data is stored locally on your device and is **never**
transmitted to our servers or any third party:

- Self Scan photos (stored in your device's app sandbox)
- Free-text journal notes
- Free-text chat messages with the AI advisor
- Your name (if you set a display name) and profile image

### 2.2 Sent to our backend, tied to an anonymous user ID

When you create the app, we generate an anonymous Supabase auth user
identifier ("anon_id"). This identifier is linked to:

- Anonymous demographics: age, gender, goals, experience level
- Cycle records: which compounds you logged, with doses, frequencies,
  routes, time-of-day, and duration
- Journal numerical metrics: sleep quality, energy level, recovery
  score, mood, weight, sleep hours
- Reported side effects (selected from a fixed list)
- Self Scan analysis category outcomes (the inferred categories, not
  the photo)
- AI chat usage (length of question and which compounds were active in
  your cycle when you asked it; not the question text itself)

We do not collect: email, phone number, IP address, device
identifiers, location, or any other contact information.

### 2.3 What goes through the AI advisor

When you use the AI chat or Self Scan features, your input is sent to
our proxy edge function, which forwards it to a third-party AI model
provider. Photos and chat messages are processed for the duration of
the request and are not retained on our servers. Behavior on the AI
provider's side is governed by their own data policies.

## 3. How we use your information

- To operate the app's core features (cycles, journal, scans, chat)
- For internal product analytics, if you have opted in (see Section 5)
- For sharing with third-party healthcare research partners, if you
  have separately opted in (see Section 6)

## 4. What we **do not** do with your information

- We do not sell or share information that could identify you.
- We do not run advertising. We do not allow advertisers to target you
  based on your data.
- We do not hand your data to data brokers, social platforms, or
  marketing analytics SDKs.

## 5. Internal product analytics (opt-in)

If you check the analytics-consent box during onboarding, we record
anonymous events (e.g. cycle started, dose logged, journal entry
saved) tied to your anon_id. We use this to improve the app. You can
revoke this at any time in **Profile → Settings**; we will stop
recording new events immediately.

## 6. Sharing with healthcare research partners (separate opt-in)

If you separately opt in on the Research Consent screen — or via the
**Profile → Settings → Share research data** toggle — we may share a
de-identified subset of your data with healthcare and biomedical
research organizations.

**What we share with research partners:**

- A separate, rotatable research identifier (not your anon_id)
- Your demographics: age, gender, experience level
- Your full protocol structure: compounds, doses, frequencies, routes
- Your daily journal numerical metrics
- Reported side effects (from the fixed list)

**What we never share, even if you have opted in:**

- Your anon_id, email, phone, name, or any contact information
- Free-text journal notes or chat messages
- Self Scan photos or any visual data
- Any data tied to a real-world identity

The research identifier we share is not tied to your account
internally — we can rotate it at any time, which immediately renders
any previously-shared data unjoinable to anything new about you.

You can revoke this consent at any time in **Profile → Settings**.
Revocation removes you from all future data shares immediately.
Already-shared data we have already delivered to a research partner
cannot be retroactively recalled, but a rotation of your research
identifier ensures no future delivery can be linked to it.

## 7. Where data is stored

User profiles, anonymous events, and the rotatable research identifier
are stored in Supabase. Self Scan photos and free-text notes stay on
your device.

## 8. Your rights

You can:

- Revoke analytics consent in **Profile → Settings** at any time
- Revoke research-sharing consent in **Profile → Settings** at any
  time
- Delete all locally-stored app data via **Profile → Clear All Data**
- Request that we delete all server-side records associated with your
  anon_id by contacting us at the address below

If you are in California, the EU/EEA, the UK, Washington State, or
another jurisdiction with statutory privacy rights, additional rights
may apply (right of access, right to data portability, right to
deletion, etc.). Contact us to exercise them.

## 9. Children

StackWise is not intended for users under 18. We do not knowingly
collect data from anyone under 18.

## 10. Changes to this policy

We will update this policy from time to time. Material changes will
be announced in-app before they take effect.

## 11. Contact

Email: stackwse1@gmail.com
Web: https://stackwse.com
