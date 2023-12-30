echo "switching to brand master"
git checkout master

echo "Deploying files to server..."
scp -r * kasra@82.165.239.219:/securitycameravendor/server/security_camera_vendor_server/

echo "Done!"