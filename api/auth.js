export default function handler(req, res) {
  if (req.method === 'POST') {
    // your auth logic
    res.status(200).json({ success: true })
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}