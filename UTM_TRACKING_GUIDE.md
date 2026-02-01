# 📊 UTM Tracking Implementation Guide

## ✅ Implementation Complete!

All email templates now include UTM tracking parameters for comprehensive analytics.

---

## 🎯 What Was Implemented

### **All 6 Email Templates Updated:**

1. ✅ **Seeker Welcome Email** (`seeker_welcome`)
2. ✅ **Seeker Day 3 Email** (`seeker_day3`)
3. ✅ **Seeker Day 7 Email** (`seeker_day7`)
4. ✅ **HR Welcome Email** (`hr_welcome`)
5. ✅ **HR Day 3 Email** (`hr_day3`)
6. ✅ **HR Day 7 Email** (`hr_day7`)

---

## 📋 UTM Parameter Structure

### **Standard Format:**

```
http://portal.talentswype.com/[page]?utm_source=email&utm_medium=automation&utm_campaign=[campaign_name]&utm_content=[content_identifier]
```

### **Parameter Breakdown:**

| Parameter      | Value                                                                              | Purpose                                   |
| -------------- | ---------------------------------------------------------------------------------- | ----------------------------------------- |
| `utm_source`   | `email`                                                                            | Traffic source (always "email" for these) |
| `utm_medium`   | `automation`                                                                       | Marketing medium (automated emails)       |
| `utm_campaign` | `seeker_welcome`, `seeker_day3`, `seeker_day7`, `hr_welcome`, `hr_day3`, `hr_day7` | Identifies which email sequence           |
| `utm_content`  | `browse_jobs_cta`, `text_link`, `whatsapp_support`, `unsubscribe`, etc.            | Identifies which specific link/button     |

---

## 🔍 Complete UTM Mapping

### **1. Seeker Welcome Email** (`seeker_welcome`)

| Link/Button                               | utm_content        | Full URL                                                                                                                                               |
| ----------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| "Browse Jobs Now" (Button)                | `browse_jobs_cta`  | `http://portal.talentswype.com/jobs?utm_source=email&utm_medium=automation&utm_campaign=seeker_welcome&utm_content=browse_jobs_cta`                    |
| "portal.talentswype.com/jobs" (Text Link) | `text_link`        | `http://portal.talentswype.com/jobs?utm_source=email&utm_medium=automation&utm_campaign=seeker_welcome&utm_content=text_link`                          |
| "Chat with us on WhatsApp"                | `whatsapp_support` | `https://wa.me/919389557198?text=Hi%20I%20need%20help&utm_source=email&utm_medium=automation&utm_campaign=seeker_welcome&utm_content=whatsapp_support` |
| "unsubscribe here"                        | `unsubscribe`      | `http://portal.talentswype.com/unsubscribe?token=XXX&utm_source=email&utm_medium=automation&utm_campaign=seeker_welcome&utm_content=unsubscribe`       |

### **2. Seeker Day 3 Email** (`seeker_day3`)

| Link/Button                                  | utm_content           | Full URL                                                                                                                                      |
| -------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| "Browse All Jobs" (Button)                   | `browse_all_jobs_cta` | `http://portal.talentswype.com/jobs?utm_source=email&utm_medium=automation&utm_campaign=seeker_day3&utm_content=browse_all_jobs_cta`          |
| "portal.talentswype.com/jobs" (Text Link #1) | `text_link`           | `http://portal.talentswype.com/jobs?utm_source=email&utm_medium=automation&utm_campaign=seeker_day3&utm_content=text_link`                    |
| "Apply to Your First Job" (Button)           | `apply_first_job_cta` | `http://portal.talentswype.com/jobs?utm_source=email&utm_medium=automation&utm_campaign=seeker_day3&utm_content=apply_first_job_cta`          |
| "portal.talentswype.com/jobs" (Text Link #2) | `apply_text_link`     | `http://portal.talentswype.com/jobs?utm_source=email&utm_medium=automation&utm_campaign=seeker_day3&utm_content=apply_text_link`              |
| "unsubscribe here"                           | `unsubscribe`         | `http://portal.talentswype.com/unsubscribe?token=XXX&utm_source=email&utm_medium=automation&utm_campaign=seeker_day3&utm_content=unsubscribe` |

### **3. Seeker Day 7 Email** (`seeker_day7`)

| Link/Button                               | utm_content                 | Full URL                                                                                                                                      |
| ----------------------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| "Explore More Opportunities" (Button)     | `explore_opportunities_cta` | `http://portal.talentswype.com/jobs?utm_source=email&utm_medium=automation&utm_campaign=seeker_day7&utm_content=explore_opportunities_cta`    |
| "portal.talentswype.com/jobs" (Text Link) | `text_link`                 | `http://portal.talentswype.com/jobs?utm_source=email&utm_medium=automation&utm_campaign=seeker_day7&utm_content=text_link`                    |
| "unsubscribe here"                        | `unsubscribe`               | `http://portal.talentswype.com/unsubscribe?token=XXX&utm_source=email&utm_medium=automation&utm_campaign=seeker_day7&utm_content=unsubscribe` |

### **4. HR Welcome Email** (`hr_welcome`)

| Link/Button                                   | utm_content    | Full URL                                                                                                                                     |
| --------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| "Post Your First Job" (Button)                | `post_job_cta` | `http://portal.talentswype.com/post-job?utm_source=email&utm_medium=automation&utm_campaign=hr_welcome&utm_content=post_job_cta`             |
| "portal.talentswype.com/post-job" (Text Link) | `text_link`    | `http://portal.talentswype.com/post-job?utm_source=email&utm_medium=automation&utm_campaign=hr_welcome&utm_content=text_link`                |
| "unsubscribe here"                            | `unsubscribe`  | `http://portal.talentswype.com/unsubscribe?token=XXX&utm_source=email&utm_medium=automation&utm_campaign=hr_welcome&utm_content=unsubscribe` |

### **5. HR Day 3 Email** (`hr_day3`)

| Link/Button                                   | utm_content    | Full URL                                                                                                                                  |
| --------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| "Post Your First Job" (Button)                | `post_job_cta` | `http://portal.talentswype.com/post-job?utm_source=email&utm_medium=automation&utm_campaign=hr_day3&utm_content=post_job_cta`             |
| "portal.talentswype.com/post-job" (Text Link) | `text_link`    | `http://portal.talentswype.com/post-job?utm_source=email&utm_medium=automation&utm_campaign=hr_day3&utm_content=text_link`                |
| "unsubscribe here"                            | `unsubscribe`  | `http://portal.talentswype.com/unsubscribe?token=XXX&utm_source=email&utm_medium=automation&utm_campaign=hr_day3&utm_content=unsubscribe` |

### **6. HR Day 7 Email** (`hr_day7`)

| Link/Button                                   | utm_content    | Full URL                                                                                                                                  |
| --------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| "Post Your Job Now" (Button)                  | `post_job_cta` | `http://portal.talentswype.com/post-job?utm_source=email&utm_medium=automation&utm_campaign=hr_day7&utm_content=post_job_cta`             |
| "portal.talentswype.com/post-job" (Text Link) | `text_link`    | `http://portal.talentswype.com/post-job?utm_source=email&utm_medium=automation&utm_campaign=hr_day7&utm_content=text_link`                |
| "unsubscribe here"                            | `unsubscribe`  | `http://portal.talentswype.com/unsubscribe?token=XXX&utm_source=email&utm_medium=automation&utm_campaign=hr_day7&utm_content=unsubscribe` |

---

## 📈 How to View This Data

### **In Google Analytics 4 (GA4):**

1. **Navigate to**: Reports → Acquisition → Traffic acquisition
2. **Add filter**: `Session source / medium` = `email / automation`
3. **Add secondary dimension**: `Session campaign`
4. **View metrics**: Sessions, Conversions, Engagement rate

### **Custom Report Setup:**

```
Dimensions:
- Session campaign (seeker_welcome, seeker_day3, etc.)
- Session content (browse_jobs_cta, text_link, etc.)

Metrics:
- Sessions
- New users
- Conversions (job applications, job posts)
- Engagement rate
- Average engagement time
```

### **Sample GA4 Report:**

| Campaign       | Content             | Sessions | Conversions | Conversion Rate |
| -------------- | ------------------- | -------- | ----------- | --------------- |
| seeker_welcome | browse_jobs_cta     | 450      | 23          | 5.1%            |
| seeker_welcome | text_link           | 120      | 8           | 6.7%            |
| seeker_day3    | apply_first_job_cta | 320      | 67          | **20.9%** ✅    |
| hr_welcome     | post_job_cta        | 95       | 12          | 12.6%           |

---

## 🎯 Key Insights You Can Track

### **Email Performance:**

- Which email drives the most traffic?
- Which email has the highest conversion rate?
- Are Day 3 emails more effective than Day 7?

### **CTA Performance:**

- Do users prefer buttons or text links?
- Which CTA copy works best?
- Are multiple CTAs confusing or helpful?

### **User Behavior:**

- How many users click WhatsApp support?
- What's the unsubscribe rate per email?
- Do seekers browse jobs or apply directly?

### **Optimization Opportunities:**

- Low click rate → Improve email copy or CTA placement
- High unsubscribe rate → Email content not valuable
- High click but low conversion → Landing page issue

---

## 📊 Example Analysis Scenarios

### **Scenario 1: Comparing Email Effectiveness**

**Question**: Which seeker email drives the most job applications?

**GA4 Query**:

```
Filter: utm_campaign contains "seeker"
Conversion event: "job_application"
Group by: utm_campaign
```

**Expected Result**:

```
seeker_welcome: 23 applications
seeker_day3: 67 applications ← WINNER
seeker_day7: 15 applications
```

**Action**: Day 3 is your best performer! Consider:

- Sending it earlier (Day 2?)
- Using similar messaging in other emails
- A/B testing different subject lines

---

### **Scenario 2: Button vs Text Link**

**Question**: Do users click buttons or text links more?

**GA4 Query**:

```
Filter: utm_campaign = "seeker_welcome"
Group by: utm_content
Metric: Click-through rate
```

**Expected Result**:

```
browse_jobs_cta (button): 450 clicks, 8.2% CTR ← WINNER
text_link: 120 clicks, 2.1% CTR
```

**Action**: Buttons perform better! Make them bigger and more prominent.

---

### **Scenario 3: Support Load**

**Question**: How many users need help immediately after signup?

**GA4 Query**:

```
Filter: utm_content = "whatsapp_support"
Group by: utm_campaign
```

**Expected Result**:

```
seeker_welcome: 68 clicks (15% of recipients)
hr_welcome: 14 clicks (12% of recipients)
```

**Action**: High support demand! Consider:

- Adding an FAQ section to welcome email
- Creating onboarding video
- Implementing chatbot

---

## 🔧 Technical Implementation

### **Files Modified:**

- ✅ `src/services/email/candidateTemplates.js` (3 templates)
- ✅ `src/services/email/hrTemplates.js` (3 templates)

### **Total Links Tracked:**

- **Seeker Emails**: 11 unique links
- **HR Emails**: 9 unique links
- **Total**: 20 tracked links across 6 emails

### **No Backend Changes Required:**

UTM parameters are query strings that don't affect routing. Your existing pages will work perfectly.

---

## 🧪 Testing Checklist

### **Manual Testing:**

- [ ] Register new seeker account
- [ ] Check welcome email → Click "Browse Jobs" button
- [ ] Verify URL contains: `?utm_source=email&utm_medium=automation&utm_campaign=seeker_welcome&utm_content=browse_jobs_cta`
- [ ] Check Google Analytics → See session appear
- [ ] Repeat for all 6 emails

### **Automated Testing:**

```javascript
// Add to your email template tests
test("Welcome email includes UTM tracking", () => {
  const result = welcomeEmailTemplate("John", "token123");
  expect(result.html).toContain("utm_source=email");
  expect(result.html).toContain("utm_medium=automation");
  expect(result.html).toContain("utm_campaign=seeker_welcome");
});
```

---

## 📱 Google Analytics Setup

### **Step 1: Verify GA4 is Installed**

Ensure your frontend has GA4 tracking code:

```javascript
// In your Next.js app
<Script src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" />
```

### **Step 2: Set Up Conversion Events**

Define key events in GA4:

- `job_application` - When user applies to a job
- `job_post` - When HR posts a job
- `profile_complete` - When user completes profile

### **Step 3: Create Custom Reports**

1. Go to GA4 → Explore
2. Create new exploration
3. Add dimensions: Campaign, Content
4. Add metrics: Sessions, Conversions
5. Save as "Email Campaign Performance"

---

## 🎨 UTM Best Practices (Already Implemented)

✅ **Consistent Naming**: All campaigns use lowercase with underscores  
✅ **Descriptive Content IDs**: `browse_jobs_cta` vs generic `button1`  
✅ **Source/Medium Consistency**: Always `email/automation`  
✅ **Unsubscribe Tracking**: Even unsubscribe links are tracked  
✅ **Multiple CTAs Differentiated**: `browse_jobs_cta` vs `text_link`

---

## 📊 Expected Data After 30 Days

### **Sample Dashboard:**

```
📧 Email Campaign Performance (Last 30 Days)

Total Email Clicks: 2,450
Total Conversions: 156
Overall Conversion Rate: 6.4%

Top Performing Campaigns:
1. seeker_day3 - 20.9% conversion rate ⭐
2. hr_day3 - 12.6% conversion rate
3. seeker_welcome - 5.1% conversion rate

Top Performing CTAs:
1. apply_first_job_cta - 320 clicks, 67 conversions
2. browse_jobs_cta - 450 clicks, 23 conversions
3. post_job_cta - 210 clicks, 20 conversions

Support Requests:
- WhatsApp clicks: 82 (3.3% of all clicks)
- Unsubscribes: 18 (0.7% of all clicks)
```

---

## 🚀 Next Steps

### **Immediate:**

1. Deploy updated email templates
2. Verify UTM parameters appear in GA4
3. Set up custom reports

### **Week 1:**

1. Monitor data collection
2. Verify all campaigns are tracking
3. Check for any broken links

### **Week 2-4:**

1. Analyze which emails perform best
2. Identify optimization opportunities
3. Plan A/B tests based on data

### **Ongoing:**

1. Monthly performance reviews
2. Optimize low-performing emails
3. Test new CTAs and copy

---

## 🎯 Success Metrics

Track these KPIs monthly:

| Metric            | Target           | Current |
| ----------------- | ---------------- | ------- |
| Email Click Rate  | > 15%            | TBD     |
| Conversion Rate   | > 8%             | TBD     |
| Unsubscribe Rate  | < 2%             | TBD     |
| Support Requests  | < 5%             | TBD     |
| Day 3 Performance | > 15% conversion | TBD     |

---

## 📝 Notes

- UTM parameters are case-sensitive (we use lowercase)
- Parameters are automatically URL-encoded
- GA4 may take 24-48 hours to show data
- Historical data won't have UTM tracking (only new emails)
- Unsubscribe tokens are preserved in UTM links

---

**Last Updated**: January 31, 2026  
**Status**: ✅ Fully Implemented  
**Total Links Tracked**: 20 across 6 email templates
