import { XMLParser } from "fast-xml-parser";

async function fetchNews() {
  try {
    const response = await fetch("https://www.mobiflip.de/feed/");
    const xml = await response.text();
    
    const parser = new XMLParser();
    let jsonObj = parser.parse(xml);
    
    // Mobiflip RSS Struktur extrahieren
    const items = jsonObj.rss.channel.item.map((item: any) => ({
      title: item.title,
      link: item.link,
      img: item["media:content"]?.["@_url"] || "https://via.placeholder.com/300x160",
      source: "Mobiflip"
    })).slice(0, 9); // Wir nehmen die aktuellsten 9 für dein 3x3 Grid

    await Bun.write("data/news.json", JSON.stringify(items));
    console.log("News erfolgreich verarbeitet und gespeichert!");
  } catch (err) {
    console.error("Fehler:", err);
  }
}

fetchNews();
