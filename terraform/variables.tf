variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region where Cloud Run services are deployed"
  type        = string
  default     = "us-central1"
}

variable "domain" {
  description = "Custom domain for the load balancer and SSL certificate"
  type        = string
  default     = "partyscout.app"
}

variable "frontend_service_name" {
  description = "Cloud Run frontend service name"
  type        = string
  default     = "partyscout-frontend"
}

variable "backend_service_name" {
  description = "Cloud Run backend service name"
  type        = string
  default     = "partyscout-backend"
}
