
/**
 * Email 1: Welcome Email (Immediate)
 * Trigger: User signs up as HR/Employer
 */
export function welcomeHRTemplate(firstName) {
    const subject = `Welcome to TalentSwype, ${firstName} — Quality hiring starts here 🎯`;
    const text = `Hi ${firstName},

Welcome to TalentSwype! You've just partnered with India's quality-first recruitment platform.

You're in early access — we're working with select companies to perfect our quality-first hiring process.

Why top companies choose us:
- Multi-stage candidate screening (Parts 0-4) ensures only the best reach you
- Verified, pre-screened candidates — no resume spam
- Fast turnaround without compromising quality
- 30-day replacement guarantee on every hire

✅ Get Started in 3 Steps:
1. Post your first job (takes 3 minutes)
2. Our team screens candidates
3. Review only qualified matches

Post Your First Job: http://portal.talentswype.com/post-job

What to expect:
- Job goes live within 24 hours of posting
- Candidate screening begins immediately
- You'll receive shortlisted profiles within 3-5 days

Questions? Just reply to this email or schedule a call with us.

Looking forward to your first quality hire!

Shantanu Kulkaarni
Founder & CEO, TalentSwype

P.S. We'll send you hiring best practices and tips over the next few days to help you get the most out of our platform.`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to TalentSwype</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <div style="display:none; font-size:1px; color:#333333; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
        Your welcome kit + how to hire your first quality candidate
    </div>

    <p>Hi ${firstName},</p>

    <p>Welcome to TalentSwype! You've just partnered with India's quality-first recruitment platform.</p>

    <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <p style="margin: 0; color: #856404;"><strong>You're in early access</strong> — we're working with select companies to perfect our quality-first hiring process.</p>
    </div>

    <p><strong>Why top companies choose us:</strong></p>
    <ul>
        <li>Multi-stage candidate screening ensures only the best reach you</li>
        <li>Verified, pre-screened candidates — no resume spam</li>
        <li>Fast turnaround without compromising quality</li>
        <li>30-day replacement guarantee on every hire</li>
    </ul>

    <p><strong>🎥 Watch: How TalentSwype Screening Works (2 min)</strong></p>
    <p><a href="#" style="color: #007bff;">[Video Link Placeholder]</a></p>

    <p><strong>✅ Get Started in 3 Steps:</strong></p>
    <ol>
        <li>Post your first job (takes 3 minutes)</li>
        <li>Our team screens candidates</li>
        <li>Review only qualified matches</li>
    </ol>

    <div style="text-align: center; margin: 30px 0;">
        <a href="http://portal.talentswype.com/post-job" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Post Your First Job</a>
    </div>

    <p><strong>What to expect:</strong></p>
    <ul>
        <li>Job goes live within 24 hours of posting</li>
        <li>Candidate screening begins immediately</li>
        <li>You'll receive shortlisted profiles within 3-5 days</li>
    </ul>

    <p>Questions? Just reply to this email or schedule a call with us.</p>

    <p>Looking forward to your first quality hire!</p>

    <p><strong>Shantanu Kulkaarni</strong><br>
    Founder & CEO, TalentSwype</p>

    <p style="font-size: 13px; color: #666; border-top: 1px solid #eee; padding-top: 20px;">
        P.S. We'll send you hiring best practices and tips over the next few days to help you get the most out of our platform.
    </p>

</body>
</html>
    `;
    return { subject, text, html };
}

/**
 * Email 2: Job Posting Tips & Screening Process (Day 3)
 * Trigger: 72 hours after signup -> Send to all HR
 */
export function jobPostingTipsTemplate(firstName, hasPostedJob) {
    const subject = `How we filter 100 resumes down to your top 5 🔍`;
    const text = `Hi ${firstName},

Ready to post your first job? Here's how to attract the RIGHT candidates and what happens next:

✨ 4 Job Posting Tips:

1. Be crystal clear about the role
Vague job descriptions attract vague candidates. Specify day-to-day responsibilities, not just requirements.

2. Highlight what makes YOU attractive
Why should top talent choose your company? Culture, growth, benefits — make it compelling.

3. Set realistic requirements
"5 years experience for entry-level" filters out great candidates. Focus on must-haves vs. nice-to-haves.

4. Include salary range (if possible)
Transparency builds trust and saves everyone time.

🎯 Our 5-Part Screening Process:
Ever wondered how we ensure you only see quality candidates?

Part 0: Initial Filter (Founder review)
Part 1: Primary Screening (HR Specialist)
Part 2: Secondary Assessment (Project Manager)
Part 3: Final Review (Senior Reviewer)
Part 4: Client-Specific Screening (Custom)

The result? Only 5-10% of applicants make it to your inbox. But those who do are worth your time.

${hasPostedJob ? 
"Your job is currently in screening. We'll notify you as soon as we have qualified candidates ready for review!" : 
"Post Your First Job: http://portal.talentswype.com/post-job\nLet us do the heavy lifting. You focus on making the final decision."}

Team TalentSwype`;

    const dynamicContent = hasPostedJob ? `
    <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 30px 0; border-left: 4px solid #28a745;">
        <p style="margin: 0; color: #155724;"><strong>Your job is currently in screening.</strong> We'll notify you as soon as we have qualified candidates ready for review!</p>
    </div>` : `
    <div style="text-align: center; margin: 30px 0;">
        <a href="http://portal.talentswype.com/post-job" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Post Your First Job</a>
        <p style="margin-top: 10px; font-size: 14px;"><em>Link: <a href="http://portal.talentswype.com/post-job" style="color: #007bff;">portal.talentswype.com/post-job</a></em></p>
    </div>
    <p>Let us do the heavy lifting. You focus on making the final decision.</p>`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Job Posting Tips</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <div style="display:none; font-size:1px; color:#333333; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
        Inside TalentSwype's multi-stage screening + job posting tips
    </div>

    <p>Hi ${firstName},</p>

    <p>Ready to post your first job? Here's how to attract the RIGHT candidates and what happens next:</p>

    <p><strong>✨ 4 Job Posting Tips:</strong></p>

    <div style="margin-bottom: 20px;">
        <p><strong>1. Be crystal clear about the role</strong><br>
        Vague job descriptions attract vague candidates. Specify day-to-day responsibilities, not just requirements.</p>
    </div>

    <div style="margin-bottom: 20px;">
        <p><strong>2. Highlight what makes YOU attractive</strong><br>
        Why should top talent choose your company? Culture, growth, benefits — make it compelling.</p>
    </div>

    <div style="margin-bottom: 20px;">
        <p><strong>3. Set realistic requirements</strong><br>
        "5 years experience for entry-level" filters out great candidates. Focus on must-haves vs. nice-to-haves.</p>
    </div>

    <div style="margin-bottom: 20px;">
        <p><strong>4. Include salary range (if possible)</strong><br>
        Transparency builds trust and saves everyone time.</p>
    </div>

    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">

    <p><strong>🎯 Our 5-Part Screening Process:</strong></p>
    <p>Ever wondered how we ensure you only see quality candidates?</p>

    <ul style="list-style-type: none; padding: 0;">
        <li style="margin-bottom: 10px;">✅ <strong>Part 0: Initial Filter</strong> (Founder review)</li>
        <li style="margin-bottom: 10px;">✅ <strong>Part 1: Primary Screening</strong> (HR Specialist)</li>
        <li style="margin-bottom: 10px;">✅ <strong>Part 2: Secondary Assessment</strong> (Project Manager)</li>
        <li style="margin-bottom: 10px;">✅ <strong>Part 3: Final Review</strong> (Senior Reviewer)</li>
        <li style="margin-bottom: 10px;">✅ <strong>Part 4: Client-Specific Screening</strong> (Custom)</li>
    </ul>

    <p>The result? Only 5-10% of applicants make it to your inbox. But those who do are worth your time.</p>

    ${dynamicContent}

    <p>Team TalentSwype</p>

</body>
</html>
    `;
    return { subject, text, html };
}

/**
 * Email 3: Hiring Best Practices (Day 7)
 * Trigger: 7 days after signup -> Send to all HR
 */
export function hiringBestPracticesTemplate(firstName, hasActivity, stats = { jobsPosted: 0, candidatesInReview: 0, profilesShortlisted: 0 }) {
    const subject = `5 ways to hire faster (without sacrificing quality) ⚡`;
    const text = `Hi ${firstName},

You've been with us for a week! Here are 5 insights from helping companies hire smarter:

💡 5 Hiring Best Practices:

1. Respond to candidates within 24 hours
Top talent gets multiple offers. Speed matters. Check your portal regularly for new candidate profiles.

2. Keep your screening criteria focused
The more requirements you add, the longer it takes. Prioritize must-haves.

3. Give feedback (even rejections)
It builds your employer brand. Candidates remember how you treat them.

4. Use our 30-day replacement guarantee
If a hire doesn't work out, we'll find you a replacement at no extra cost. No risk!

5. Build a talent pipeline
Don't just hire for today. Build relationships with quality candidates for future roles.

📖 Quick Success Story:
"We needed to hire 5 people in 30 days without compromising quality. TalentSwype's screening process saved us 40+ hours and every hire is still with us."
- HR Manager, Pune-based Tech Company

Your progress:
- Jobs posted: ${stats.jobsPosted}
- Candidates in review: ${stats.candidatesInReview}
- Profiles shortlisted: ${stats.profilesShortlisted}

${hasActivity ? 
"Great momentum! Keep the process moving and you'll have your quality hires soon." : 
"We noticed you haven't posted a job yet. Need help getting started?\n\nPost Your Job Now: http://portal.talentswype.com/post-job\n\nOr reply to this email and our team will personally assist you."}

Happy hiring,

Shantanu & Team TalentSwype`;

    const dynamicContent = hasActivity ? `
    <p><strong>Great momentum!</strong> Keep the process moving and you'll have your quality hires soon.</p>` : `
    <p>We noticed you haven't posted a job yet. Need help getting started?</p>
    <div style="text-align: center; margin: 30px 0;">
        <a href="http://portal.talentswype.com/post-job" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Post Your Job Now</a>
    </div>
    <p>Or reply to this email and our team will personally assist you.</p>`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Hiring Best Practices</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <div style="display:none; font-size:1px; color:#333333; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
        Insights from recruiting 500+ quality candidates
    </div>

    <p>Hi ${firstName},</p>

    <p>You've been with us for a week! Here are 5 insights from helping companies hire smarter:</p>

    <p><strong>💡 5 Hiring Best Practices:</strong></p>

    <ol>
        <li style="margin-bottom: 10px;"><strong>Respond to candidates within 24 hours</strong><br>Top talent gets multiple offers. Speed matters. Check your portal regularly for new candidate profiles.</li>
        <li style="margin-bottom: 10px;"><strong>Keep your screening criteria focused</strong><br>The more requirements you add, the longer it takes. Prioritize must-haves.</li>
        <li style="margin-bottom: 10px;"><strong>Give feedback (even rejections)</strong><br>It builds your employer brand. Candidates remember how you treat them.</li>
        <li style="margin-bottom: 10px;"><strong>Use our 30-day replacement guarantee</strong><br>If a hire doesn't work out, we'll find you a replacement at no extra cost. No risk!</li>
        <li style="margin-bottom: 10px;"><strong>Build a talent pipeline</strong><br>Don't just hire for today. Build relationships with quality candidates for future roles.</li>
    </ol>

    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">

    <p><strong>📖 Quick Success Story:</strong></p>
    <blockquote style="font-style: italic; background: #f9f9f9; border-left: 4px solid #ccc; margin: 10px 0; padding: 10px;">
        "We needed to hire 5 people in 30 days without compromising quality. TalentSwype's screening process saved us 40+ hours and every hire is still with us."
    </blockquote>
    <p style="text-align: right;">- HR Manager, Pune-based Tech Company</p>

    <div style="background-color: #f0f4f8; padding: 15px; border-radius: 5px; margin: 30px 0;">
        <p style="margin: 0 0 10px 0; font-weight: bold;">Your progress:</p>
        <ul style="margin: 0; padding-left: 20px;">
            <li>Jobs posted: <strong>${stats.jobsPosted}</strong></li>
            <li>Candidates in review: <strong>${stats.candidatesInReview}</strong></li>
            <li>Profiles shortlisted: <strong>${stats.profilesShortlisted}</strong></li>
        </ul>
    </div>

    ${dynamicContent}

    <p>Happy hiring,</p>
    <p>Shantanu & Team TalentSwype</p>

</body>
</html>
    `;
    return { subject, text, html };
}
