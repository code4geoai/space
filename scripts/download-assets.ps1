$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$imageDir = Join-Path $root 'assets/images'
$fontDir = Join-Path $root 'assets/fonts'
New-Item -ItemType Directory -Force $imageDir,$fontDir | Out-Null
$items = @{
 'apollo11.jpg'='https://eol.jsc.nasa.gov/DatabaseImages/ISD/highres/AS11/AS11-40-5927.JPG'
 'rover.jpg'='https://eol.jsc.nasa.gov/DatabaseImages/ISD/highres/AS17/AS17-147-22527.JPG'
 'reflector.jpg'='https://eol.jsc.nasa.gov/DatabaseImages/ISD/highres/AS11/AS11-40-5952.JPG'
 'opportunity.jpg'='https://d2pn8kiwq2w21t.cloudfront.net/original_images/jpegPIA22222.jpg'
 'ingenuity.jpg'='https://assets.science.nasa.gov/dynamicimage/assets/science/psd/photojournal/pia/pia25/pia25881/PIA25881.jpg?fit=clip&w=1600'
 'first-flight.jpg'='https://assets.science.nasa.gov/dynamicimage/assets/science/psd/mars/downloadable_items/4/5/45980_3-PIA24584-Ingenuitys_First_Black_and_White_Heli_Shot_from_the_Air.jpeg?fit=clip&w=1600'
 'aerial.jpg'='https://assets.science.nasa.gov/dynamicimage/assets/science/psd/photojournal/pia/pia24/pia24593/PIA24593.jpg?fit=clip&w=1600'
 'debris.jpg'='https://assets.science.nasa.gov/dynamicimage/assets/science/psd/mars/downloadable_items/4/7/47189_1-PIA25219.png?fit=clip&w=1600'
 'final.jpg'='https://assets.science.nasa.gov/dynamicimage/assets/science/psd/mars/downloadable_items/48818_PIA26238.png?fit=clip&w=1600'
 'apollo11-footpad.jpg'='https://eol.jsc.nasa.gov/DatabaseImages/ISD/highres/AS11/AS11-40-5917.JPG'
 'apollo11-engine.jpg'='https://eol.jsc.nasa.gov/DatabaseImages/ISD/highres/AS11/AS11-40-5921.JPG'
 'apollo11-ladder.jpg'='https://eol.jsc.nasa.gov/DatabaseImages/ISD/highres/AS11/AS11-40-5869.JPG'
 'rover-front.jpg'='https://eol.jsc.nasa.gov/DatabaseImages/ISD/highres/AS17/AS17-134-20389.JPG'
 'rover-fender.jpg'='https://eol.jsc.nasa.gov/DatabaseImages/ISD/highres/AS17/AS17-137-20979.JPG'
 'rover-wide.jpg'='https://eol.jsc.nasa.gov/DatabaseImages/ISD/highres/AS17/AS17-134-20435.JPG'
 'reflector-carry.jpg'='https://eol.jsc.nasa.gov/DatabaseImages/ISD/highres/AS11/AS11-40-5942.JPG'
 'reflector-context.jpg'='https://eol.jsc.nasa.gov/DatabaseImages/ISD/highres/AS11/AS11-40-5946.JPG'
 'reflector-apollo15.jpg'='https://eol.jsc.nasa.gov/DatabaseImages/ISD/highres/AS15/AS15-85-11468.JPG'
 'opportunity-shadow.jpg'='https://d2pn8kiwq2w21t.cloudfront.net/original_images/jpegPIA06739.jpg'
 'opportunity-panels.jpg'='https://assets.science.nasa.gov/dynamicimage/assets/science/psd/photojournal/pia/pia18/pia18079/PIA18079.jpg?fit=clip&w=1600'
 'opportunity-tracks.jpg'='https://assets.science.nasa.gov/dynamicimage/assets/science/psd/photojournal/pia/pia23/pia23246/PIA23246.jpg?fit=clip&w=1600'
 'debris-aerial.jpg'='https://d2pn8kiwq2w21t.cloudfront.net/original_images/jpegPIA25217.jpg'
 'debris-ground.jpg'='https://assets.science.nasa.gov/dynamicimage/assets/science/psd/photojournal/pia/pia25/pia25214/PIA25214.jpg?fit=clip&w=1600'
 'debris-heatshield.jpg'='https://assets.science.nasa.gov/dynamicimage/assets/science/psd/photojournal/pia/pia24/pia24337/PIA24337.jpg?fit=clip&w=1600'
}
Add-Type -AssemblyName System.Drawing
$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
foreach ($entry in $items.GetEnumerator()) {
 $output = Join-Path $imageDir $entry.Key
 if (Test-Path $output) { continue }
 $temp = "$output.download"
 Write-Output "Downloading $($entry.Key)"
 Invoke-WebRequest -UseBasicParsing -Uri $entry.Value -OutFile $temp -TimeoutSec 120
 $original = [System.Drawing.Image]::FromFile($temp)
 $scale = [Math]::Min([double]1,1600.0 / [Math]::Max($original.Width,$original.Height))
 $bitmap = New-Object System.Drawing.Bitmap ([int]($original.Width*$scale)),([int]($original.Height*$scale))
 $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
 $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
 $graphics.DrawImage($original,0,0,$bitmap.Width,$bitmap.Height)
 $parameters = New-Object System.Drawing.Imaging.EncoderParameters 1
 $parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality),([long]86)
 $bitmap.Save($output,$encoder,$parameters)
 $graphics.Dispose(); $bitmap.Dispose(); $original.Dispose(); $parameters.Dispose()
 Remove-Item -LiteralPath $temp
}
$fonts = @{
 'NotoNastaliqUrdu.ttf'='https://raw.githubusercontent.com/google/fonts/main/ofl/notonastaliqurdu/NotoNastaliqUrdu%5Bwght%5D.ttf'
 'NotoNaskhArabic.ttf'='https://raw.githubusercontent.com/google/fonts/main/ofl/notonaskharabic/NotoNaskhArabic%5Bwght%5D.ttf'
 'Inter.ttf'='https://raw.githubusercontent.com/google/fonts/main/ofl/inter/Inter%5Bopsz,wght%5D.ttf'
 'Nastaliq-OFL.txt'='https://raw.githubusercontent.com/google/fonts/main/ofl/notonastaliqurdu/OFL.txt'
 'Naskh-OFL.txt'='https://raw.githubusercontent.com/google/fonts/main/ofl/notonaskharabic/OFL.txt'
 'Inter-OFL.txt'='https://raw.githubusercontent.com/google/fonts/main/ofl/inter/OFL.txt'
}
foreach ($entry in $fonts.GetEnumerator()) {
 $output=Join-Path $fontDir $entry.Key
 if (!(Test-Path $output)) { Write-Output "Downloading $($entry.Key)"; Invoke-WebRequest -UseBasicParsing -Uri $entry.Value -OutFile $output -TimeoutSec 180 }
}
Write-Output 'Assets downloaded and photographs optimized without cropping.'
