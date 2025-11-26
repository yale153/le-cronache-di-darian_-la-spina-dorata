export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Metodo non consentito' });
  }

  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'URL mancante' });
  }

  try {
    const response = await fetch(url as string);
    if (!response.ok) {
      return res.status(404).json({ error: 'File non trovato' });
    }
    const content = await response.text();
    res.status(200).json({ content });
  } catch (error) {
    res.status(500).json({ error: 'Errore nel caricamento' });
  }
}
