output "load_balancer_ip" {
  description = "Static IP of the load balancer — create an A record pointing partyscout.app to this IP"
  value       = google_compute_global_address.main.address
}

output "frontend_url" {
  description = "Frontend URL"
  value       = "https://${var.domain}"
}

output "backend_url" {
  description = "Backend API URL (routed via load balancer)"
  value       = "https://${var.domain}/api"
}

output "ssl_certificate_status" {
  description = "SSL certificate provisioning status (ACTIVE once DNS is pointing to the LB IP)"
  value       = google_compute_managed_ssl_certificate.main.managed[0].status
}
