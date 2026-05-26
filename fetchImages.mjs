const queries = ["Attack on Titan Season 4", "JUJUTSU KAISEN", "Frieren", "Solo Leveling"];

async function main() {
  for (const q of queries) {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query { Page(perPage:1) { media(search:"${q}", type:ANIME) { title{english romaji} coverImage{large} } } }`
      })
    });
    const j = await res.json();
    console.log(q, ":", j.data.Page.media[0].coverImage.large);
  }
}
main();
