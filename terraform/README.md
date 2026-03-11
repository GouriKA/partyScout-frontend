# PartyScout — Load Balancer (Terraform)

Sets up a GCP HTTPS Application Load Balancer for `partyscout.app` that reverse-proxies traffic to the two Cloud Run services.

## Architecture

```
Internet
   │
   ├── :80  ──► HTTP proxy ──► 301 redirect → HTTPS
   │
   └── :443 ──► HTTPS reverse proxy (TLS termination)
                      │
                      ├── /api, /api/* ──► partyscout-backend (Cloud Run)
                      │
                      └── /*           ──► partyscout-frontend (Cloud Run)
                                              └── Cloud CDN enabled
```

## One-time setup

### 1. Create Terraform state bucket

```bash
bash setup-state-bucket.sh
```

### 2. Copy and fill in tfvars

```bash
cp terraform.tfvars.example terraform.tfvars
# terraform.tfvars is gitignored — edit it with your values
```

### 3. Initialise Terraform

```bash
terraform init
```

### 4. Preview changes

```bash
terraform plan
```

### 5. Apply

```bash
terraform apply
```

Terraform will output the **load balancer IP address**.

### 6. Point DNS to the load balancer

Create an **A record** in your domain registrar:

```
Type  Name            Value
A     partyscout.app  <load_balancer_ip from output>
```

The Google-managed SSL certificate provisions automatically once DNS resolves to the LB IP. This can take **10–30 minutes**.

### 7. Update VITE_API_URL

Once the load balancer is live, update `cloudbuild.yaml` in the frontend so API calls go through the LB instead of directly to Cloud Run:

```yaml
substitutions:
  _VITE_API_URL: 'https://partyscout.app'  # was direct Cloud Run URL
```

## Tear down

```bash
terraform destroy
```

## Files

| File | Purpose |
|------|---------|
| `main.tf` | All GCP resources (NEGs, backend services, URL map, proxies, forwarding rules, SSL cert) |
| `variables.tf` | Input variables |
| `outputs.tf` | Load balancer IP, URLs, SSL status |
| `terraform.tfvars.example` | Example values — copy to `terraform.tfvars` |
| `setup-state-bucket.sh` | Creates the GCS bucket for Terraform remote state |
