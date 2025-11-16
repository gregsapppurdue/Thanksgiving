# Google OAuth Verification Warning - Explained

## What You're Seeing

When you authorize the Google Apps Script, you may see this warning:

> "This app hasn't been verified by Google. Because this app is requesting some access to your Google Account, you should continue only if you know and trust this app developer."

## Is This Safe?

**Yes, this is safe for personal/internal use.** This warning appears because:

1. **The app is unverified**: Google requires OAuth verification for apps that will be used by many users
2. **You're the developer**: Since you created the script yourself, you can trust it
3. **Limited scope**: The script only accesses the specific Google Sheet you created

## How to Proceed

When you see the warning:

1. Click **Advanced**
2. Click **Go to [Project Name] (unsafe)**
3. Click **Allow** to grant the necessary permissions

The word "unsafe" is Google's way of saying "unverified" - it doesn't mean the app is malicious, just that Google hasn't reviewed it.

## What Permissions Are Requested?

The script requests:
- **Access to Google Sheets**: To read and write RSVP data to your spreadsheet
- **Script execution**: To run the web app functionality

These permissions are necessary for the RSVP backend to function.

## When Verification Is Required

Google OAuth verification is **required** if:
- The app will be used by more than 100 users
- The app requests sensitive scopes (this app doesn't)
- You want to publish it in the Google Workspace Marketplace

For personal projects or small internal use, verification is **not required**.

## Security Best Practices

Even though the app is unverified, you can use it safely by:

1. **Only you deploy it**: You control the script code
2. **Limited access**: The script only accesses the specific sheet you created
3. **Review the code**: You can see exactly what the script does in `google-apps-script/RSVP_API.gs`
4. **Monitor usage**: Check your Google Sheet to see what data is being written

## If You Want to Verify (Optional)

If you want to go through Google's verification process (not necessary for personal use):

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to **APIs & Services** → **OAuth consent screen**
4. Complete the verification process
5. This can take several days and requires providing business information

**For most personal projects, this is unnecessary.**

## Troubleshooting

If you're having trouble authorizing:

1. **Make sure you're logged into the correct Google account**
2. **Clear browser cache** and try again
3. **Use an incognito/private window** to avoid cached permissions
4. **Check that pop-up blockers aren't preventing the authorization window**

## Summary

- ✅ The warning is normal for unverified apps
- ✅ It's safe to proceed if you created the script yourself
- ✅ Click "Advanced" → "Go to [Project Name] (unsafe)" → "Allow"
- ✅ Verification is only needed for apps with 100+ users

