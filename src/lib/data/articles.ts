import { eq } from "drizzle-orm";
import { redis } from "@/cache";
import db from "@/db/index";
import { articles, usersSync } from "@/db/schema";

export async function getArticles() {
  const cached = await redis.get("articles:all");
  if (cached) {
    console.log("🎯 Get Articles cache hit");
    return cached;
  }
  console.log("Get Articles cache miss");

  const response = await db
    .select({
      title: articles.title,
      id: articles.id,
      createdAt: articles.createdAt,
      content: articles.content,
      author: usersSync.name,
      imageUrl: articles.imageUrl,
    })
    .from(articles)
    .leftJoin(usersSync, eq(articles.authorId, usersSync.id));

  await redis.set("articles:all", response, {
    ex: 60, // seconds
  });

  return response;
}

export async function getArticleById(id: number) {
  const response = await db
    .select({
      title: articles.title,
      id: articles.id,
      createdAt: articles.createdAt,
      content: articles.content,
      author: usersSync.name,
      imageUrl: articles.imageUrl,
    })
    .from(articles)
    .leftJoin(usersSync, eq(articles.authorId, usersSync.id))
    .where(eq(articles.id, id));

  return response[0] ? response[0] : null;
}
