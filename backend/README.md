# Nazorat AI Backend

FastAPI + MongoDB backend for the Nazorat AI corruption reporting system.

## Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

MongoDB must be running locally, or set `MONGO_URL` in `.env`.

## Main Endpoints

- `POST /auth/register` - create user and return JWT token
- `POST /auth/login` - login and return JWT token
- `POST /report` - create report using multipart form data
- `POST /reports` - frontend-compatible alias for report creation
- `GET /places` - grouped map locations with complaints count
- `GET /reports` - admin-only report list
- `PATCH /report/{id}` - admin-only report update
- `GET /stats` - today count, most dangerous location, top category

## Report Form Fields

`POST /report` accepts:

- `name`
- `description`
- `category`
- `lat`
- `lng`
- `is_anonymous`
- `evidence` optional file

The current React frontend uses `POST /reports` with `location` instead of `name`; the backend supports that alias.
