FROM python:3.11.10

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt


RUN pip install --upgrade -r /code/requirements.txt
RUN pip install fastapi[standard]


COPY ./app /code/app

EXPOSE  8000

CMD ["fastapi", "run", "app/api.py", "--proxy-headers", "--port", "8000"]