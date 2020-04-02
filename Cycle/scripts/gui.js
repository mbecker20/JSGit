class UI {
    static PADDING = 2;

    static MakeGUI() {
        var gui = {}
        gui.texture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('gui');
    
        // make show/hide button
        gui.shButton = UI.MakeShowHideButton(gui);

        // make main menu (can add submenus to main menu afterwords)
        gui.mainMenu = UI.MakeMainMenu(gui);
        gui.activeMenu = gui.mainMenu;
        gui.activeMenu.hide();
    
        gui.setActiveMenu = function(menu) {
            gui.activeMenu.hide(); // hide current active menu
            gui.activeMenu = menu;
            gui.activeMenu.show(); // show new active menu
        }

        gui.addControl = function(control) {
            gui.texture.addControl(control);
        }
    
        return gui;
    }

    static AddControlsToTarget(controls, target) {
        // controls is ar(control)
        // root is the gui texture
        for(var i = 0; i < controls.length; i++) {
            target.addControl(controls[i]);
        }
    }

    static MakePanel(isVertical = true, topLeft = false, adaptSize = false) {
        // isVertical false means horizontal stackpanel
        var panel = new BABYLON.GUI.StackPanel();
        panel.isVertical = isVertical;
        if(topLeft) {
            UI.AlignControlsTopLeft([panel]);
        }
        if(adaptSize) {
            if(isVertical) {
                UI.AdaptContainerWidth(panel);
            } else {
                UI.AdaptContainerHeight(panel);
            }
        }
        return panel;
    }

    static SetControlsPadding(controls, padding) {
        for(var i = 0; i < controls.length; i++) {
            controls[i].paddingTop = padding;
            controls[i].paddingBottom = padding;
            controls[i].paddingLeft = padding;
            controls[i].paddingRight = padding;
        }
    }

    static AlignControlsTop(controls) {
        for(var i = 0; i < controls.length; i++) {
            controls[i].verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        }
    }

    static AlignControlsLeft(controls) {
        for(var i = 0; i < controls.length; i++) {
            controls[i].horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        }
    }

    static AlignControlsTopLeft(controls) {
        for(var i = 0; i < controls.length; i++) {
            controls[i].horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            controls[i].verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        }
    }

    static AdaptContainerWidth(container) {
        container.adaptWidthToChildren = true;
    }

    static AdaptContainerHeight(container) {
        container.adaptHeightToChildren = true;
    }

    static AdaptContainerWidthHeight(container) {
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
        mainMenu.panel = UI.MakePanel();
        gui.texture.addControl(mainMenu.panel);

        UI.AdaptContainerWidth(mainMenu.panel);
        UI.AlignControlsTopLeft([mainMenu.panel]);

        mainMenu.panel.top = 30;

        mainMenu.header = UI.MakeTextBlock(mainMenu.name, 30);
        UI.SetControlsWidthHeight([mainMenu.header], '200px', '50px')
        mainMenu.panel.addControl(mainMenu.header);


        mainMenu.addControls = function(controls) {
            UI.AddControlsToTarget(controls, mainMenu.panel);
        }
        
        mainMenu.addSubMenu = function(subMenu) {
            mainMenu.panel.addControl(UI.MakeParentButton(subMenu.name.concat('ParentButton'), subMenu.name, subMenu, gui));
        }

        mainMenu.show = function() {
            mainMenu.panel.isVisible = true;
        }

        mainMenu.hide = function() {
            mainMenu.panel.isVisible = false;
        }

        return mainMenu;
    }

    static MakeSubMenu(name, parentMenu, gui) {
        // basically same as main menu, but includes back button
        // parent is menu that the back button goes back to
        let menu = {};
        menu.name = name;

        menu.panel = UI.MakePanel();
        UI.AdaptContainerWidth(menu.panel);
        UI.AlignControlsTopLeft([menu.panel]);
        menu.panel.top = 30;

        menu.headerPanel = UI.MakeSubMenuHeaderPanel(name, parentMenu, gui);
        menu.panel.addControl(menu.headerPanel.panel);

        menu.addControls = function(controls) {
            UI.AddControlsToTarget(controls, menu.panel);
        }

        menu.addSubMenu = function(subMenu) {
            menu.panel.addControl(UI.MakeParentButton(subMenu.name.concat('ParentButton'), subMenu.name, subMenu, gui));
        }

        menu.show = function() {
            menu.panel.isVisible = true;
        }

        menu.hide = function() {
            menu.panel.isVisible = false;
        }

        menu.hide();
        gui.addControl(menu.panel);

        return menu;
    }

    static MakeButton(name, text, onPressedFn) {
        var button = BABYLON.GUI.Button.CreateSimpleButton(name, text);
        button.onPointerClickObservable.add(onPressedFn);
        return button;
    }

    static MakeDualButton(gui, text0, text1, onPressedFn0, onPressedFn1) {
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

    static MakeParentButton(name, text, subMenu, gui) {
        var parentButton = UI.MakeButton(name, text, function() {
            gui.setActiveMenu(subMenu);
        });
        parentButton.color = 'white'
        parentButton.width = '200px'
        parentButton.height = '50px'
        return parentButton;
    }

    static MakeBackButton(name, parent, gui) {
        // parent is menu that back button returns to
        var backButton = UI.MakeButton(name, '<', function() {
            gui.setActiveMenu(parent);
        });
        backButton.color = 'white'
        backButton.width = '30px'
        backButton.height = '30px'
        return backButton;
    }

    static MakeSubMenuHeaderPanel(menuName, parent, gui) {
        // returns subMenu header panel obj
        // has backbutton and headertext in a panel horizontally
        var headerPanel = {};
        headerPanel.panel = UI.MakePanel(false);
        UI.AdaptContainerHeight(headerPanel.panel);
        headerPanel.backButton = UI.MakeBackButton(menuName.concat('BackButton'), parent, gui);
        headerPanel.headerText = UI.MakeTextBlock(menuName, 30, 'white');
        headerPanel.headerText.height = '50px';
        headerPanel.headerText.width = '200px';
        UI.AddControlsToTarget([headerPanel.backButton, headerPanel.headerText], headerPanel.panel);
        return headerPanel;
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
        // header becomes 'headerText: val unit'
        // unit is string representing units ('degrees' or 'radians')
        // valChangeFn is function(value) that updates whatever the slider updates
        // valChangeFn does not need to change header as this is done here
        var sliderPanel = {};
        sliderPanel.panel = UI.MakePanel();
        UI.AdaptContainerWidth(sliderPanel.panel);
        sliderPanel.panel.background = 'black'
        sliderPanel.panel.alpha = .5;

        sliderPanel.header = UI.MakeTextBlock(headerText + ': ' + initVal + ' ' + unit, 20);
        sliderPanel.header.height = '30px';
        sliderPanel.header.width = '150px';


        sliderPanel.slider = BABYLON.GUI.Slider();
        sliderPanel.slider.minimum = minVal;
        sliderPanel.slider.maximum = maxVal;
        sliderPanel.slider.value = initVal;
        sliderPanel.slider.onValueChangedObservable.add(function(value) {
            sliderPanel.header.text = headerText + ': ' + value + ' ' + unit;
            sliderPanel.valChangeFn(value);
        });
        sliderPanel.slider.height = '30px';
        sliderPanel.slider.width = '150px';

        UI.AddControlsToTarget([sliderPanel.header, sliderPanel.slider], sliderPanel.panel);

        return sliderPanel
    }
}