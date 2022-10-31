//
// Copyright (c) Autodesk, Inc. All rights reserved
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
//
// Forge Autodesk.ADN.RevitGroupPanel
// by Eason Kang - Autodesk Developer Network (ADN)
//

'use strict';

(function() {
  function userFunction( pdb ) {
      let _nameAttrId = pdb.getAttrName();

      let _internalGroupRefAttrId = -1;

      // Iterate over all attributes and find the index to the one we are interested in
      pdb.enumAttributes(function(i, attrDef, attrRaw){

          let category = attrDef.category;
          let name = attrDef.name;

          if( name === 'Group' && category === '__internalref__' ) {
              _internalGroupRefAttrId = i;
              return true; // to stop iterating over the remaining attributes.
          }
      });

      //console.log( _internalGroupRefAttrId );

      // Early return is the model doesn't contain data for "Group".
      if( _internalGroupRefAttrId === -1 )
        return null;

      let _internalMemberRefAttrId = -1;

      // Iterate over all attributes and find the index to the one we are interested in
      pdb.enumAttributes(function(i, attrDef, attrRaw){

          let category = attrDef.category;
          let name = attrDef.name;

          if( name === 'Member' && category === '__internalref__' ) {
              _internalMemberRefAttrId = i;
              return true; // to stop iterating over the remaining attributes.
          }
      });

      //console.log( _internalMemberRefAttrId );

      // Early return is the model doesn't contain data for "Member".
      if( _internalMemberRefAttrId === -1 )
        return null;

      let _categoryAttrId = -1;

      // Iterate over all attributes and find the index to the one we are interested in
      pdb.enumAttributes(function(i, attrDef, attrRaw){

          let category = attrDef.category;
          let name = attrDef.name;

          if( name === 'Category' && category === '__category__' ) {
              _categoryAttrId = i;
              return true; // to stop iterating over the remaining attributes.
          }
      });

      //console.log( _categoryAttrId );

      // Early return is the model doesn't contain data for "Member".
      if( _categoryAttrId === -1 )
        return null;

      const groups = [];
      // Now iterate over all parts to find all groups
      pdb.enumObjects(function( dbId ) {
          let isGroup = false;

          // For each part, iterate over their properties.
          pdb.enumObjectProperties( dbId, function( attrId, valId ) {

              // Only process 'Caegory' property.
              // The word "Property" and "Attribute" are used interchangeably.
              if( attrId === _categoryAttrId ) {
                  const value = pdb.getAttrValue( attrId, valId );
                  if( value === 'Revit Group' ) {
                      isGroup = true;
                      // Stop iterating over additional properties when "Caegory: Revit Group" is found.
                      return true;
                  }
              }
          });

          if( !isGroup ) return;

          const children = [];
          let groupName = '';

          // For each part, iterate over their properties.
          pdb.enumObjectProperties( dbId, function( attrId, valId ) {

              // Only process 'Member' property.
              // The word "Property" and "Attribute" are used interchangeably.
              if( attrId === _internalMemberRefAttrId ) {
                  const value = pdb.getAttrValue( attrId, valId );
                  children.push( value );
              }

              if( attrId === _nameAttrId ) {
                  const value = pdb.getAttrValue( attrId, valId );
                  groupName = value;
              }
          });

          groups.push({
              dbId,
              name: groupName,
              children
          });
      });

      return groups;
  }

  class AdnRevitGroupPanel extends Autodesk.Viewing.UI.DockingPanel {
    constructor( viewer, title, options ) {
      options = options || {};

      //  Height adjustment for scroll container, offset to height of the title bar and footer by default.
      if( !options.heightAdjustment )
        options.heightAdjustment = 70;

      if( !options.marginTop )
        options.marginTop = 0;

      super( viewer.container, viewer.container.id + 'AdnRevitGroupPanel', title, options );

      this.container.classList.add( 'adn-docking-panel' );
      this.container.classList.add( 'adn-rvt-group-panel' );
      this.createScrollContainer( options );

      this.viewer = viewer;
      this.options = options;
      this.uiCreated = false;

      this.addVisibilityListener(( show ) => {
        if( !show ) return;

        if( !this.uiCreated )
          this.createUI();
      });
    }

    async getGroupData() {
      try {
        return await this.viewer.model.getPropertyDb().executeUserFunction( userFunction );
      } catch( ex ) {
        console.error( ex );
        return null;
      }
    }

    async requestContent() {
      const data = await this.getGroupData();
      if( !data ) return;

      for( let i=0; i<data.length; i++ ) {
        const div = document.createElement( 'div' );
        div.innerText = `${ data[i].name }(${ data[i].children.length })`;
        div.title = `DbId: ${ data[i].dbId }`;
        div.addEventListener(
          'click',
          ( event ) => {
            event.stopPropagation();
            event.preventDefault();

            this.viewer.clearSelection();
            this.viewer.select( data[i].children );
            this.viewer.fitToView( data[i].children );
          });
        this.scrollContainer.appendChild( div );
      }

      this.resizeToContent();
    }

    async createUI() {
      this.uiCreated = true;

      if( this.viewer.model.isLoadDone() ) {
        this.requestContent();
      } else {
        this.viewer.addEventListener(
          Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
          () => this.requestContent(),
          { once: true }
        );
      }
    }
  }

  class AdnRevitGroupPanelExtension extends Autodesk.Viewing.Extension {
    constructor( viewer, options ) {
      super( viewer, options );

      this.panel = null;
      this.createUI = this.createUI.bind( this );
      this.onToolbarCreated = this.onToolbarCreated.bind( this );
    }

    onToolbarCreated() {
      this.viewer.removeEventListener(
        Autodesk.Viewing.TOOLBAR_CREATED_EVENT,
        this.onToolbarCreated
      );

      this.createUI();
    }

    createUI() {
      const viewer = this.viewer;

      const rvtGroupPanel = new AdnRevitGroupPanel( viewer, 'Revit Group' );

      viewer.addPanel( rvtGroupPanel );
      this.panel = rvtGroupPanel;

      const rvtGroupButton = new Autodesk.Viewing.UI.Button( 'toolbar-adnRevitGroupTool' );
      rvtGroupButton.setToolTip( 'Revit Group' );
      rvtGroupButton.setIcon( 'adsk-icon-properties' );
      rvtGroupButton.onClick = function() {
        rvtGroupPanel.setVisible( !rvtGroupPanel.isVisible() );
      };

      const subToolbar = new Autodesk.Viewing.UI.ControlGroup( 'toolbar-adn-tools' );
      subToolbar.addControl( rvtGroupButton );
      subToolbar.adnRvtGroupButton = rvtGroupButton;
      this.subToolbar = subToolbar;

      viewer.toolbar.addControl( this.subToolbar );

      rvtGroupPanel.addVisibilityListener(function( visible ) {
        if( visible )
          viewer.onPanelVisible( rvtGroupPanel, viewer );

          rvtGroupButton.setState( visible ? Autodesk.Viewing.UI.Button.State.ACTIVE : Autodesk.Viewing.UI.Button.State.INACTIVE );
      });
    }

    load() {
      if( this.viewer.toolbar ) {
        // Toolbar is already available, create the UI
        this.createUI();
      } else {
        // Toolbar hasn't been created yet, wait until we get notification of its creation
        this.viewer.addEventListener(
          Autodesk.Viewing.TOOLBAR_CREATED_EVENT,
          this.onToolbarCreated
        );
      }

      return true;
    }

    unload() {
      if( this.panel ) {
        this.panel.uninitialize();
        delete this.panel;
        this.panel = null;
      }

      if( this.subToolbar ) {
        this.viewer.toolbar.removeControl( this.subToolbar );
        delete this.subToolbar;
        this.subToolbar = null;
      }

      return true;
    }
  }

  Autodesk.Viewing.theExtensionManager.registerExtension( 'Autodesk.ADN.RevitGroupPanel', AdnRevitGroupPanelExtension );
})();

viewer.loadExtension( 'Autodesk.ADN.RevitGroupPanel' );