


app.post('/auth/google', async (req, res) => {
  const { token } = req.body;

  try {
      const ticket = await client.verifyIdToken({
          idToken: token,
          audience: 'YOUR_GOOGLE_CLIENT_ID',
      });
      const payload = ticket.getPayload();
      const userId = payload['sub']; // User's Google ID

      // Handle user creation or login here

      res.status(200).json({
          success: true,
          message: 'User authenticated',
          userId,
      });
  } catch (error) {
      console.error('Error verifying token:', error);
      res.status(401).json({ success: false, message: 'Invalid token' });
  }
});
