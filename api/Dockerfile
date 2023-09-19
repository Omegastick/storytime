FROM python:3.10-slim-buster

# Git LFS clone https://huggingface.co/coqui/XTTS-v1
# Install Git LFS
RUN apt-get update && apt-get install -y git-lfs && rm -rf /var/lib/apt/lists/*
RUN git clone https://huggingface.co/coqui/XTTS-v1 /xtts

COPY . /app

WORKDIR /app

RUN --mount=type=cache,target=/root/.cache/pip pip install -e .

CMD ["litestar", "run", "--reload", "--host", "0.0.0.0", "--port", "8000"]