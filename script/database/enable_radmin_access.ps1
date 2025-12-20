<#
. enable_radmin_access.ps1
. Interactive helper to allow specific Radmin IPs to connect to local PostgreSQL.
. - Detects Postgres service and data directory
. - Backs up postgresql.conf and pg_hba.conf
. - Sets listen_addresses = '*'
. - Appends pg_hba.conf host lines for provided IPs (md5)
. - Restarts Postgres service
. - Adds Windows Firewall rule(s) limited to those IPs
. - Prints commands to create per-friend DB users (manual or automated later)
#>

param(
    [string]$FriendIPs
)

function Get-PostgresServiceInfo {
    $svc = Get-WmiObject -Class Win32_Service | Where-Object { $_.Name -match 'postgres' }
    if (-not $svc) { throw 'Postgres service not found.' }
    return $svc
}

try {
    $svc = Get-PostgresServiceInfo
}
catch {
    Write-Error "$_"
    exit 1
}

$path = $svc.PathName.Trim('"')
$binDir = Split-Path $path -Parent

# extract -D "dataDir" or -D dataDir
if ($path -match '-D\s*"([^"]+)"') { $dataDir = $matches[1] }
elseif ($path -match '-D\s*([^\s]+)') { $dataDir = $matches[1] }
else { Write-Error 'Could not determine Postgres data directory from service PathName.'; exit 1 }

$pgConf = Join-Path $dataDir 'postgresql.conf'
$pgHba = Join-Path $dataDir 'pg_hba.conf'

Write-Host "Postgres service: $($svc.Name)"
Write-Host "Data directory: $dataDir"

if (-not (Test-Path $pgConf)) { Write-Error "postgresql.conf not found at $pgConf"; exit 1 }
if (-not (Test-Path $pgHba)) { Write-Error "pg_hba.conf not found at $pgHba"; exit 1 }

# Backup files
$time = Get-Date -Format 'yyyyMMddHHmmss'
$pgConfBak = "$pgConf.bak-$time"
$pgHbaBak = "$pgHba.bak-$time"
Copy-Item -Path $pgConf -Destination $pgConfBak -Force
Copy-Item -Path $pgHba  -Destination $pgHbaBak  -Force
Write-Host "Backups created:" $pgConfBak, $pgHbaBak

# Ensure listen_addresses = '*'
$confText = Get-Content $pgConf -Raw
if ($confText -match '^[#\s]*listen_addresses\s*=') {
    $newConf = $confText -replace '^[#\s]*listen_addresses\s*=.*', 'listen_addresses = ''*'''
    Set-Content -Path $pgConf -Value $newConf -Force
}
else {
    Add-Content -Path $pgConf -Value "`nlisten_addresses = '*'
" -Force
}
Write-Host "Set listen_addresses = '*' in postgresql.conf"

if (-not $FriendIPs) {
    $FriendIPs = Read-Host 'Enter friend Radmin IP(s), comma-separated (e.g. 26.247.158.129)'
}
$ips = $FriendIPs -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ }
if ($ips.Count -eq 0) { Write-Error 'No IPs provided.'; exit 1 }

# Append pg_hba lines
foreach ($ip in $ips) {
    $line = "host    all    all    $ip/32    md5"
    Add-Content -Path $pgHba -Value $line
    Write-Host "Appended to pg_hba.conf: $line"
}

Write-Host 'Restarting Postgres service...'
try {
    Restart-Service -Name $svc.Name -Force -ErrorAction Stop
    Start-Sleep -Seconds 2
    Write-Host 'Postgres restarted.'
}
catch {
    Write-Warning "Could not restart service $($svc.Name): $_"
    Write-Host 'You may need to restart the service manually.'
}

# Add Windows Firewall rules limited to the IPs
foreach ($ip in $ips) {
    $ruleName = "Postgres Radmin $ip"
    # remove existing rule with same name if exists
    if (Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue) {
        Remove-NetFirewallRule -DisplayName $ruleName -Confirm:$false
    }
    New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Protocol TCP -LocalPort 5432 -RemoteAddress $ip -Action Allow
    Write-Host "Created Firewall rule allowing $ip -> 5432"
}

Write-Host "`nDone. Next steps:`n- Create a DB user for each friend (example commands below).`n- From friend machine (Radmin network) connect to host Radmin IP (example: 26.188.69.156) on port 5432 using the created user.`n- If connection fails, check Windows Firewall and that Postgres is listening on '*' (run: netstat -ano | findstr 5432).`n"

Write-Host "Example psql commands (run on host or in pgAdmin SQL):"
Write-Host "psql -U postgres -h localhost -c `"CREATE USER friend1 WITH ENCRYPTED PASSWORD 'StrongP@ss';`""
Write-Host "psql -U postgres -h localhost -d hcmsiu_ssps -c `"GRANT CONNECT ON DATABASE hcmsiu_ssps TO friend1;`""
Write-Host "psql -U postgres -h localhost -d hcmsiu_ssps -c `"GRANT USAGE ON SCHEMA public TO friend1; GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO friend1;`""

# Optionally create DB users now
$createNow = Read-Host 'Create DB users now? (y/N)'
if ($createNow -and $createNow.ToLower().StartsWith('y')) {
    # Read postgres admin password securely
    $securePass = Read-Host 'Enter postgres admin password (input hidden)' -AsSecureString
    $ptr = [System.Runtime.InteropServices.Marshal]::SecureStringToGlobalAllocUnicode($securePass)
    try { $pgPass = [System.Runtime.InteropServices.Marshal]::PtrToStringUni($ptr) } finally { [System.Runtime.InteropServices.Marshal]::ZeroFreeGlobalAllocUnicode($ptr) }

    # Ask for user:password pairs
    $pairs = Read-Host 'Enter user:password pairs comma-separated (e.g. friend1:Pwd1,friend2:Pwd2)'
    $pairsArr = $pairs -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ }
    if ($pairsArr.Count -eq 0) { Write-Warning 'No user pairs provided. Skipping user creation.' }
    else {
        # Check psql in PATH
        if (-not (Get-Command psql -ErrorAction SilentlyContinue)) { Write-Error 'psql not found in PATH. Install PostgreSQL client or run these commands in pgAdmin.' }
        else {
            foreach ($p in $pairsArr) {
                if ($p -notmatch ':') { Write-Warning "Skipping invalid pair: $p"; continue }
                $parts = $p -split ':', 2
                $uname = $parts[0].Trim()
                $upass = $parts[1].Trim()
                if (-not $uname -or -not $upass) { Write-Warning "Skipping invalid pair: $p"; continue }

                # Build SQL safely by concatenation to avoid quoting/parsing issues
                $createSql = 'CREATE USER "' + $uname + '" WITH ENCRYPTED PASSWORD ''' + $upass + ''';'
                $grantSql1 = 'GRANT CONNECT ON DATABASE hcmsiu_ssps TO "' + $uname + '";'
                $grantSql2 = 'GRANT USAGE ON SCHEMA public TO "' + $uname + '"; GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO "' + $uname + '";'

                $env:PGPASSWORD = $pgPass
                try {
                    & psql -U postgres -h localhost -c $createSql
                    & psql -U postgres -h localhost -d hcmsiu_ssps -c $grantSql1
                    & psql -U postgres -h localhost -d hcmsiu_ssps -c $grantSql2
                    Write-Host "Created and granted for user: $($uname)"
                }
                catch {
                    Write-Warning "Failed creating/granting for $($uname): $($_)"
                }
                finally { Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue }
            }
        }
    }
}
