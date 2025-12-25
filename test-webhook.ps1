# PowerShell test script for webhook endpoint
# Usage: .\test-webhook.ps1 [port]
# Default port: 3000

param(
    [int]$Port = 3000
)

$Secret = if ($env:MARKETPLACE_WEBHOOK_SECRET) { $env:MARKETPLACE_WEBHOOK_SECRET } else { "dev-secret-key-123" }

Write-Host "🧪 Testing webhook endpoint on http://localhost:${Port}/api/webhooks/lots" -ForegroundColor Cyan
Write-Host "Using secret: ${Secret}"
Write-Host ""

$body = @{
    event = "lot.created"
    lot = @{
        _id = "507f1f77bcf86cd799439011"
        title = "Test Lot from Marketplace"
        airlineName = "Test Airline"
        volume = @{
            amount = 1000
            unit = "MT"
        }
        pricing = @{
            price = 1000000
            pricePerUnit = 1000
            currency = "USD"
        }
        delivery = @{
            deliveryLocation = "Test Location"
            deliveryWindow = "Q1 2025"
        }
        compliance = @{
            sustainabilityScore = 30
        }
        type = "contract"
        status = "published"
        publishedAt = "2025-01-15T00:00:00Z"
    }
    organization = @{
        id = "test-org"
    }
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "http://localhost:${Port}/api/webhooks/lots" `
        -Method Post `
        -Headers @{
            "Authorization" = "Bearer ${Secret}"
            "Content-Type" = "application/json"
        } `
        -Body $body
    
    Write-Host "✅ Webhook test successful!" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 5)
    Write-Host ""
    Write-Host "Check your console logs for: '📥 Received lot.created' and '✅ Synced lot'" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Webhook test failed:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    }
}






















