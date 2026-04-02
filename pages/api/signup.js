export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    
    const checkResponse = await fetch(`http://localhost:5000/users?email=${email}`);
    const existingUsers = await checkResponse.json();

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }


    const newUser = {
      id: Date.now(),
      name,
      email,
      password, 
    };

    const createResponse = await fetch("http://localhost:5000/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    if (!createResponse.ok) {
      throw new Error("Failed to create user");
    }

    const createdUser = await createResponse.json();
    
    
    return res.status(201).json({
      message: "User created successfully",
      user: { id: createdUser.id, name: createdUser.name, email: createdUser.email },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
