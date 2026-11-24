"use server";

import fs from "node:fs/promises";
import { nanoid } from "nanoid";
import { drawingFromJSON } from "@/src/Drawing";
import '@/src/Rectangle';

export async function POST(r: Request) {
  try {
    const rawDrawing = await r.json();
    const drawing = drawingFromJSON(rawDrawing);
    try {
      const id = nanoid();
      await fs.writeFile(`data/${id}.json`, JSON.stringify(drawing), "utf-8");
      return new Response(`{"id":"${id}"}`, {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("POST", error);
      return new Response("server error", {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      });
    }
  } catch (error) {
    console.error('client', error);
    return new Response("bad JSON for drawing", {
      status: 400,
      headers: { "Content-Type": "text/plain" },
    });
  }
}