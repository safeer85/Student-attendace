# Define the AWS Provider
provider "aws" {
  region = "eu-north-1"
}

# Create a Security Group
resource "aws_security_group" "web_sg" {
  name        = "webapp-sg"
  description = "Allow HTTP and SSH access"
  
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Launch an EC2 instance
resource "aws_instance" "web" {
  ami           = "ami-0484cf7398475e3ff"  
  instance_type = "t3.micro"
  key_name      = "my-key"  
  security_groups = [aws_security_group.web_sg.name]

  tags = {
    Name = "WebApp-Instance"
  }
}
