FROM python:3.11.10

WORKDIR /app

COPY requirements.txt ./

RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . .

# CMD ["python", "train_model.py"]  # Change train_model.py to your main model file