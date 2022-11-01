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

(function () {
    const ADN_LOCATE_ELEMENT_EVENT = 'adnLocateElementEvent';

    class AdnElementLocatorExtension extends Autodesk.Viewing.Extension {
        constructor(viewer, options) {
            super(viewer, options);

            this.onLocatingElement = this.onLocatingElement.bind(this);
        }

        async onLocatingElement(event) {
            if (!this.viewer.isLoadDone())
                await this.viewer.waitForLoadDone();

            // if (!event.idType || !event.guid) return;

            await this.findElement(event);
            console.log('WORKED ON LOCATIN ELEMENT')
            window.parent.postMessage("selection_finished_loading", '*');
        }

        findElementByGlobalIdAsync(search) {
            return new Promise((resolve, reject) => {
                this.viewer.search(
                    search,
                    dbIds => resolve(dbIds[0]),
                    reject,
                    // [
                    //     "name",
                    //     "id",
                    //   ]
                )
            });
        }

        async findElementByIfcGuidAsync(guid) {
            function userFunction(pdb, idVals) {
                const attrName = 'IfcGUID';
                // Now iterate over all parts to find out which one is the largest.
                const result = [];

                pdb.enumObjects((dbId) => {
                    // For each part, iterate over their properties.
                    pdb.enumObjectProperties(dbId, (attrId, valId) => {
                        const def = pdb.getAttributeDef(attrId);

                        const propName = def.name;
                        const displayName = def.displayName;

                        if (propName === attrName || displayName === attrName) {
                            const value = pdb.getAttrValue(attrId, valId);
                            if (idVals.includes(value)) {
                                result.push(dbId);
                                return true;
                            }
                        }
                    });
                });

                // Return results
                return result;
            }

            const found = await this.viewer.model.getPropertyDb().executeUserFunction(userFunction, [guid]);
            return found[0];
        }

        async findElement(query) {
            console.log("Query: ", query)
            let dbId = null;
            const { search } = query;

            const dbIds = []
            for (let i = 0; i < search.length; i++) {
                console.log("search: ", search[i])
                dbIds.push(await this.findElementByGlobalIdAsync(search[i]))
            }
            //dbId = await this.findElementByGlobalIdAsync(search);
            console.log("Dbidsss: ", dbIds)
            if (!dbIds)
                return console.warn(`[AdnElementLocatorExtension]: Cannot find object with guid: ${guid}`);

                console.log("Dbisds: " , dbIds)
                //4097
                //10750
                //20253
            this.viewer.select(dbIds);
            this.viewer.isolate(dbIds);
            this.viewer.fitToView(dbIds);
            // this.viewer.select([20253,10750]);
            // this.viewer.isolate([20253,10750]);
            // this.viewer.fitToView([20253,10750]);
        }

        load() {
            this.viewer.addEventListener(
                ADN_LOCATE_ELEMENT_EVENT,
                this.onLocatingElement
            );

            return true;
        }

        unload() {
            this.viewer.removeEventListener(
                ADN_LOCATE_ELEMENT_EVENT,
                this.onLocatingElement
            );

            return true;
        }
    }

    AutodeskNamespace('Autodesk.ADN.ElementLocator.Event');
    Autodesk.ADN.ElementLocator.Event.LOCATE_ELEMENT_EVENT = ADN_LOCATE_ELEMENT_EVENT;

    Autodesk.Viewing.theExtensionManager.registerExtension('Autodesk.ADN.ElementLocator', AdnElementLocatorExtension);
})();


