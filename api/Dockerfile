FROM python:3.11 AS build

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt

RUN pip install --upgrade --use-pep517 -r /code/requirements.txt
RUN pip install fastapi[standard]

COPY ./app /code/app

EXPOSE 8000

FROM python:3.11

WORKDIR /app

COPY --from=build /code /app

COPY . .

CMD ["uvicorn", "app.api:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers"]