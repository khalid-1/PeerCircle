# Email Delivery Optimization Guide

## The Problem
You are experiencing delays with Firebase Authentication emails (verification, password reset). This is common when using the default `noreply@YOUR-APP.firebaseapp.com` sender address, especially when sending to institutional emails (like `@rakmhsu.ac.ae`).

## Why is it slow?
1.  **Shared Reputation**: You are sharing an email server with thousands of other Firebase apps. If one of them sends spam, the whole server gets "greylisted" (temporarily blocked) by strict email providers like universities.
2.  **"External Sender" Warning**: As seen in your screenshot, the university email system treats the email as suspicious because the sender domain (`firebaseapp.com`) doesn't match your organization. This triggers deep scanning which delays delivery.

## Solution 1: Verify Custom Domain (Recommended)
This is the easiest fix and often solves the problem by proving you own the domain.

1.  Go to **Firebase Console** -> **Authentication** -> **Templates**.
2.  Click the **pencil icon** (Edit) next to "Email address verification".
3.  Click **"Customize domain"**.
4.  Follow the steps to verify a domain you own (e.g., `peercircle.com` or a subdomain).
5.  You will need to add DNS records (CNAME/TXT) to your domain provider.

## Solution 2: Custom SMTP (Free Student Options)
Since you are a student, you don't need expensive enterprise plans. Here are the best free options:

## Solution 2: Custom SMTP (Free Student Options)

### Option A: Brevo (Requires Custom Domain)
**⚠️ IMPORTANT**: Brevo now blocks `@gmail.com` senders. You can ONLY use this if you own a custom domain (like `peercircle.com`). If you don't, skip to Option B.

### Option B: Gmail SMTP (Best for Students)
Since you are using a free `@gmail.com` address, this is your best option.

**Why is it slow?**
If you are sending to your **University Email** (`@rakmhsu.ac.ae`), the university's spam filter is likely holding the email for scanning (Greylisting), causing the 1-hour delay and "Link Expired" error.

**✅ THE FIX (For your Demo):**
**Test with a personal Gmail account** (e.g., sign up as `khalid.test@gmail.com` instead of your university email).
*   Personal Gmails don't have strict greylisting.
*   The email should arrive instantly.
*   This proves your app works for the demo.

**Setup Instructions:**
1.  **Google Account**: Go to `myaccount.google.com` -> Security.
2.  **2-Step Verification**: Must be ON.
3.  **App Passwords**: Search for "App Passwords" and create one named "Firebase". Copy the 16-character code.
4.  **Firebase Console**:
    *   **Sender Email**: `your-email@gmail.com`
    *   **Host**: `smtp.gmail.com`
    *   **Port**: `465`
    *   **Security Mode**: `SSL`
    *   **Username**: `your-email@gmail.com`
    *   **Password**: The 16-character App Password.

This makes emails come from *you* directly, which universities usually trust more than "noreply@firebase".

## Solution 3: Whitelisting (University IT)
Since this is a university project, you can ask the IT department to "whitelist" or "allowlist" emails from:
*   `noreply@peercircle-app.firebaseapp.com`
*   Or your custom domain if you set one up.

Tell them: "This is for a student project app, please allow these emails to bypass greylisting."
