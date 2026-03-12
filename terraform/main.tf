terraform {
  required_version = ">= 1.5"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }

  # Remote state in GCS — keeps state safe and shareable
  backend "gcs" {
    bucket = "partyscout-terraform-state"
    prefix = "load-balancer"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# ─────────────────────────────────────────────
# Enable required APIs
# ─────────────────────────────────────────────
resource "google_project_service" "compute" {
  service            = "compute.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "certificatemanager" {
  service            = "certificatemanager.googleapis.com"
  disable_on_destroy = false
}

# ─────────────────────────────────────────────
# Static global IP
# ─────────────────────────────────────────────
resource "google_compute_global_address" "main" {
  name = "partyscout-ip"
  depends_on = [google_project_service.compute]
}

# ─────────────────────────────────────────────
# Google-managed SSL certificate
# ─────────────────────────────────────────────
resource "google_compute_managed_ssl_certificate" "main" {
  name = "partyscout-ssl-cert"

  managed {
    domains = [var.domain]
  }

  depends_on = [google_project_service.certificatemanager]
}

# ─────────────────────────────────────────────
# Serverless NEGs (Network Endpoint Groups)
# Point directly at Cloud Run services
# ─────────────────────────────────────────────
resource "google_compute_region_network_endpoint_group" "frontend" {
  name                  = "partyscout-frontend-neg"
  network_endpoint_type = "SERVERLESS"
  region                = var.region

  cloud_run {
    service = var.frontend_service_name
  }
}

resource "google_compute_region_network_endpoint_group" "backend" {
  name                  = "partyscout-backend-neg"
  network_endpoint_type = "SERVERLESS"
  region                = var.region

  cloud_run {
    service = var.backend_service_name
  }
}

# ─────────────────────────────────────────────
# Backend services
# Frontend gets Cloud CDN; backend does not
# ─────────────────────────────────────────────
resource "google_compute_backend_service" "frontend" {
  name                  = "partyscout-frontend-service"
  protocol              = "HTTPS"
  load_balancing_scheme = "EXTERNAL"
  enable_cdn            = true

  cdn_policy {
    cache_mode                   = "CACHE_ALL_STATIC"
    default_ttl                  = 3600
    max_ttl                      = 86400
    client_ttl                   = 3600
    negative_caching             = true
    serve_while_stale            = 86400
    signed_url_cache_max_age_sec = 0
  }

  backend {
    group = google_compute_region_network_endpoint_group.frontend.id
  }
}

resource "google_compute_backend_service" "backend" {
  name                  = "partyscout-backend-service"
  protocol              = "HTTPS"
  load_balancing_scheme = "EXTERNAL"

  backend {
    group = google_compute_region_network_endpoint_group.backend.id
  }
}

# ─────────────────────────────────────────────
# URL map (reverse proxy routing rules)
# /api  → backend Cloud Run
# /api/* → backend Cloud Run
# /*    → frontend Cloud Run
# ─────────────────────────────────────────────
resource "google_compute_url_map" "main" {
  name            = "partyscout-url-map"
  default_service = google_compute_backend_service.frontend.id

  host_rule {
    hosts        = [var.domain]
    path_matcher = "partyscout-paths"
  }

  path_matcher {
    name            = "partyscout-paths"
    default_service = google_compute_backend_service.frontend.id

    path_rule {
      paths   = ["/api", "/api/*"]
      service = google_compute_backend_service.backend.id
    }
  }
}

# ─────────────────────────────────────────────
# HTTP → HTTPS redirect map
# ─────────────────────────────────────────────
resource "google_compute_url_map" "http_redirect" {
  name = "partyscout-http-redirect"

  default_url_redirect {
    https_redirect         = true
    redirect_response_code = "MOVED_PERMANENTLY_DEFAULT"
    strip_query            = false
  }
}

# ─────────────────────────────────────────────
# Proxies
# ─────────────────────────────────────────────

# HTTPS reverse proxy — terminates TLS, applies URL map
resource "google_compute_target_https_proxy" "main" {
  name             = "partyscout-https-proxy"
  url_map          = google_compute_url_map.main.id
  ssl_certificates = [google_compute_managed_ssl_certificate.main.id]
}

# HTTP proxy — used only for 301 redirect to HTTPS
resource "google_compute_target_http_proxy" "redirect" {
  name    = "partyscout-http-proxy"
  url_map = google_compute_url_map.http_redirect.id
}

# ─────────────────────────────────────────────
# Forwarding rules (load balancer entry points)
# ─────────────────────────────────────────────

# HTTPS on port 443
resource "google_compute_global_forwarding_rule" "https" {
  name                  = "partyscout-https-rule"
  target                = google_compute_target_https_proxy.main.id
  port_range            = "443"
  ip_address            = google_compute_global_address.main.address
  load_balancing_scheme = "EXTERNAL"
}

# HTTP on port 80 — redirects to HTTPS
resource "google_compute_global_forwarding_rule" "http" {
  name                  = "partyscout-http-rule"
  target                = google_compute_target_http_proxy.redirect.id
  port_range            = "80"
  ip_address            = google_compute_global_address.main.address
  load_balancing_scheme = "EXTERNAL"
}
