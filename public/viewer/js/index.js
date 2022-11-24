/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Forge Partner Development
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

document.addEventListener(
    'DOMContentLoaded',
    () => {
        function fetchForgeToken(callback) {
            fetch('/api/forge/oauth/token', {
                method: 'get',
                headers: new Headers({ 'Content-Type': 'application/json' }),
            })
                .then((response) => {
                    if (response.status === 200) {
                        return response.json();
                    }
                    return Promise.reject(
                        new Error(`Failed to fetch token from server (status: ${response.status}, message: ${response.statusText})`),
                    );
                })
                .then((data) => {
                    if (!data) return Promise.reject(new Error('Empty token response'));

                    callback(data.access_token, data.expires_in);
                })
                .catch(error => console.error(error));
        }

        function getUrlParameter(name) {
            name = name.replace(/[]/, "\[").replace(/[]/, "\[").replace(/[]/, "\\\]");
            var regexS = "[\\?&]" + name + "=([^&#]*)";
            var regex = new RegExp(regexS);
            var results = regex.exec(window.location.href);
            if (results == null) return ""; else {
                return results[1];
            }
        };

        let viewer = null;
        const options = {
            env: 'AutodeskProduction',
            getAccessToken: fetchForgeToken
        };

        const urn = getUrlParameter('urn');

        Autodesk.Viewing.Initializer(options, () => {
            const htmlDiv = document.getElementById('forgeViewer');
            const config3d = {
                extensions: ['Autodesk.ADN.ElementLocator','Autodesk.Viewing.MarkupsCore','Autodesk.Viewing.MarkupsGui','Autodesk.DocumentBrowser']
            };

            viewer = new Autodesk.Viewing.GuiViewer3D(htmlDiv, config3d);
            const startedCode = viewer.start();
            if (startedCode > 0) {
                console.error('Failed to create a Viewer: WebGL not supported.');
                return;
            }

            console.log('Initialization complete, loading a model next...');
            console.log("URN RECIEVED: ", urn)

            const documentId = `urn:${urn}`;
            Autodesk.Viewing.Document.load(
                documentId,
                onDocumentLoadSuccess,
                onDocumentLoadFailure
            );

            function onDocumentLoadSuccess(viewerDocument) {
                const defaultModel = viewerDocument.getRoot().getDefaultGeometry();
                viewer.loadDocumentNode(viewerDocument, defaultModel).then(model => {
                    const idType = getUrlParameter('type');
                    const guid = getUrlParameter('guid');

                    if (!idType || !guid) return;

                    viewer.fireEvent({
                        type: Autodesk.ADN.ElementLocator.Event.LOCATE_ELEMENT_EVENT,
                        idType,
                        guid
                    });
                });
            }

            function onDocumentLoadFailure() {
                console.error('Failed fetching Forge manifest');
            }


            function takeScreenshot(screenshot,_callback){
                viewer.loadExtension('Autodesk.Viewing.MarkupsCore').then(function (markupCore) {
        
                    // load the markups
                    // markupCore.show();
                    // markupCore.loadMarkups(markupSVG, "layerName");

                    // ideally should also restore state of Viewer for this markup

                    // prepare to render the markups
                    var canvas = document.getElementById('snapshot');
                    canvas.width = viewer.container.clientWidth;
                    canvas.height = viewer.container.clientHeight;
                    var ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(screenshot, 0, 0, canvas.width, canvas.height);
                    markupCore.renderToCanvas(ctx);
                    
                    // hide the markups
                    // markupCore.hide();
                    
                    setTimeout(()=>{
                        _callback();    
                    },500)
                });
            }


            document.querySelector(".button").addEventListener("click",()=>{
                console.log("CLICK AT INDEXJS")
                    var screenshot = new Image();
                    screenshot.onload = function () {
                        
                        takeScreenshot(screenshot,function() {
                        const newCanvas = document.querySelector("#snapshot")
                        console.log(newCanvas)
                        const dataURL = newCanvas.toDataURL();
                        console.log(dataURL)
                        window.parent.postMessage({values:dataURL}, "*");
                        });    
                       
                    };
        
                    // Get the full image
                    viewer.getScreenShot(viewer.container.clientWidth, viewer.container.clientHeight, function (blobURL) {
                        screenshot.src = blobURL;
                        
                        
                    });
                
            })

          
        });
    });

