






(function () {
    
    const ADN_LOCK_CAMERA_EVENT = 'lockCameraEvent';
    const ADN_UNLOCK_CAMERA_EVENT = 'unlockCameraEvent';
    
    class LockCameraExtension extends Autodesk.Viewing.Extenstion {
    // function LockCameraExtension(viewer, options) {
    //     Autodesk.Viewing.Extension.call(this, viewer, options);
    //   }
      
    //   LockCameraExtension.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
    //   LockCameraExtension.prototype.constructor = LockCameraExtension;
    
      LockCameraExtension.prototype.lockNavigation = function(event) {
            this.viewer.setNavigationLock(true)
            console.log('LOCK NAVIGATION!')
        }
      
      LockCameraExtension.prototype.load = function() {
        console.log('LockCameraExtension is loaded!');
        
        var viewer = this.viewer;
    
        // var lockBtn = document.getElementById('MyAwesomeLockButton');
        // lockBtn.addEventListener('click', function() {
    
        // });
    
        this.viewer.addEventListener(
            ADN_LOCK_CAMERA_EVENT,
            this.lockNavigation()
        );
    
        this.viewer.addEventListener(
            ADN_UNLOCK_CAMERA_EVENT,
            this.viewer.setNavigationLock(false)
        );
      
        // var unlockBtn = document.getElementById('MyAwesomeUnlockButton');
        // unlockBtn.addEventListener('click', function() {
        //   console.log("Unlock it selected!")
        //   viewer.setNavigationLock(false);
        // });
      
        return true;
      };
      
      LockCameraExtension.prototype.unload = function() {
        console.log('LockCameraExtension is now unloaded!');
        this.viewer.removeEventListener(
            ADN_LOCK_CAMERA_EVENT,
        );
    
        this.viewer.removeEventListener(
            ADN_UNLOCK_CAMERA_EVENT,
        );
        return true;
      };
    }
      AutodeskNamespace('Autodesk.ADN.LockCamera.Event');
      Autodesk.ADN.ElementLocator.Event.LOCK_CAMERA_EVENT = ADN_LOCK_CAMERA_EVENT;
      Autodesk.ADN.ElementLocator.Event.UNLOCK_CAMERA_EVENT = ADN_UNLOCK_CAMERA_EVENT;
      Autodesk.Viewing.theExtensionManager.registerExtension('LockCameraExtension', LockCameraExtension);
})();
