function makeGUI() {
    gui = {}

    gui.texture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('gui');

    gui.mainMenu = UI.MakeMainMenu(gui);

    gui.activeMenu = gui.mainMenu;

    // make show/hide button
    gui.shButton = UI.MakeShowHideButton(gui);

    gui.setActiveMenu = function(menu) {
        gui.activeMenu.hide(); // hide current active menu
        gui.activeMenu = menu;
        gui.activeMenu.show(); // show new active menu
    }

    return gui;
}

class UI {
    static PADDING = 2;

    static AddControlsToTarget(controls, target) {
        // controls is ar(control)
        // root is the gui texture
        for(var i = 0; i < controls.length; i++) {
            target.addControl(controls[i]);
        }
    }

    static MakePanel(isVertical = true) {
        // isVertical false means horizontal stackpanel
        var panel = new BABYLON.GUI.StackPanel();
        panel.isVertical = isVertical;
        return panel;
    }

    static AlignControlsTopLeft(controls) {
        for(var i = 0; i < controls.length; i++) {
            controls[i].horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            controls[i].verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        }
    }

    static AdaptContainerSize(container) {
        container.adaptWidthToChildren = true;
        container.adaptHeightToChildren = true;
    }

    static SetControlsWidthHeight(controls, width, height) {
        for(var i = 0; i < controls.length; i++) {
            controls[i].width = width;
            controls[i].height = height;
        }
    }

    static MakeMainMenu(gui) {
        //name is string
        let mainMenu = {};
        mainMenu.name = 'Main Menu';
        mainMenu.subs = {};
        mainMenu.controls = {};
        mainMenu.controlKeys = [];
        mainMenu.panel = UI.MakePanel();
        gui.texture.addControl(mainMenu.panel);

        UI.AdaptContainerSize(mainMenu.panel);
        UI.AlignControlsTopLeft([mainMenu.panel]);

        mainMenu.panel.top = 30;

        mainMenu.header = UI.MakeTextBlock(mainMenu.name, 30);
        UI.SetControlsWidthHeight([mainMenu.header], '200px', '50px')
        mainMenu.panel.addControl(mainMenu.header);


        mainMenu.addControls = function(controls) {
            UI.AddControlsToTarget(controls, mainMenu.panel);
        }
        
        mainMenu.addSubMenu = function(subMenu) {
            mainMenu.subs[subMenu.name] = subMenu;
            mainMenu.controls[subMenu.name] = UI.MakeButton(subMenu.name, subMenu.name, function() {
                gui.setActiveMenu(submenu);
            });
            mainMenu.controlKeys.push(subMenu.name);
            UI.AddControlsToTarget([subMenu.panel], mainMenu.panel);
        }

        mainMenu.show = function() {
            mainMenu.panel.isVisible = true;
        }

        mainMenu.hide = function() {
            mainMenu.panel.isVisible = false;
        }

        return mainMenu;
    }

    static MakeSubMenu(name, parent, gui) {
        // basically same as main menu, but includes back button
        // parent is menu that the back button goes back to
        let menu = {};
        menu.name = name;
        menu.subs = {};
        menu.controls = {};
        menu.controlKeys = [];
        menu.parent = parent;

        menu.panel = UI.MakePanel();
        UI.AdaptContainerSize(menu.panel);

        menu.headerPanel = UI.MakeSubMenuHeaderPanel(gui);

        menu.addControl = function(name, control) {
            menu.controls[name] = control;
            menu.controlKeys.push(name);
            menu.panel.addControl(control);
        }

        menu.show = function() {
            menu.panel.isVisible = true;
        }

        menu.hide = function() {
            menu.panel.isVisible = false;
        }

        return menu;
    }

    static MakeButton(name, text, onPressedFn) {
        var button = BABYLON.GUI.Button.CreateSimpleButton(name, text);
        button.onPointerClickObservable.add(onPressedFn);
        return button;
    }

    static MakeDualButton(text0, text1, onPressedFn0, onPressedFn1) {
        // button acts like a checkbox (hide/show settings button)
        // text0 is initial (true) state;
        // onPressedFn0 is run when state switches to true
        var dualButton = {};
        dualButton.state = true;
        dualButton.text0 = text0;
        dualButton.text1 = text1;
        dualButton.onPressedFn0 = onPressedFn0
        dualButton.button = UI.MakeButton(name, text0, function() {
            dualButton.state = !dualButton.state;
            if(dualButton.state) {
                //switched to true
                dualButton.button.text = dualButton.text0;
                onPressedFn0();
                
            } else {
                //switched to false
                dualButton.button.text = dualButton.text1;
                onPressedFn1();
            }
        });

        return dualButton;
    }

    static MakeShowHideButton(gui) {
        var shButton = {};
        //shButton.gui = gui;
        shButton.texts = ['show', 'hide'];
        shButton.state = 0;
        shButton.button = UI.MakeButton('shButton', 'show', function() {
            shButton.state = (shButton.state + 1) % 2;
            shButton.button.children[0].text = shButton.texts[shButton.state];
            gui.activeMenu.panel.isVisible = !gui.activeMenu.panel.isVisible;
        });
        UI.AlignControlsTopLeft([shButton.button]);
        shButton.button.color = 'white'
        shButton.button.width = '80px';
        shButton.button.height = '30px';
        gui.texture.addControl(shButton.button);

        return shButton;
    }

    static MakeBackButton() {
        
    }

    static MakeSubMenuHeaderPanel(gui) {
        
    }

    static MakeTextBlock(text, fontSize, color = 'white') {
        var textBlock = new BABYLON.GUI.TextBlock();
        textBlock.text = text;
        textBlock.fontSize = fontSize;
        textBlock.color = color;

        return textBlock;
    }

    static MakeSliderPanel(headerText, unit, minVal, maxVal, initVal, valChangeFn) {
        // makes slider panel. header above slider.
        // unit is string representing units ('degrees' or 'radians')
        // valChangeFn is function(value) that updates whatever the slider updates
        // valChangeFn does not need to change header as this is done here
        var sliderPanel = {headerText: headerText, unit: unit, valChangeFn: valChangeFn};
        sliderPanel.panel = UI.MakePanel();
        UI.AdaptContainerSize(sliderPanel.panel);
        sliderPanel.panel.background = 'black'
        sliderPanel.panel.alpha = .5;

        sliderPanel.header = UI.MakeTextBlock(headerText + ': ' + initVal + ' ' + unit, 20);

        sliderPanel.slider = BABYLON.GUI.Slider();
        sliderPanel.slider.minimum = minVal;
        sliderPanel.slider.maximum = maxVal;
        sliderPanel.slider.value = initVal;
        sliderPanel.slider.onValueChangedObservable.add(function(value) {
            sliderPanel.slider.header.text = sliderPanel.headerText + ': ' + sliderPanel.slider.value + ' ' + sliderPanel.unit;
            sliderPanel.valChangeFn(value);
        });

        UI.AddControlsToTarget([sliderPanel.header, sliderPanel.slider], sliderPanel.panel);

        return sliderPanel
    }
}