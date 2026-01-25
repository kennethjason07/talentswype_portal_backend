import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "./src/models/user.Model.js";

dotenv.config();

const createUsers = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/slanster";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB at", mongoUri);

    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);

    const usersToCreate = [
      {
        username: "HR User",
        email: "hr@slanster.com",
        mobileNumber: "9876543210",
        college: "Slanster HR Dept",
        password: hashedPassword,
        userType: "HR",
      },
      {
        username: "Standard User",
        email: "user@slanster.com",
        mobileNumber: "5555555555",
        college: "Slanster University",
        password: hashedPassword,
        userType: "USER",
      },
    ];

    for (const userData of usersToCreate) {
      let user = await User.findOne({ email: userData.email });

      if (user) {
        user.password = hashedPassword;
        user.userType = userData.userType;
        await user.save();
        console.log(`Updated Existing User: ${userData.email} (${userData.userType})`);
      } else {
        user = await User.create(userData);
        console.log(`Created New User: ${userData.email} (${userData.userType})`);
      }
    }

    console.log("\n==================================");
    console.log("ADDITIONAL USERS CREATED SUCCESSFULLY");
    console.log("----------------------------------");
    usersToCreate.forEach(u => {
        console.log(`Role: ${u.userType.padEnd(5)} | Email: ${u.email.padEnd(20)} | Password: ${password}`);
    });
    console.log("==================================\n");

  } catch (error) {
    console.error("Error creating users:", error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

createUsers();
