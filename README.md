
// run the app 
npm start




pm2 --name datahost-api-client start npm -- start



**** LOCALMODE *****
please double check in node_modules/lu_api_documentation_template/ApiCLient.js
        this.basePath = 'http://localhost:8088'.replace(/\/+$/, '');
localhost or PROD url ?



*** DEV ***

npm init


if changes in lu_api_documentation_template
npm remove lu_api_documentation_template
npm install Lund-University-Biodiversity-data/datahost-api-client-nodejs --save

FROM GIT
npm install Lund-University-Biodiversity-data/datahost-api-client-nodejs --save

FROM npm if registered and module published before
npm install lu_api_documentation_template --save

(install the app)
npm i -s express

npm install webpack webpack-cli --save-dev

node --es-module-specifier-resolution=node index.js

npm install var_dump --save-dev
npm install body-parser
// for templating
npm install ejs 


npm install tablefilter

npm install objects-to-csv

npm install bootstrap-datepicker

//npm install cors (for cross origin import. like browsealoud)

## for xlsx
npm install fs
npm install flat
npm install json2csv
npm i @aternus/csv-to-xlsx


## for statistics
npm install mongodb



## LU Styleguide

historicaly it was possible to use these links :
<!-- <link rel="stylesheet" href="https://styleguide.lu.se/styles/main.css"> -->
<!-- (headerLU.ejs) https://styleguide.lu.se/images/logo/logo_lu_small@1x.png -->
now styleguide.lu.se is redirected to some zeroheight.com website...
I obtained a bundle from LU to save locally this main.css into public/css/styleguide_lu_20250408.css
and the logos