import Parser from 'rss-parser';
const parser = new Parser({ requestOptions: { rejectUnauthorized: false } });

Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/favicon.ico") return new Response(null, { status: 204 });

    if (url.pathname === "/api/news") {
      const feeds = ['https://winfuture.de/rss/news.rss', 'https://www.heise.de/rss/heise-atom.xml'];
      let allItems: any[] = [];
      for (const f of feeds) {
        try { 
          const feed = await parser.parseURL(f); 
          allItems.push(...feed.items.map(i => {
            let img = (i as any).enclosure?.url || i.content?.match(/src="([^"]+)"/)?.[1] || "";
            if (!img || img.includes('golem')) img = `https://picsum.photos/400/200?random=${Math.random()}`;
            return { title: i.title, link: i.link, pubDate: i.pubDate, source: feed.title, img };
          })); 
        } catch(e) {}
      }
      return new Response(JSON.stringify(allItems.sort((a:any, b:any) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()).slice(0, 9)), { 
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
      });
    }
    return new Response(url.pathname === "/" ? Bun.file("./index.html") : Bun.file("./" + url.pathname.slice(1)));
  }
});
console.log("Server laeuft auf http://127.0.0.1:3000");
