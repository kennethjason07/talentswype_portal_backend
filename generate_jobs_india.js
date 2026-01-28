import mongoose from "mongoose";
import dotenv from "dotenv";
import Job from "./src/models/job.Model.js";
import User from "./src/models/user.Model.js";

dotenv.config();

/* ------------------ Cities ------------------ */

const indianCities = [
    "Bangalore", "Pune", "Mumbai", "Hyderabad", "Chennai",
    "Gurgaon", "Noida", "Kolkata", "Ahmedabad", "Jaipur",
    "Indore", "Coimbatore", "Kochi", "Trivandrum", "Nagpur"
];

/* ------------------ Startup / Mid Size Companies ------------------ */

const indianCompanies = [
    { name: "CloudVibe Solutions", industry: "SaaS", domain: "cloudvibe.com" },
    { name: "NextGen Labs", industry: "AI & Data", domain: "nextgenlabs.ai" },
    { name: "EduSpark Technologies", industry: "EdTech", domain: "eduspark.in" },
    { name: "FinRoot Systems", industry: "Fintech", domain: "finroot.in" },
    { name: "GreenByte Innovations", industry: "Clean Tech", domain: "greenbyte.io" },
    { name: "HealthSync Solutions", industry: "HealthTech", domain: "healthsync.in" },
    { name: "CodeNest Software", industry: "IT Services", domain: "codenest.io" },
    { name: "RetailIQ Tech", industry: "Retail Tech", domain: "retailiq.ai" },
    { name: "FleetStack Logistics", industry: "Logistics Tech", domain: "fleetstack.in" },
    { name: "PayWave Digital", industry: "Payments", domain: "paywave.in" },
    { name: "AgroLink Systems", industry: "AgriTech", domain: "agrolink.in" },
    { name: "BuildSoft Technologies", industry: "Enterprise Software", domain: "buildsoft.tech" },
    { name: "InnovaWare Labs", industry: "Product Engineering", domain: "innovaware.io" },
    { name: "BrightEdge Solutions", industry: "Marketing Tech", domain: "brightedge.io" }
];

/* ------------------ Job Templates ------------------ */

const jobTemplates = {
    java: {
        positions: [
            "Java Developer",
            "Backend Engineer (Java)",
            "Senior Java Developer",
            "Java Microservices Developer",
            "Spring Boot Developer"
        ],
        skills: ["Java", "Spring Boot", "Microservices", "REST API", "Hibernate", "MySQL", "AWS"],
        description:
            "We are looking for a skilled Java Developer to build scalable backend services and APIs. You will collaborate with cross-functional teams and improve system performance."
    },

    react: {
        positions: [
            "React Developer",
            "Frontend Engineer",
            "React.js Developer",
            "UI Developer",
            "Senior Frontend Engineer (React)"
        ],
        skills: ["React.js", "JavaScript", "TypeScript", "Redux", "Tailwind CSS", "Next.js", "HTML5", "CSS3"],
        description:
            "As a React Developer, you will design modern user interfaces and deliver high-quality frontend solutions with optimal performance."
    },

    seo: {
        positions: [
            "SEO Specialist",
            "SEO Analyst",
            "Digital Marketing Executive",
            "Content Marketing & SEO",
            "Search Engine Optimizer"
        ],
        skills: [
            "SEO",
            "Google Analytics",
            "Keyword Research",
            "On-page SEO",
            "Off-page SEO",
            "Content Strategy"
        ],
        description:
            "We are hiring an SEO professional to boost organic traffic, improve rankings, and optimize digital presence using modern SEO techniques."
    },

    it_general: {
        positions: [
            "DevOps Engineer",
            "Cloud Engineer",
            "Linux Administrator",
            "Infrastructure Engineer",
            "Full Stack Developer",
            "Software Test Engineer"
        ],
        skills: [
            "Docker",
            "Kubernetes",
            "CI/CD",
            "AWS",
            "Python",
            "Node.js",
            "Shell Scripting",
            "Azure"
        ],
        description:
            "Join our IT team to manage infrastructure, automate deployments, and maintain system reliability across cloud platforms."
    }
};

/* ------------------ Helpers ------------------ */

// Stable logo provider
const generateLogoUrl = (domain) => {
    return `https://logo.clearbit.com/${domain}`;
};

// Experience generator
const generateRandomExperience = () => {
    const isFresher = Math.random() < 0.3; // 30% freshers
    const from = isFresher ? 0 : Math.floor(Math.random() * 4) + 1;
    const to = from + Math.floor(Math.random() * 4) + 1;
    return { isFresher, from, to };
};

// Salary generator
const generateRandomSalary = (type) => {
    let base = 4;

    if (type === "java" || type === "react") base = 6;
    if (type === "it_general") base = 5;

    const from = (Math.floor(Math.random() * 8) + base) * 100000;
    const to = from + (Math.floor(Math.random() * 6) + 2) * 100000;

    return { from, to };
};

/* ------------------ Main Generator ------------------ */

const generateJobs = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) throw new Error("MONGO_URI not found in env");

        await mongoose.connect(mongoUri);
        console.log("✅ MongoDB connected");

        // Admin user
        const adminUser = await User.findOne({ userType: "ADMIN" });

        if (!adminUser) {
            console.warn("⚠ ADMIN user not found — approval fields will be empty");
        }

        const jobsToCreate = [];

        const counts = {
            java: 40,
            react: 40,
            seo: 30,
            it_general: 40
        };

        for (const [type, count] of Object.entries(counts)) {
            for (let i = 0; i < count; i++) {

                const template = jobTemplates[type];
                const company = indianCompanies[Math.floor(Math.random() * indianCompanies.length)];
                const city = indianCities[Math.floor(Math.random() * indianCities.length)];

                const position =
                    template.positions[Math.floor(Math.random() * template.positions.length)];

                const experience = generateRandomExperience();
                const salary = generateRandomSalary(type);

                jobsToCreate.push({
                    jobType: "inhouse",

                    position: `${position}`,

                    employment_type: i % 5 === 0 ? "Contract" : "Full-time",

                    key_skills: [...template.skills]
                        .sort(() => 0.5 - Math.random())
                        .slice(0, 4),

                    company: company.name,

                    role_category: type.toUpperCase(),

                    work_mode:
                        i % 3 === 0
                            ? "Remote"
                            : i % 3 === 1
                            ? "Hybrid"
                            : "On-site",

                    location: city,

                    work_experience: experience,

                    annual_salary_range: salary,

                    company_industry: company.industry,

                    educational_qualification: ["B.Tech", "BE", "MCA", "B.Sc CS"]
                        .sort(() => 0.5 - Math.random())
                        .slice(0, 2),

                    interview_mode: i % 2 === 0 ? "Virtual" : "Face to Face",

                    job_description: template.description,

                    about_company: `We are a fast-growing ${company.industry} company focused on innovation, scalable technology, and building impactful digital products.`,

                    company_website_link: `https://${company.domain}`,

                    company_address: `${city}, India`,

                    logoUrl: generateLogoUrl(company.domain),

                    publishStatus: "active",

                    isApproved: true,

                    approvedBy: adminUser?._id,

                    publishBy: adminUser?._id,

                    publishDate: new Date(
                        Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000
                    )
                });
            }
        }

        await Job.insertMany(jobsToCreate);

        console.log(`🚀 Successfully inserted ${jobsToCreate.length} jobs`);

    } catch (error) {
        console.error("❌ Job generation failed:", error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

generateJobs();
