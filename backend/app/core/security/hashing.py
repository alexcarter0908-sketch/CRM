from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _truncate_to_bcrypt_limit(password: str) -> bytes:
    return password.encode("utf-8")[:72]


def hash_password(password: str) -> str:
    return pwd_context.hash(_truncate_to_bcrypt_limit(password))


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(_truncate_to_bcrypt_limit(plain_password), hashed_password)
