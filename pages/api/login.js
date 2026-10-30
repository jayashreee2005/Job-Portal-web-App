export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password } = req.body;


  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    
    const response = await fetch(`http://localhost:5000/users?email=${email}`);
    const users = await response.json();

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = users[0];

   
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    
    return res.status(200).json({
      message: "Login successful",
      user: { id: user.id, name: user.name, email: user.email },
      token: `token_${user.id}_${Date.now()}`, // Simple token (in production, use JWT)
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
