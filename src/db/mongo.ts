//import { MongoClient } from "https://deno.land/x/mongo@v0.33.0/mod.ts";
import { MongoClient } from "npm:mongodb";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
import type { INews } from "./supabase.ts";

// Função para obter conexão com o MongoDB
async function getMongoClient() {
	const env = await load();

	const db_user = env.MONGO_DB_USER || Deno.env.get("MONGO_DB_USER");
	const db_password =
		env.MONGO_DB_PASSWORD || Deno.env.get("MONGO_DB_PASSWORD");

	if (!db_user) {
		console.error("MONGO_DB_USER não configurada.");
		Deno.exit(1);
	}
	if (!db_password) {
		console.error("MONGO_DB_PASSWORD não configurada.");
		Deno.exit(1);
	}

	const encodedPassword = encodeURIComponent(db_password);
	const mongoUrl = `mongodb+srv://${db_user}:${encodedPassword}@old-news.5amq1.mongodb.net/?retryWrites=true&w=majority&appName=old-news`;

	const mongoClient = new MongoClient(mongoUrl);

	try {
		await mongoClient.connect();
		console.log("Conectado ao MongoDB Atlas com sucesso!");
		return mongoClient;
	} catch (error) {
		console.error("Erro ao conectar no MongoDB Atlas:", error.message);
		throw new Error("Falha na conexão com o MongoDB.");
	}
}

// Função para inserir notícias no MongoDB
export async function insertNewsIntoMongo(news: INews[]) {
	try {
		const client = await getMongoClient(); // Conexão somente quando necessário
		const db = client.db("newsDatabase");
		const newsCollection = db.collection("news");

		const insertResult = await newsCollection.insertMany(news);
		return insertResult; // Retorna o resultado da inserção
	} catch (error) {
		throw new Error(`Erro ao inserir notícias no MongoDB: ${error.message}`);
	}
}
