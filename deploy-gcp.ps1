param(
  [string]$ProjectId = "project-976e1d4c-e4b0-4cf3-bcf",

  [string]$Region = "asia-south1",
  [string]$SqlInstanceName = "melvi-pg-micro",
  [string]$DbName = "melvi_db",
  [string]$DbUser = "melvi_user",
  [string]$ServiceName = "melvi-website",
  [string]$AdminEmail = "admin@melvi.com",
  [string]$AdminPassword = "",
  [switch]$Rebuild
)

$ErrorActionPreference = "Continue"

$GcloudBin = "$env:LOCALAPPDATA\Google\Cloud SDK\google-cloud-sdk\bin"
if ((Test-Path $GcloudBin) -and ($env:PATH -notlike "*$GcloudBin*")) {
  $env:PATH = "$GcloudBin;$env:PATH"
}

Write-Host "=== Melvi Low-Cost Google Cloud Deployment (Cloud Run + Cloud SQL db-f1-micro) ===" -ForegroundColor Cyan

# 1. Set active project
gcloud config set project $ProjectId

# 2. Enable required Google Cloud APIs
Write-Host "Enabling Cloud Run, Cloud SQL, Cloud Build, and Artifact Registry APIs..." -ForegroundColor Yellow
gcloud services enable `
  run.googleapis.com `
  sqladmin.googleapis.com `
  cloudbuild.googleapis.com `
  artifactregistry.googleapis.com `
  cloudresourcemanager.googleapis.com

# 2b. Ensure Compute Engine default service account has required Cloud Build & Cloud SQL permissions
$ProjectNumber = gcloud projects describe $ProjectId --format="value(projectNumber)" --quiet
$ComputeSa = "serviceAccount:${ProjectNumber}-compute@developer.gserviceaccount.com"
Write-Host "Granting Cloud Build, Storage, Artifact Registry, and Cloud SQL permissions to $ComputeSa..." -ForegroundColor Yellow
foreach ($role in @("roles/storage.admin", "roles/artifactregistry.writer", "roles/logging.logWriter", "roles/cloudsql.client")) {
  gcloud projects add-iam-policy-binding $ProjectId --member=$ComputeSa --role=$role --condition=None --quiet | Out-Null
}

# 3. Generate secure secrets if not supplied
function New-RandomSecret([int]$Length = 32) {
  $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  -join ((1..$Length) | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
}

$DbPassword = New-RandomSecret 24
$JwtSecret = New-RandomSecret 40
if ([string]::IsNullOrWhiteSpace($AdminPassword) -or $AdminPassword.Length -lt 16) {
  $AdminPassword = "MelviAdmin!" + (New-RandomSecret 12)
}

# 4. Create lowest-cost Cloud SQL PostgreSQL instance (db-f1-micro, ENTERPRISE edition, ZONAL, 10GB HDD) if it doesn't exist
$existingSql = gcloud sql instances list --filter="name=$SqlInstanceName" --format="value(name)" --quiet
if (-not $existingSql) {
  Write-Host "Creating lowest-cost Cloud SQL PostgreSQL instance (${SqlInstanceName}: db-f1-micro, ENTERPRISE, 10GB HDD, Zonal)..." -ForegroundColor Yellow
  gcloud sql instances create $SqlInstanceName `
    --database-version=POSTGRES_17 `
    --edition=ENTERPRISE `
    --tier=db-f1-micro `
    --region=$Region `
    --storage-type=HDD `
    --storage-size=10GB `
    --availability-type=ZONAL `
    --no-backup `
    --quiet
} else {
  Write-Host "Cloud SQL instance '$SqlInstanceName' already exists." -ForegroundColor Green
}

# 5. Configure database and user
Write-Host "Configuring database '$DbName' and user '$DbUser'..." -ForegroundColor Yellow
$existingDb = gcloud sql databases list --instance=$SqlInstanceName --filter="name=$DbName" --format="value(name)" --quiet
if (-not $existingDb) {
  gcloud sql databases create $DbName --instance=$SqlInstanceName --quiet
}

$existingUser = gcloud sql users list --instance=$SqlInstanceName --filter="name=$DbUser" --format="value(name)" --quiet
if (-not $existingUser) {
  gcloud sql users create $DbUser --instance=$SqlInstanceName --password=$DbPassword --quiet
} else {
  gcloud sql users set-password $DbUser --instance=$SqlInstanceName --password=$DbPassword --quiet
}

$InstanceConnectionName = "${ProjectId}:${Region}:${SqlInstanceName}"

# 6. Deploy unified Frontend + Backend container to Cloud Run (scales to 0 when idle)
$ExistingImage = $null
if (-not $Rebuild) {
  $ImgRow = gcloud artifacts docker images list "$Region-docker.pkg.dev/$ProjectId/cloud-run-source-deploy/$ServiceName" --sort-by="~UPDATE_TIME" --limit=1 --format="value(package,version)" --quiet
  if ($ImgRow) {
    $parts = ($ImgRow | Select-Object -First 1) -split "\s+"
    if ($parts.Length -ge 2) {
      $ExistingImage = "$($parts[0])@$($parts[1])"
    }
  }
}

$EnvVars = "NODE_ENV=production,INSTANCE_CONNECTION_NAME=$InstanceConnectionName,DB_PORT=5432,DB_USER=$DbUser,DB_PASSWORD=$DbPassword,DB_NAME=$DbName,DB_SSL=false,JWT_SECRET=$JwtSecret,ADMIN_EMAIL=$AdminEmail,ADMIN_USERNAME=admin,ADMIN_PASSWORD=$AdminPassword"

if ($ExistingImage) {
  Write-Host "Deploying existing built image ($ExistingImage) to Cloud Run ($ServiceName)..." -ForegroundColor Yellow
  gcloud run deploy $ServiceName `
    --image $ExistingImage `
    --region $Region `
    --platform managed `
    --allow-unauthenticated `
    --min-instances 0 `
    --max-instances 2 `
    --memory 512Mi `
    --cpu 1 `
    --cpu-throttling `
    --add-cloudsql-instances $InstanceConnectionName `
    --set-env-vars $EnvVars `
    --quiet
} else {
  Write-Host "Building and deploying unified container to Cloud Run ($ServiceName)..." -ForegroundColor Yellow
  gcloud run deploy $ServiceName `
    --source . `
    --region $Region `
    --platform managed `
    --allow-unauthenticated `
    --min-instances 0 `
    --max-instances 2 `
    --memory 512Mi `
    --cpu 1 `
    --cpu-throttling `
    --add-cloudsql-instances $InstanceConnectionName `
    --set-env-vars $EnvVars `
    --quiet
}

$ServiceUrl = gcloud run services describe $ServiceName --region $Region --format="value(status.url)"
Write-Host "`nDeployment Complete!" -ForegroundColor Green
Write-Host "Live Website & API URL : $ServiceUrl" -ForegroundColor Cyan
Write-Host "Admin Portal URL       : $ServiceUrl/admin" -ForegroundColor Cyan
Write-Host "Admin Email            : $AdminEmail" -ForegroundColor Yellow
Write-Host "Admin Password         : $AdminPassword" -ForegroundColor Yellow
