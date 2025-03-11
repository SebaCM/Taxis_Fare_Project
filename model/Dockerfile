# model/Dockerfile
FROM python:3.11.10

# Set the working directory
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the model code
COPY . .

# Command to run the model (if applicable)
CMD ["python", "train_model.py"]  # Change train_model.py to your main model file