import User from "../database/userSchema.js";
import bcrypt from "bcryptjs";
import generateJsonWebTokenandCookie from "../utils/GenerateJwtToken.js";

export const signup = async (req, res) => {
  try {
    const { username, email, password, gender } = req.body;
    const Email = await User.findOne({ email });
    if (Email) {
      return res.status(400).json({ error: "Email already taken" });
    }
    const user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ error: "Username already taken" });
    }

    //Hash Password here
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
    const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      gender,
      profilePic: gender === "male" ? boyProfilePic : girlProfilePic,
    });

    if (newUser) {
      generateJsonWebTokenandCookie(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ error: "wrong user data" });
    }
  } catch (error) {
    console.log("error ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        generateJsonWebTokenandCookie(user._id, res);
        res.status(200).json({
          _id: user._id,
          email: user.email,
          username: user.username,
          profilePic: user.profilePic,
        });
      } else {
        res.status(400).json({ error: "wrong password" });
      }
    } else {
      res.status(400).json({ error: "wrong email" });
    }
  } catch (error) {
    console.log("error ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt","",{maxAge:0})
    res.status(200).json({message:"Logged out successfully"})
  } catch (error) {
    console.log("error in login", error.message);
    res.status(500).json({ error: error.message });
  }
};