import request from "supertest";
import { createApp } from "../src/app";

describe("GET /api/v1/health", () => {
  it("deve retornar status ok no formato padrão da API", async () => {
    const app = createApp();
    const response = await request(app).get("/api/v1/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { status: "ok" },
      message: "Atlas Invest API",
      errors: [],
    });
  });
});

describe("POST /api/v1/auth/register", () => {
  it("deve rejeitar cadastro com dados inválidos (Parte 13 - senha forte, aceite de termos)", async () => {
    const app = createApp();
    const response = await request(app).post("/api/v1/auth/register").send({
      nome: "A",
      email: "email-invalido",
      senha: "123",
      aceiteTermos: false,
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
