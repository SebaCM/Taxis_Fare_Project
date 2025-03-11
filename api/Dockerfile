# api/Dockerfile
FROM python:3.11.10

# Set the working directory
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the API source code
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Command to run the API
CMD ["python", "app.py"]  # Change app.py to your main API file