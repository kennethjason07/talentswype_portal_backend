
/**
 * Email 1: Welcome Email (Immediate)
 * Trigger: User signs up as Job Seeker
 */
export function welcomeEmailTemplate(firstName, unsubscribeToken = '') {
    const subject = `Welcome to TalentSwype, ${firstName}! No more fake jobs or ignored applications 🚀`;
    const text = `Hi ${firstName},

Welcome to TalentSwype! You've just joined a recruitment platform built to solve the problems job seekers actually face.

Here's what makes us different:
- No fake jobs — Only verified HR professionals and real companies
- Real responses — Every candidate gets proper feedback, even on rejections
- No agency scams — We never ask candidates to pay money
- Your privacy matters — Your data is protected and never misused

✅ Ready to get started?
Browse quality job openings and apply to roles that match your skills and goals.

Browse Jobs Now: https://portal.talentswype.com/jobs?utm_source=email&utm_medium=automation&utm_campaign=seeker_welcome&utm_content=text_link

Need help? Chat with us on WhatsApp: https://wa.me/919389557198?text=Hi%20I%20need%20help&utm_source=email&utm_medium=automation&utm_campaign=seeker_welcome&utm_content=whatsapp_support

Best regards,

Shantanu Nitin Kulkaarni
Founder
TalentSwype

This email was sent to you because you signed up for TalentSwype. If you'd like to stop receiving these emails, you can unsubscribe here: https://portal.talentswype.com/unsubscribe?token=${unsubscribeToken}
TalentSwype | Pune, India`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to TalentSwype</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <p>Hi ${firstName},</p>

    <p>Welcome to TalentSwype! You've just joined a recruitment platform built to solve the problems job seekers actually face.</p>

    <p><strong>Here's what makes us different:</strong></p>

    <ul>
        <li><strong>No fake jobs</strong> — Only verified HR professionals and real companies</li>
        <li><strong>Real responses</strong> — Every candidate gets proper feedback, even on rejections</li>
        <li><strong>No agency scams</strong> — We never ask candidates to pay money</li>
        <li><strong>Your privacy matters</strong> — Your data is protected and never misused</li>
    </ul>

    <p><strong>✅ Ready to get started?</strong></p>

    <p>Browse quality job openings and apply to roles that match your skills and goals.</p>

    <div style="text-align: center; margin: 30px 0;">
        <a href="https://portal.talentswype.com/jobs?utm_source=email&utm_medium=automation&utm_campaign=seeker_welcome&utm_content=browse_jobs_cta" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Browse Jobs Now</a>
    </div>

    <div style="text-align: center; margin: 30px 0;">
        <a href="https://portal.talentswype.com/talentswypedashboard?utm_source=email&utm_medium=automation&utm_campaign=seeker_welcome&utm_content=dashboard_cta" style="background-color: #17a2b8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Go to Dashboard</a>
    </div>

    <p><em>Link: <a href="https://portal.talentswype.com/jobs?utm_source=email&utm_medium=automation&utm_campaign=seeker_welcome&utm_content=text_link" style="color: #007bff;">portal.talentswype.com/jobs</a></em></p>

    <p>Need help? <a href="https://wa.me/919389557198?text=Hi%20I%20need%20help&utm_source=email&utm_medium=automation&utm_campaign=seeker_welcome&utm_content=whatsapp_support" style="font-weight: bold; color: #007bff;">Chat with us on WhatsApp</a></p>

    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">

    <p>Best regards,</p>

    <p><strong>Shantanu Nitin Kulkaarni</strong><br>
    Founder<br>
    TalentSwype</p>

    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">

    <p style="font-size: 12px; color: #777; text-align: center;">
        <em>This email was sent to you because you signed up for TalentSwype. If you'd like to stop receiving these emails, you can <a href="https://portal.talentswype.com/unsubscribe?token=${unsubscribeToken}&utm_source=email&utm_medium=automation&utm_campaign=seeker_welcome&utm_content=unsubscribe" style="color: #777;">unsubscribe here</a>.</em><br>
        <em>TalentSwype | Pune, India</em>
    </p>

</body>
</html>
    `;

    return { subject, text, html }; // Note: The calling function calculates preview text if supported, or we just rely on first lines.
}

/**
 * Email 2: First Application Push (Day 3)
 * Trigger: 72 hours after signup WHERE job_applications = 0
 */
/**
 * Email 2: First Application Push (Day 3)
 * Trigger: 72 hours after signup WHERE job_applications = 0
 */
export function firstApplicationPushTemplate(firstName, jobs = [], unsubscribeToken = '') {
    const subject = `${firstName}, your perfect job match is waiting 💼`;
    
    let jobListText = "";
    let jobListHtml = "";
    let jobSectionHtml = "";

    if (jobs && jobs.length > 0) {
        // Generate Text List
        jobListText = "We've handpicked these jobs for you:\n\n" + jobs.map(job => `- ${job.position} — ${job.company} — ${job.location}`).join("\n");
        
        // Generate HTML List
        jobListHtml = jobs.map(job => `<li>${job.position} — ${job.company} — ${job.location}</li>`).join("");
        
        jobSectionHtml = `
    <p><strong>We've handpicked these jobs for you:</strong></p>

    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <ul style="margin: 0; padding-left: 20px;">
            ${jobListHtml}
        </ul>
    </div>`;
    } else {
        // Fallback: No jobs fetched (should verify why, but show generic message)
        jobListText = "We have hundreds of verified jobs waiting for you on the portal.";
        
        jobSectionHtml = `
    <p><strong>We have hundreds of verified jobs waiting for you.</strong></p>

    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0;">Log in now to see roles that match your profile.</p>
    </div>`;
    }

    const text = `Hi ${firstName},

We hope you're settling in! Now it's time to find your next opportunity.

${jobListText}

Browse All Jobs: https://portal.talentswype.com/jobs?utm_source=email&utm_medium=automation&utm_campaign=seeker_day3&utm_content=text_link

💡 Application Tip:
Quality matters. When you apply, mention why YOU are the right fit for the role — not just that you meet the requirements. Specificity wins.

How our screening works:
1. You apply → We review your application
2. Our team screens for quality and fit
3. Top candidates get forwarded to employers
4. You get real feedback, every step

No black hole applications. Just real conversations.

Apply to Your First Job: https://portal.talentswype.com/jobs?utm_source=email&utm_medium=automation&utm_campaign=seeker_day3&utm_content=apply_first_job

Go to Dashboard: https://portal.talentswype.com/talentswypedashboard?utm_source=email&utm_medium=automation&utm_campaign=seeker_day3&utm_content=dashboard_link

Cheers,
Team TalentSwype`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Your Perfect Job Match</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <div style="display:none; font-size:1px; color:#333333; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
        Browse curated opportunities and apply in minutes
    </div>

    <p>Hi ${firstName},</p>

    <p>We hope you're settling in! Now it's time to find your next opportunity.</p>

    ${jobSectionHtml}

    <div style="text-align: center; margin: 30px 0;">
        <a href="https://portal.talentswype.com/jobs?utm_source=email&utm_medium=automation&utm_campaign=seeker_day3&utm_content=browse_all_jobs_cta" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Browse All Jobs</a>
    </div>

    <p><em>Link: <a href="https://portal.talentswype.com/jobs?utm_source=email&utm_medium=automation&utm_campaign=seeker_day3&utm_content=text_link" style="color: #007bff;">portal.talentswype.com/jobs</a></em></p>

    <div style="background-color: #eef7ff; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
        <p style="margin: 0;"><strong>💡 Application Tip:</strong></p>
        <p style="margin: 5px 0 0 0;">Quality matters. When you apply, mention why YOU are the right fit for the role — not just that you meet the requirements. Specificity wins.</p>
    </div>

    <p><strong>How our screening works:</strong></p>
    <ol>
        <li>You apply → We review your application</li>
        <li>Our team screens for quality and fit</li>
        <li>Top candidates get forwarded to employers</li>
        <li>You get real feedback, every step</li>
    </ol>

    <p>No black hole applications. Just real conversations.</p>

    <div style="text-align: center; margin: 30px 0;">
        <a href="https://portal.talentswype.com/jobs?utm_source=email&utm_medium=automation&utm_campaign=seeker_day3&utm_content=apply_first_job_cta" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Apply to Your First Job</a>
    </div>

    <div style="text-align: center; margin: 30px 0;">
        <a href="https://portal.talentswype.com/talentswypedashboard?utm_source=email&utm_medium=automation&utm_campaign=seeker_day3&utm_content=dashboard_cta" style="background-color: #17a2b8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Go to Dashboard</a>
    </div>

    <p><em>Link: <a href="https://portal.talentswype.com/jobs?utm_source=email&utm_medium=automation&utm_campaign=seeker_day3&utm_content=apply_text_link" style="color: #007bff;">portal.talentswype.com/jobs</a></em></p>

    <p>Cheers,</p>
    <p>Team TalentSwype</p>

    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">

    <p style="font-size: 12px; color: #777; text-align: center;">
        <em>This email was sent to you because you signed up for TalentSwype. If you'd like to stop receiving these emails, you can <a href="https://portal.talentswype.com/unsubscribe?token=${unsubscribeToken}&utm_source=email&utm_medium=automation&utm_campaign=seeker_day3&utm_content=unsubscribe" style="color: #777;">unsubscribe here</a>.</em><br>
        <em>TalentSwype | Pune, India</em>
    </p>

</body>
</html>
    `;
    return { subject, text, html };
}

/**
 * Email 3: Engagement & Tips (Day 6)
 * Trigger: 6 days after signup → Send to all seekers
 */
export function engagementTipsTemplate(firstName, applicationsCount, newMatchesCount, unsubscribeToken = '') {
    const subject = `5 insider tips to land interviews faster 🎯`;
    const text = `Hi ${firstName},

You've been with us for a week now! Here's what we've learned from placing hundreds of quality candidates:

🔥 4 Things That Get You Noticed:

1. Be specific, not generic
Instead of "hardworking team player," say "increased team output by 20% through process automation."

2. Show, don't just tell
Numbers, results, and outcomes speak louder than buzzwords.

3. Stay active
Log in regularly and check for new opportunities. Consistency matters.

4. Be ready for screening calls
Our team might reach out — answer promptly and professionally!

Your activity this week:
- Applications sent: ${applicationsCount}
- New job matches: ${newMatchesCount}

Explore More Opportunities: https://portal.talentswype.com/jobs?utm_source=email&utm_medium=automation&utm_campaign=seeker_day7&utm_content=text_link

Go to Dashboard: https://portal.talentswype.com/talentswypedashboard?utm_source=email&utm_medium=automation&utm_campaign=seeker_day7&utm_content=dashboard_link

Keep going — the right opportunity is closer than you think!

Team TalentSwype`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Insider Tips to Land Interviews</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

    <div style="display:none; font-size:1px; color:#333333; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
        Learn what HR professionals actually look for
    </div>

    <p>Hi ${firstName},</p>

    <p>You've been with us for a week now! Here's what we've learned from placing hundreds of quality candidates:</p>

    <p><strong>🔥 4 Things That Get You Noticed:</strong></p>

    <div style="margin-bottom: 20px;">
        <p><strong>1. Be specific, not generic</strong><br>
        Instead of "hardworking team player," say "increased team output by 20% through process automation."</p>
    </div>

    <div style="margin-bottom: 20px;">
        <p><strong>2. Show, don't just tell</strong><br>
        Numbers, results, and outcomes speak louder than buzzwords.</p>
    </div>

    <div style="margin-bottom: 20px;">
        <p><strong>3. Stay active</strong><br>
        Log in regularly and check for new opportunities. Consistency matters.</p>
    </div>

    <div style="margin-bottom: 20px;">
        <p><strong>4. Be ready for screening calls</strong><br>
        Our team might reach out — answer promptly and professionally!</p>
    </div>

    <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 30px 0;">
        <p style="margin: 0 0 10px 0; font-weight: bold;">Your activity this week:</p>
        <ul style="margin: 0; padding-left: 20px;">
            <li>Applications sent: <strong>${applicationsCount}</strong></li>
            <li>New job matches: <strong>${newMatchesCount}</strong></li>
        </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
        <a href="https://portal.talentswype.com/jobs?utm_source=email&utm_medium=automation&utm_campaign=seeker_day7&utm_content=explore_opportunities_cta" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Explore More Opportunities</a>
    </div>

    <div style="text-align: center; margin: 30px 0;">
        <a href="https://portal.talentswype.com/talentswypedashboard?utm_source=email&utm_medium=automation&utm_campaign=seeker_day7&utm_content=dashboard_cta" style="background-color: #17a2b8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Go to Dashboard</a>
    </div>

    <p><em>Link: <a href="https://portal.talentswype.com/jobs?utm_source=email&utm_medium=automation&utm_campaign=seeker_day7&utm_content=text_link" style="color: #007bff;">portal.talentswype.com/jobs</a></em></p>

    <p>Keep going — the right opportunity is closer than you think!</p>

    <p>Team TalentSwype</p>

    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">

    <p style="font-size: 12px; color: #777; text-align: center;">
        <em>This email was sent to you because you signed up for TalentSwype. If you'd like to stop receiving these emails, you can <a href="https://portal.talentswype.com/unsubscribe?token=${unsubscribeToken}&utm_source=email&utm_medium=automation&utm_campaign=seeker_day7&utm_content=unsubscribe" style="color: #777;">unsubscribe here</a>.</em><br>
        <em>TalentSwype | Pune, India</em>
    </p>

</body>
</html>
    `;
    return { subject, text, html };
}
