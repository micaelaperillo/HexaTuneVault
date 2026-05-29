
## Configure

```bash
cp .env.example .env
```

| Variable | Value |
|---|---|
| `DJANGO_SECRET_KEY` | `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
| `DJANGO_DEBUG` |
| `DJANGO_ALLOWED_HOSTS` | Comma-separated hostnames |
| `API_URL` | Base URL of the NestJS REST API |

## Run locally

```bash
python -m venv .venv
source .venv/Scripts/activate     
pip install -r requirements.txt
python manage.py runserver   
```
