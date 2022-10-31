# forge-viewer-iframe-interoperability

![Node.js](https://img.shields.io/badge/node-%3E%3D%2010.0.0-brightgreen.svg)
![Platforms](https://img.shields.io/badge/platform-windows%20%7C%20osx%20%7C%20linux-lightgray.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

[![Viewer](https://img.shields.io/badge/Viewer-v7-green.svg)](http://developer.autodesk.com/)
[![oAuth2](https://img.shields.io/badge/oAuth2-v1-green.svg)](http://developer.autodesk.com/)

# Description

This sample is demonstrating how to locate objects from external link and iframe's parent page.

This sample supports two ways to locate objects:

1. By passing querying strings to viewer page's URL (See [/public/extlink.html](public/extlink.html)):

    - **urn**: It stands for which model to load by the Forge Viewer.
    - **idType**: It stands for the IFC guid type. If the IFC model is translated by the legacy IFC pipeline, then the **idType** is `GLOBALID`. On the contrary, if you're using modern pipeline, the **idType** is `IfcGuid`.
    - **guid**: It stands for the IFC guid of the object you want to locate.

With those parameters, you can locate objects after model is loading completely immediately by passing them to the URL like the below:

```html
http://localhost:3000/viewer/?urn=dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6ZXh0cmFjdC1hdXRvZGVzay1pby0yMDE3bGt3ZWo3eHBiZ3A2M3g0aGwzMzV5Nm0yNm9ha2dnb2YvcmFjX2Jhc2ljX3NhbXBsZV9wcm9qZWN0X2xlZ2FjeS5pZmM&type=GLOBALID&guid=2cgXCjpDT0ZxBvxMSr3pfm
```

![thumbnail](/img/extlink.gif)

2. By trigger `LOCATE_ELEMENT_EVENT` (See [/public/index.html](public/index.html)):

```javascript
// Trigger event from iframe's parent page
const guid = event.target.getAttribute('data-guid');
const idType = event.target.getAttribute('data-idType');

if (!idType || !guid) return;

const iframeWind = viewerIframe.contentWindow;
iframeWind.NOP_VIEWER.fireEvent({
    type: iframeWind.Autodesk.ADN.ElementLocator.Event.LOCATE_ELEMENT_EVENT,
    idType,
    guid
});
```

![thumbnai-2](/img/iframe.gif)

# Setup

To use this sample, you will need Autodesk developer credentials. Visit the [Forge Developer Portal](https://developer.autodesk.com), sign up for an account, then [create an app](https://developer.autodesk.com/myapps/create). For this new app, use **http://localhost:3000/api/forge/callback/oauth** as the Callback URL, although it is not used on a 2-legged flow. Finally, take note of the **Client ID** and **Client Secret**.

### Run locally

Install [NodeJS](https://nodejs.org).

Clone this project or download it. It's recommended to install [GitHub Desktop](https://desktop.github.com/). To clone it via command line, use the following (**Terminal** on MacOSX/Linux, **Git Shell** on Windows):

    git clone https://github.com/yiskang/forge-viewer-iframe-interoperability

To run it, install the required packages, set the environment variables with your client ID & Secret and finally start it. Via command line, navigate to the folder where this repository was cloned to and use the following commands:

Mac OSX/Linux (Terminal)

    npm install
    export FORGE_CLIENT_ID=<<YOUR CLIENT ID FROM DEVELOPER PORTAL>>
    export FORGE_CLIENT_SECRET=<<YOUR CLIENT SECRET>>
    npm start

Windows (use **Node.js command line** from the Start menu)

    npm install
    set FORGE_CLIENT_ID=<<YOUR CLIENT ID FROM DEVELOPER PORTAL>>
    set FORGE_CLIENT_SECRET=<<YOUR CLIENT SECRET>>
    npm start

Open the browser: [http://localhost:3000](http://localhost:3000).

## Packages used

The [Autodesk Forge](https://www.npmjs.com/package/forge-apis) packages are included by default. Some other non-Autodesk packages are used, including [express](https://www.npmjs.com/package/express) and [multer](https://www.npmjs.com/package/multer) for upload.

# Tips & tricks

For local development/ testing, consider using the [nodemon](https://www.npmjs.com/package/nodemon) package, which auto-restarts your node application after any modification to your code. To install it, use:

    sudo npm install -g nodemon

Then, instead of **npm run dev**, use the following:

    npm run nodemon

Which executes **nodemon server.js --ignore www/**, where the **--ignore** parameter indicates that the app should not restart if files under the **www** folder are modified.

## Troubleshooting

After installing GitHub Desktop for Windows, on the Git Shell, if you see the ***error setting certificate verify locations*** error, then use the following command:

    git config --global http.sslverify "false"

# License

This sample is licensed under the terms of the [MIT License](http://opensource.org/licenses/MIT).
Please see the [LICENSE](LICENSE) file for full details.

## Written by

Eason Kang [@yiskang](https://twitter.com/yiskang), [Forge Partner Development](http://forge.autodesk.com)