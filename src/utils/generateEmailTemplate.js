// Utility function to generate HTML email template for verification code
const generateEmailTemplate = (verificationCode) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>Email Verification — Blog App</title>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'DM Sans', Helvetica, sans-serif;
          background-color: #f5f0eb;
          color: #1a1a1a;
          padding: 40px 20px;
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
        }

        .wrapper {
          max-width: 580px;
          margin: 0 auto;
          width: 100%;
        }

        /* ── Masthead ── */
        .masthead {
          text-align: center;
          margin-bottom: 32px;
        }

        .masthead .wordmark {
          display: inline-block;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 28px;
          font-weight: 700;
          color: #1a1a1a;
          letter-spacing: -0.5px;
          border-bottom: 3px solid #e8533a;
          padding-bottom: 6px;
        }

        .masthead .tagline {
          margin-top: 8px;
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #888;
        }

        /* ── Card ── */
        .card {
          background: #fff;
          border-radius: 3px;
          overflow: hidden;
          box-shadow: 0 2px 24px rgba(0,0,0,0.07);
        }

        /* Decorative top strip */
        .card-strip {
          height: 5px;
          background: linear-gradient(90deg, #e8533a 0%, #f0a500 50%, #e8533a 100%);
        }

        .card-body {
          padding: 48px 48px 40px;
        }

        /* ── Headline ── */
        .headline {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 30px;
          font-weight: 700;
          line-height: 1.2;
          color: #1a1a1a;
          margin-bottom: 16px;
        }

        .headline span {
          color: #e8533a;
        }

        .intro {
          font-size: 15px;
          line-height: 1.7;
          color: #555;
          border-left: 3px solid #f0a500;
          padding-left: 16px;
          margin-bottom: 36px;
        }

        /* ── Section label ── */
        .section-label {
          font-size: 10px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #aaa;
          text-align: center;
          margin-bottom: 16px;
        }

        /* ── Code Box ── */
        .code-wrapper {
          text-align: center;
          margin-bottom: 36px;
        }

        .code-box {
          display: inline-block;
          background: #fdf6ee;
          border: 1.5px solid #e8e0d5;
          border-radius: 4px;
          padding: 22px 40px;
          font-family: 'Courier New', Courier, monospace;
          font-size: 40px;
          font-weight: 700;
          letter-spacing: 10px;
          color: #1a1a1a;
          position: relative;
          /* push text right to optically center with letter-spacing */
          padding-left: 50px;
        }

        /* Corner accents */
        .code-box::before,
        .code-box::after {
          content: '';
          position: absolute;
          width: 10px;
          height: 10px;
          border-color: #e8533a;
          border-style: solid;
        }
        .code-box::before {
          top: -2px;
          left: -2px;
          border-width: 2px 0 0 2px;
        }
        .code-box::after {
          bottom: -2px;
          right: -2px;
          border-width: 0 2px 2px 0;
        }

        /* ── Expiry notice ── */
        .expiry {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fff8ec;
          border: 1px solid #f0d48a;
          border-radius: 3px;
          padding: 14px 18px;
          margin-bottom: 36px;
          font-size: 13px;
          color: #7a5c00;
        }

        .expiry-icon {
          font-size: 18px;
          flex-shrink: 0;
        }

        .expiry strong {
          font-weight: 500;
        }

        /* ── Rule & Footer note ── */
        .rule {
          border: none;
          border-top: 1px solid #eee;
          margin-bottom: 24px;
        }

        .footer-note {
          font-size: 13px;
          color: #999;
          line-height: 1.7;
        }

        /* ── Email footer ── */
        .email-footer {
          text-align: center;
          margin-top: 28px;
          font-size: 11px;
          color: #bbb;
          letter-spacing: 0.5px;
          line-height: 1.8;
        }

        .email-footer a {
          color: #e8533a;
          text-decoration: none;
        }

        /* ════════════════════════════
           RESPONSIVE BREAKPOINTS
        ════════════════════════════ */

        /* Tablet ≤ 600px */
        @media only screen and (max-width: 600px) {
          body {
            padding: 28px 14px;
          }

          .card-body {
            padding: 36px 32px 32px;
          }

          .headline {
            font-size: 26px;
          }

          .code-box {
            font-size: 34px;
            letter-spacing: 8px;
            padding: 18px 32px;
            padding-left: 40px;
          }
        }

        /* Mobile ≤ 480px */
        @media only screen and (max-width: 480px) {
          body {
            padding: 20px 10px;
          }

          .masthead .wordmark {
            font-size: 24px;
          }

          .card-body {
            padding: 28px 22px 26px;
          }

          .headline {
            font-size: 23px;
          }

          .intro {
            font-size: 14px;
            margin-bottom: 28px;
          }

          .code-box {
            font-size: 28px;
            letter-spacing: 6px;
            padding: 16px 24px;
            padding-left: 30px;
          }

          .expiry {
            font-size: 12px;
            padding: 12px 14px;
            gap: 8px;
          }

          .footer-note {
            font-size: 12px;
          }

          .email-footer {
            font-size: 10px;
          }
        }

        /* Small mobile ≤ 360px */
        @media only screen and (max-width: 360px) {
          .card-body {
            padding: 22px 16px 20px;
          }

          .masthead .wordmark {
            font-size: 21px;
          }

          .headline {
            font-size: 20px;
          }

          .code-box {
            font-size: 24px;
            letter-spacing: 4px;
            padding: 14px 18px;
            padding-left: 22px;
            /* hide corner accents at very small sizes to avoid overflow */
          }

          .code-box::before,
          .code-box::after {
            display: none;
          }

          .intro {
            font-size: 13px;
          }
        }
      </style>
    </head>
    <body>
      <div class="wrapper">

        <!-- Masthead -->
        <div class="masthead">
          <div class="wordmark">Blog App</div>
          <div class="tagline">Stories worth reading</div>
        </div>

        <!-- Main card -->
        <div class="card">
          <div class="card-strip"></div>
          <div class="card-body">

            <h1 class="headline">Verify your<br><span>email address.</span></h1>

            <p class="intro">
              You're one step away from joining the community. Use the code below to confirm your email and start reading — and writing — stories that matter.
            </p>

            <div class="section-label">Your verification code</div>

            <div class="code-wrapper">
              <div class="code-box">${verificationCode}</div>
            </div>

            <div class="expiry">
              <span class="expiry-icon">⏱</span>
              <span><strong>This code expires in 10 minutes.</strong> If it expires, you can request a new one from the sign-up page.</span>
            </div>

            <hr class="rule">

            <p class="footer-note">
              Didn't create an account? You can safely ignore this email — no account will be created without verification.
            </p>

          </div>
        </div>

        <!-- Footer -->
        <div class="email-footer">
          <p>This is an automated message from Blog App. Please do not reply.</p>
          <p>&copy; ${new Date().getFullYear()} Blog App &nbsp;·&nbsp; <a href="#">Unsubscribe</a> &nbsp;·&nbsp; <a href="#">Privacy Policy</a></p>
        </div>

      </div>
    </body>
    </html>
  `;
};

module.exports = generateEmailTemplate;