import { put } from '@vercel/blob';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito' });
  }

  const { filename, content } = req.body;

  try {
    const blob = await put(filename, content, { access: 'public' });
    res.status(200).json({ url: blob.url });
  } catch (error) {
    res.status(500).json({ error: 'Errore nell\'upload' });
  }
}
