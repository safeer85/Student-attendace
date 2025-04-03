# Define the AWS Provider
provider "aws" {
  region = "eu-north-1"  # Change to your preferred AWS region
}

# Create a Security Group for both instances
resource "aws_security_group" "web_sg" {
  name        = "webapp-sg"
  description = "Allow HTTP, HTTPS, and SSH access"

  # Allow SSH access
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow HTTP access (Frontend)
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow HTTPS access (Optional)
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow traffic between frontend and backend
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Launch the Frontend EC2 Instance
resource "aws_instance" "frontend" {
  ami             = "ami-0274f4b62b6ae3bd5"  # Replace with a valid AMI ID
  instance_type   = "t3.micro"
  key_name        = "my-key"  # Change this to your AWS SSH key pair name
  security_groups = [aws_security_group.web_sg.name]

  tags = {
    Name = "Frontend-Instance"
  }
}

# Launch the Backend EC2 Instance
resource "aws_instance" "backend" {
  ami             = "ami-0274f4b62b6ae3bd5"  # Replace with a valid AMI ID
  instance_type   = "t3.micro"
  key_name        = "my-key"  # Change this to your AWS SSH key pair name
  security_groups = [aws_security_group.web_sg.name]

  tags = {
    Name = "Backend-Instance"
  }
}
