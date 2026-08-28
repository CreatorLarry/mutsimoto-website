$ErrorActionPreference = 'Stop'

$workspace = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$destination = Join-Path $workspace 'output\branding\ia-branch\category-photos'
New-Item -ItemType Directory -Force -Path $destination | Out-Null

$photos = @(
    @{
        File = '01-light-commercial-vehicle.jpg'
        Url = 'https://images.pexels.com/photos/17024742/pexels-photo-17024742.jpeg?cs=srgb&dl=pexels-chuck-17024742.jpg&fm=jpg'
    },
    @{
        File = '02-heavy-commercial-vehicle.jpg'
        Url = 'https://images.unsplash.com/photo-1675889335425-a4af2d00154d?auto=format&fit=crop&fm=jpg&q=85&w=5000'
    },
    @{
        File = '03-matatus-psvs.jpg'
        Url = 'https://images.pexels.com/photos/10154857/pexels-photo-10154857.jpeg?cs=srgb&dl=pexels-maureen-wahu-1718132-10154857.jpg&fm=jpg'
    },
    @{
        File = '04-passenger-cars.jpg'
        Url = 'https://images.pexels.com/photos/17601751/pexels-photo-17601751.jpeg?cs=srgb&dl=pexels-jaralol-17601751.jpg&fm=jpg'
    },
    @{
        File = '05-4wd-suv.jpg'
        Url = 'https://images.pexels.com/photos/9550419/pexels-photo-9550419.jpeg?cs=srgb&dl=pexels-billingphotography-9550419.jpg&fm=jpg'
    },
    @{
        File = '06-pickups.jpg'
        Url = 'https://images.unsplash.com/photo-1654475677191-cace858c61dd?auto=format&fit=crop&fm=jpg&q=85&w=5000'
    },
    @{
        File = '07-generators.jpg'
        Url = 'https://images.pexels.com/photos/35596450/pexels-photo-35596450.jpeg?cs=srgb&dl=pexels-mumtaz-niazi-18390768-35596450.jpg&fm=jpg'
    },
    @{
        File = '08-construction-equipment.jpg'
        Url = 'https://images.pexels.com/photos/12021706/pexels-photo-12021706.jpeg?cs=srgb&dl=pexels-emma-nives-155339307-12021706.jpg&fm=jpg'
    },
    @{
        File = '09-mining-equipment.jpg'
        Url = 'https://images.unsplash.com/photo-1751054631354-a42bd7609d75?auto=format&fit=crop&fm=jpg&q=85&w=5000'
    },
    @{
        File = '10-agricultural-machinery.jpg'
        Url = 'https://images.unsplash.com/photo-1770022618118-644b513a0024?auto=format&fit=crop&fm=jpg&q=85&w=5000'
    },
    @{
        File = '11-tractors.jpg'
        Url = 'https://images.unsplash.com/photo-1754776973363-94037bde42fc?auto=format&fit=crop&fm=jpg&q=85&w=5000'
    },
    @{
        File = '12-compressors.jpg'
        Url = 'https://images.pexels.com/photos/9754814/pexels-photo-9754814.jpeg?cs=srgb&dl=pexels-theshuttervision-9754814.jpg&fm=jpg'
    },
    @{
        File = '13-industrial-plant-machinery.jpg'
        Url = 'https://images.unsplash.com/photo-1530939069691-adb779735408?auto=format&fit=crop&fm=jpg&q=85&w=5000'
    }
)

foreach ($photo in $photos) {
    $target = Join-Path $destination $photo.File
    Invoke-WebRequest -Uri $photo.Url -OutFile $target
    Write-Output $target
}
