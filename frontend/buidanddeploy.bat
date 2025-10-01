
DO NOT USE>  DEPLOY VIA GITHUB

cd C:\Users\DanOrsborne\Downloads\events-manager-app\frontend

npm install

npm run build

cd..

cp -r frontend/build backend/frontend_build


Compress-Archive -Path * -DestinationPath app.zip

az login

az webapp deploy --resource-group appsvc_linux_uksouth --name fowcpEvents --src-path app.zip