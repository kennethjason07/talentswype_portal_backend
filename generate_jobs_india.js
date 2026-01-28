import mongoose from "mongoose";
import dotenv from "dotenv";
import Job from "./src/models/job.Model.js";
import User from "./src/models/user.Model.js";

dotenv.config();

const indianCities = [
    "Bangalore", "Pune", "Mumbai", "Hyderabad", "Chennai", 
    "Gurgaon", "Noida", "Kolkata", "Ahmedabad", "Jaipur", "Indore"
];

const indianCompanies = [
    { name: "TCS", industry: "IT Services", url: "https://www.tcs.com", logo: "https://www.tcs.com/content/dam/tcs/images/vendor-logos/tcs-logo-1.png" },
    { name: "Infosys", industry: "Consulting & IT", url: "https://www.infosys.com", logo: "https://www.infosys.com/content/dam/infosys-web/en/global-resource/media-resources/infosys-logo-png.png" },
    { name: "Wipro", industry: "IT Services", url: "https://www.wipro.com", logo: "https://www.wipro.com/content/dam/nexus/en/brand/images/wipro-logo.png" },
    { name: "HCLTech", industry: "IT Services", url: "https://www.hcltech.com", logo: "https://www.hcltech.com/themes/custom/hcltech/logo.svg" },
    { name: "Zoho", industry: "Software Product", url: "https://www.zoho.com", logo: "https://www.zohowebstatic.com/sites/zwebshat/images/zoho-logo.svg" },
    { name: "Freshworks", industry: "SaaS", url: "https://www.freshworks.com", logo: "https://www.freshworks.com/assets/images/common/fw-logo.svg" },
    { name: "Zomato", industry: "E-commerce", url: "https://www.zomato.com", logo: "https://b.zmtcdn.com/web_assets/b40b97e677bc7b2ca77c58c61db266fe1603954211.png" },
    { name: "Swiggy", industry: "Food Tech", url: "https://www.swiggy.com", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/1/12/Swiggy_logo.svg/1200px-Swiggy_logo.svg.png" },
    { name: "Razorpay", industry: "Fintech", url: "https://www.razorpay.com", logo: "https://razorpay.com/assets/razorpay-logo.svg" },
    { name: "Paytm", industry: "Fintech", url: "https://www.paytm.com", logo: "https://assetscdn1.paytm.com/images/catalog/view/310944/1654513695287.png" },
    { name: "PhonePe", industry: "Fintech", url: "https://www.phonepe.com", logo: "https://www.phonepe.com/assets/images/logo.svg" },
    { name: "Jio Platforms", industry: "Telecom & Digital", url: "https://www.jio.com", logo: "https://www.jio.com/assets/jio-logo.svg" },
    { name: "Tech Mahindra", industry: "IT Services", url: "https://www.techmahindra.com", logo: "https://www.techmahindra.com/themes/custom/techm/logo.svg" },
    { name: "LTIMindtree", industry: "IT Services", url: "https://www.ltimindtree.com", logo: "https://www.ltimindtree.com/wp-content/themes/ltimindtree/assets/images/logo.svg" }
];

const jobTemplates = {
    java: {
        positions: ["Java Developer", "Backend Engineer (Java)", "Senior Java Developer", "Java Microservices Developer", "Spring Boot Developer"],
        skills: ["Java", "Spring Boot", "Microservices", "REST API", "Hibernate", "MySQL", "AWS"],
        description: "We are looking for a highly skilled Java Developer to join our backend team. You will be responsible for building robust, scalable server-side applications, optimizing performance, and integrating with third-party services."
    },
    react: {
        positions: ["React Developer", "Frontend Engineer", "React.js Developer", "UI Developer", "Senior Frontend Engineer (React)"],
        skills: ["React.js", "JavaScript", "TypeScript", "Redux", "Tailwind CSS", "Next.js", "HTML5", "CSS3"],
        description: "As a React Developer, you will be crafting interactive user interfaces, collaborating with designers, and ensuring seamless web experiences. Knowledge of modern frontend toolchains and state management is essential."
    },
    seo: {
        positions: ["SEO Specialist", "Search Engine Optimizer", "Content Marketing & SEO", "SEO Analyst", "Digital Marketing Executive (SEO)"],
        skills: ["SEO", "Google Analytics", "SEM", "Keyword Research", "On-page optimization", "Off-page SEO", "Content Strategy"],
        description: "We need an SEO expert to improve our search rankings and drive organic traffic. You will conduct keyword research, monitor site performance, and implement technical SEO best practices."
    },
    it_general: {
        positions: ["DevOps Engineer", "Cloud Engineer (AWS/Azure)", "SRE Executive", "Linux Systems Administrator", "Infrastructure Engineer", "Full Stack Developer", "Software Test Engineer"],
        skills: ["Docker", "Kubernetes", "CI/CD", "AWS", "Python", "Node.js", "Shell Scripting", "Azure"],
        description: "Join our IT infrastructure team to manage cloud ecosystems, automate deployments, and ensure system reliability. This role requires versatility and a deep understanding of modern IT operations."
    }
};

const generateRandomExperience = () => {
    const isFresher = Math.random() < 0.3; // 30% chance of being a fresher
    const from = isFresher ? 0 : Math.floor(Math.random() * 5);
    const to = from + Math.floor(Math.random() * 5) + 1;
    return { isFresher, from, to };
};

const generateRandomSalary = (type) => {
    let base = 4; // 4 LPA
    if (type === "java" || type === "react") base = 6;
    if (type === "it_general") base = 5;

    const from = (Math.floor(Math.random() * 10) + base) * 100000;
    const to = from + (Math.floor(Math.random() * 10) + 2) * 100000;
    return { from, to };
};

const generateJobs = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) throw new Error("MONGO_URI not found");

        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB for job generation.");

        // Find an admin user to assign as approvedBy/publishBy
        const adminUser = await User.findOne({ userType: "ADMIN" });
        if (!adminUser) {
            console.warn("No ADMIN user found. Jobs will not have approvedBy/publishBy fields set.");
        }

        const jobsToCreate = [];
        const counts = { java: 40, react: 40, seo: 30, it_general: 40 };

        for (const [type, count] of Object.entries(counts)) {
            for (let i = 0; i < count; i++) {
                const template = jobTemplates[type];
                const company = indianCompanies[Math.floor(Math.random() * indianCompanies.length)];
                const city = indianCities[Math.floor(Math.random() * indianCities.length)];
                const position = template.positions[Math.floor(Math.random() * template.positions.length)];
                const experience = generateRandomExperience();
                const salary = generateRandomSalary(type);

                jobsToCreate.push({
                    jobType: "inhouse",
                    position: `${position} - ${i + 1}`,
                    employment_type: i % 5 === 0 ? "Contract" : "Full-time",
                    key_skills: template.skills.sort(() => 0.5 - Math.random()).slice(0, 4),
                    company: company.name,
                    role_category: type.toUpperCase(),
                    work_mode: i % 3 === 0 ? "Remote" : i % 3 === 1 ? "Hybrid" : "On-site",
                    location: city,
                    work_experience: experience,
                    annual_salary_range: salary,
                    company_industry: company.industry,
                    educational_qualification: ["B.Tech", "BE", "MCA", "B.Sc (CS)"].sort(() => 0.5 - Math.random()).slice(0, 2),
                    interview_mode: i % 2 === 0 ? "Virtual" : "Face to Face",
                    job_description: template.description,
                    about_company: `Leading enterprise in ${company.industry} with a strong presence in India and global markets. We focus on innovation and employee growth.`,
                    company_website_link: company.url,
                    company_address: `${city}, India`,
                    logoUrl: company.logo,
                    publishStatus: "active",
                    isApproved: true,
                    approvedBy: adminUser?._id,
                    publishBy: adminUser?._id,
                    publishDate: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000) // Randomly published in last 10 days
                });
            }
        }

        // Batch insert
        await Job.insertMany(jobsToCreate);
        console.log(`Successfully created ${jobsToCreate.length} jobs.`);

    } catch (error) {
        console.error("Error generating jobs:", error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

generateJobs();
