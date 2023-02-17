[Net.ServicePointManager]::SecurityProtocol +='tls12'
Invoke-WebRequest -Method GET -Uri "http://192.168.5.20:505/testing" 