
echo "Building app ..."
npm run build

echo "Deploying files to server..."
scp -r dist/* root@85.215.173.47:/var/www/server/dist

echo "Done!"