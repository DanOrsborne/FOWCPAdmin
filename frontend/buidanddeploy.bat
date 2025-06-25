cd C:\Users\DanOrsborne\Downloads\events-manager-app\frontend

npm run build

Compress-Archive -Path * -DestinationPath app.zip

az login

az webapp deploy source config-zip --resource-group AMS-Live --name fowcp --src app.zip
