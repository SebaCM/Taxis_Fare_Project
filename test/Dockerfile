FROM python:3.11.10

WORKDIR /app

COPY requirements.txt ./

RUN pip install --upgrade pip && pip install -r requirements.txt

COPY ./ ./

CMD ["python", "test.py"]





