from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import logging

from app.config import settings
from app.database import create_indexes
from app.routers import auth, places, reports, stats


logger = logging.getLogger(__name__)
app = FastAPI(title="Nazorat AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup() -> None:
    try:
        await create_indexes()
    except Exception as exc:
        logger.warning("Database indexes were not created during startup: %s", exc)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/", response_class=HTMLResponse)
async def landing() -> str:
    return """
    <!doctype html>
    <html lang="uz">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Nazorat AI</title>
        <style>
          :root {
            color-scheme: dark;
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            background: #0f172a;
            color: #f8fafc;
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            min-height: 100vh;
            background:
              radial-gradient(circle at 18% 18%, rgba(37, 99, 235, 0.35), transparent 32rem),
              radial-gradient(circle at 84% 76%, rgba(147, 51, 234, 0.32), transparent 34rem),
              #0f172a;
          }
          main {
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 32px;
          }
          section {
            width: min(1040px, 100%);
            display: grid;
            gap: 28px;
          }
          .hero {
            display: grid;
            gap: 22px;
            padding: 38px;
            border: 1px solid rgba(255, 255, 255, 0.14);
            border-radius: 24px;
            background: rgba(15, 23, 42, 0.72);
            box-shadow: 0 28px 90px rgba(0, 0, 0, 0.32);
            backdrop-filter: blur(18px);
          }
          .badge {
            width: fit-content;
            padding: 9px 13px;
            border-radius: 999px;
            background: rgba(34, 197, 94, 0.14);
            color: #86efac;
            border: 1px solid rgba(134, 239, 172, 0.28);
            font-weight: 700;
            font-size: 14px;
          }
          h1 {
            margin: 0;
            max-width: 780px;
            font-size: clamp(42px, 8vw, 86px);
            line-height: 0.95;
            letter-spacing: 0;
          }
          p {
            margin: 0;
            max-width: 720px;
            color: #cbd5e1;
            font-size: clamp(17px, 2vw, 22px);
            line-height: 1.65;
          }
          .actions {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }
          a {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 48px;
            padding: 0 18px;
            border-radius: 14px;
            color: #0f172a;
            background: #f8fafc;
            text-decoration: none;
            font-weight: 800;
          }
          a.secondary {
            color: #f8fafc;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.16);
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 14px;
          }
          .item {
            padding: 20px;
            border-radius: 18px;
            border: 1px solid rgba(255, 255, 255, 0.12);
            background: rgba(255, 255, 255, 0.07);
          }
          .item strong {
            display: block;
            margin-bottom: 8px;
            font-size: 18px;
          }
          .item span {
            display: block;
            color: #cbd5e1;
            line-height: 1.5;
          }
          @media (max-width: 720px) {
            main { padding: 18px; }
            .hero { padding: 24px; }
            .grid { grid-template-columns: 1fr; }
          }
        </style>
      </head>
      <body>
        <main>
          <section>
            <div class="hero">
              <div class="badge">Demo ishlayapti</div>
              <h1>Nazorat AI</h1>
              <p>
                Korrupsiyaga qarshi aqlli monitoring platformasi. Fuqarolar murojaat yuboradi,
                tizim esa ularni xarita, risk ballari va admin panel orqali kuzatishga yordam beradi.
              </p>
              <div class="actions">
                <a href="/health">Backend holati</a>
                <a class="secondary" href="/docs">API hujjatlari</a>
              </div>
            </div>
            <div class="grid">
              <div class="item">
                <strong>Anonim murojaat</strong>
                <span>Foydalanuvchilar muammo haqida tez va xavfsiz xabar qoldirishi mumkin.</span>
              </div>
              <div class="item">
                <strong>AI risk tahlili</strong>
                <span>Murojaatlar xavf darajasi bo'yicha saralanadi va admin uchun ko'rsatiladi.</span>
              </div>
              <div class="item">
                <strong>Xarita va admin</strong>
                <span>Hududlar kesimida monitoring, status boshqaruvi va hisobotlar mavjud.</span>
              </div>
            </div>
          </section>
        </main>
      </body>
    </html>
    """


app.include_router(auth.router)
app.include_router(reports.router)
app.include_router(places.router)
app.include_router(stats.router)
