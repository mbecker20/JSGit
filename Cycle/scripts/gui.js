function makeGUI() {
    gui = {}
    gui.texture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('gui');
    gui.mainMenu = UI.MakeMainMenu()

    return gui;
}