import argparse
import asyncio
import sys
from pathlib import Path

from pymongo.errors import DuplicateKeyError

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.database import create_indexes, users_collection
from app.security import hash_password


async def create_admin(email: str, password: str) -> None:
    await create_indexes()

    admin_doc = {
        "email": email.lower(),
        "password": hash_password(password),
        "is_admin": True,
    }

    try:
        await users_collection.insert_one(admin_doc)
        print(f"Admin user created: {email}")
    except DuplicateKeyError:
        await users_collection.update_one(
            {"email": email.lower()},
            {"$set": {"password": hash_password(password), "is_admin": True}},
        )
        print(f"Admin user updated: {email}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Create or update a Nazorat AI admin user.")
    parser.add_argument("--email", required=True)
    parser.add_argument("--password", required=True)
    args = parser.parse_args()

    asyncio.run(create_admin(args.email, args.password))


if __name__ == "__main__":
    main()
