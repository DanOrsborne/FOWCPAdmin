cd C:\Users\DanOrsborne\Downloads\events-manager-app\frontend

npm install

npm run build

cp -r frontend/build backend/frontend_build


Compress-Archive -Path * -DestinationPath app.zip

az login

az webapp deploy source config-zip --resource-group AMS-Live --name fowcp --src app.zip
