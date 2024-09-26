import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
const env = await load();

const supabaseUrl = env.SUPABASE_URL || Deno.env.get("SUPABASE_URL");
const supabaseKey = env.SUPABASE_KEY || Deno.env.get("SUPABASE_KEY");

if (!supabaseUrl) {
	console.error("supabaseUrl não configurada.");
	Deno.exit(1);
}
if (!supabaseKey) {
	console.error("supabaseKey não configurada.");
	Deno.exit(1);
}

export interface INews {
	id: number;
	title: string;
	content: string;
	author: string;
	tags: string[];
	cover_image_url: string;
	friendly_url: string;
	created_at: string;
	updated_at: string;
	category: string;
	small_cover_image_url: string;
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Função para buscar notícias mais antigas que um mês
export async function getOldNews(oneMonthAgo: string) {
	try {
		const { data: news, error } = await supabase
			.from("news")
			.select("*")
			.lt("created_at", oneMonthAgo);

		if (error)
			throw new Error(`Erro ao buscar notícias do Supabase: ${error.message}`);
		return news;
	} catch (error) {
		throw new Error(error.message);
	}
}

// Função para deletar notícias do Supabase com base nos IDs
// Função para excluir manualmente as relações de auto_share e depois as notícias
export async function deleteNewsFromSupabase(newsIds: Array<number>) {
	try {
		// Primeiro, exclua os registros relacionados na tabela auto_share
		const { error: autoShareError } = await supabase
			.from("auto_share")
			.delete()
			.in("news_id", newsIds);

		if (autoShareError) {
			throw new Error(
				`Erro ao excluir registros da tabela auto_share: ${autoShareError.message}`,
			);
		}

		// Agora, exclua as notícias da tabela news
		const { error: newsError } = await supabase
			.from("news")
			.delete()
			.in("id", newsIds);

		if (newsError) {
			throw new Error(`Erro ao excluir notícias: ${newsError.message}`);
		}

		return { success: true, message: "Notícias excluídas com sucesso!" };
	} catch (error) {
		console.error("Erro ao excluir notícias:", error.message);
		throw error;
	}
}
