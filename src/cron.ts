import { insertNewsIntoMongo } from "./db/mongo.ts";
import { deleteNewsFromSupabase, getOldNews } from "./db/supabase.ts";
import { getTwoMonthsAgoDate } from "./utils.ts";

async function transferOldNews() {
	try {
		const twoMonthAgo = getTwoMonthsAgoDate();
		const oldNews = await getOldNews(twoMonthAgo);

		if (oldNews.length > 0) {
			const insertResult = await insertNewsIntoMongo(oldNews);

			if (insertResult) {
				const newsIds = oldNews.map((n: { id: number }) => n.id);
				await deleteNewsFromSupabase(newsIds);
				console.log(`Notícias transferidas e excluídas: ${newsIds.length}`);
			}
		} else {
			console.log("Nenhuma notícia para transferir.");
		}
	} catch (error) {
		console.error("Erro durante a transferência de notícias:", error);
	}
}

Deno.cron("Transferidor de noticias antigas", "0 0 * * 0", () => {
	console.log("Iniciando o cron job de transferência de notícias...");
	transferOldNews()
		.then(() => console.log("Cron job concluído com sucesso."))
		.catch((error) => console.error("Erro no cron job:", error));
});
