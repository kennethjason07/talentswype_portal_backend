import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "./src/models/user.Model.js";

dotenv.config();

const createAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/slanster";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB at", mongoUri);

    const email = "admin@slanster.com";
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      username: "Admin User",
      email,
      mobileNumber: "1234567890",
      college: "Slanster Admin",
      password: hashedPassword,
      userType: "ADMIN",
    };

    let user = await User.findOne({ email });

    if (user) {
      user.password = hashedPassword;
      user.userType = "ADMIN";
      await user.save();
      console.log("Existing user updated to ADMIN.");
    } else {
      user = await User.create(userData);
      console.log("New ADMIN user created.");
    }

    console.log("\n==================================");
    console.log("CREDENTIALS PUSHED SUCCESSFULLY");
    console.log("----------------------------------");
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Role:     ADMIN`);
    console.log("==================================\n");

  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

createAdmin();
