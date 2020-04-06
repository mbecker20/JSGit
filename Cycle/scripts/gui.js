class UI {
    static SPACING = '15px';
    
    // standard width height
    static STANDARDW = '200px';
    static STANDARDH = '40px';

    // makes the main gui object
    static MakeGUI(canvas) {
        var gui = {}
        gui.texture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('gui');
    
        // make show/hide button
        gui.shButton = UI.MakeShowHideButton(gui);

        // make main menu (can add submenus to main menu afterwords)
        gui.mainMenu = UI.MakeMainMenu(gui, canvas);
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

    // other constructors
    static MakeMainMenu(gui, canvas) {
        //name is string
        let mainMenu = {};
        mainMenu.name = 'main menu';
        mainMenu.panel = UI.MakePanel();
        gui.texture.addControl(mainMenu.panel);

        UI.AdaptContainerWidth(mainMenu.panel);
        UI.AlignControlsTopLeft([mainMenu.panel]);

        mainMenu.panel.top = 30;
        mainMenu.panel.background = 'black'

        mainMenu.header = UI.MakeTextBlock(mainMenu.name, 30);
        UI.SetControlsWidthHeight([mainMenu.header], '200px', '50px');
        mainMenu.panel.addControl(UI.MakeVertSpacer())
        mainMenu.panel.addControl(mainMenu.header);


        mainMenu.addControl = function(control) {
            UI.AddControlsToTarget([UI.MakeVertSpacer(), control], mainMenu.panel);
        }

        mainMenu.addControls = function(controls) {
            for(var i = 0; i < controls.length; i++) {
                mainMenu.addControl(controls[i]);
            }
        }

        mainMenu.addSubMenu = function(subMenu) {
            mainMenu.addControl(subMenu.parentButton);
        }
        
        mainMenu.addOneOfSubMenus = function(subMenus) {
            // for when only 1 parent button will be active at a time
            mainMenu.panel.addControl(UI.MakeVertSpacer());
            for(var i = 0; i < subMenus.length; i++) {
                mainMenu.panel.addControl(subMenus[i].parentButton);
            }
        }

        mainMenu.show = function() {
            mainMenu.panel.isVisible = true;
        }

        mainMenu.hide = function() {
            mainMenu.panel.isVisible = false;
        }

        mainMenu.addControl(UI.MakeFullscreenButton(canvas));

        return mainMenu;
    }

    static MakeSubMenu(name, parentMenu, gui, pbText = 'sim settings') {
        // basically same as main menu, but includes back button
        // parent is menu that the back button goes back to
        let menu = {};
        menu.name = name;

        menu.parentButton = UI.MakeParentButton(name.concat('parentButton'), pbText, menu, gui);

        menu.sv = UI.MakeScrollViewer();
        menu.panel = UI.MakePanel();
        menu.sv.addControl(menu.panel);
        UI.AdaptContainerWidth(menu.panel);
        UI.AlignControlsTopLeft([menu.panel]);
        menu.sv.top = 30;
        menu.panel.background = 'black'

        menu.headerPanel = UI.MakeSubMenuHeaderPanel(name, parentMenu, gui);
        menu.panel.addControl(UI.MakeVertSpacer());
        menu.panel.addControl(menu.headerPanel);

        menu.addControl = function(control) {
            UI.AddControlsToTarget([UI.MakeVertSpacer(), control], menu.panel);
        }

        menu.addControls = function(controls) {
            for(var i = 0; i < controls.length; i++) {
                menu.addControl(controls[i]);
            }
        }

        menu.addSubMenu = function(subMenu) {
            menu.panel.addControl(UI.MakeParentButton(subMenu.name.concat('ParentButton'), subMenu.name, subMenu, gui));
        }

        menu.show = function() {
            menu.sv.isVisible = true;
        }

        menu.hide = function() {
            menu.sv.isVisible = false;
        }

        menu.hide();
        gui.addControl(menu.sv);

        return menu;
    }

    static MakeSubMenuHeaderPanel(menuName, parent, gui) {
        // returns subMenu header panel obj
        // has backbutton and headertext in a panel horizontally
        
        var headerPanel = UI.MakePanel(false);
        UI.AdaptContainerHeight(headerPanel);
        var backButton = UI.MakeBackButton(menuName.concat('BackButton'), parent, gui);
        var headerText = UI.MakeTextBlock(menuName, 28, 'white');
        headerText.height = '50px';
        headerText.width = '200px';
        UI.AddControlsToTarget([backButton, headerText], headerPanel);
        return headerPanel;
    }

    static MakeSliderPanel(headerText, unit, minVal, maxVal, initVal, valChangeFn) {
        // makes slider panel. header above slider.
        // header becomes 'headerText: val unit'
        // unit is string representing units ('degrees' or 'radians')
        // valChangeFn is function(value) that updates whatever the slider updates
        // valChangeFn does not need to change header as this is done here
        var sliderPanel = UI.MakePanel();
        UI.AdaptContainerWidth(sliderPanel);

        var header = UI.MakeTextBlock(headerText + ': ' + initVal + ' ' + unit, 20);
        header.height = '30px';
        header.width = '250px';


        var slider = new BABYLON.GUI.Slider();
        slider.minimum = minVal;
        slider.maximum = maxVal;
        slider.value = initVal;
        slider.onValueChangedObservable.add(function(value) {
            header.text = headerText + ': ' + math.round(10*value)/10 + ' ' + unit;
            valChangeFn(value);
        });
        slider.height = '30px';
        slider.width = '250px';
        slider.color = 'grey'
        slider.background = 'black'
        slider.borderColor = 'white'
        slider.isThumbCircle = true;
        slider.thumbWidth = 30;


        UI.SetControlsPadding([header, slider], 2);
        UI.AddControlsToTarget([header, slider], sliderPanel);

        return sliderPanel
    }

    static MakeSliderPanelPrecise(headerText, unit, minVal, maxVal, initVal, valChangeFn) {
        // makes slider panel. header above slider.
        // header becomes 'headerText: val unit'
        // unit is string representing units ('degrees' or 'radians')
        // valChangeFn is function(value) that updates whatever the slider updates
        // valChangeFn does not need to change header as this is done here
        var sliderPanel = UI.MakePanel();
        UI.AdaptContainerWidth(sliderPanel);

        var header = UI.MakeTextBlock(headerText + ': ' + initVal + ' ' + unit, 20);
        header.height = '30px';
        header.width = '250px';


        var slider = new BABYLON.GUI.Slider();
        slider.minimum = minVal;
        slider.maximum = maxVal;
        slider.value = initVal;
        slider.onValueChangedObservable.add(function(value) {
            header.text = headerText + ': ' + math.round(100*value)/100 + ' ' + unit;
            valChangeFn(value);
        });
        slider.height = '30px';
        slider.width = '250px';
        slider.color = 'grey'
        slider.background = 'black'
        slider.borderColor = 'white'
        slider.isThumbCircle = true;
        slider.thumbWidth = 30;


        UI.SetControlsPadding([header, slider], 2);
        UI.AddControlsToTarget([header, slider], sliderPanel);

        return sliderPanel
    }

    static MakeChooseAnimPanel(animState) {
        var caPanel = UI.MakePanel();
        var caSubPanel = UI.MakePanel();
        var headerButton = UI.MakeButton('chooseAnimBut', 'choose simulation', function() {
            caSubPanel.isVisible = !caSubPanel.isVisible;
        });
        var animKeys = Object.keys(animState.anims);
        var animButtons = [UI.MakeVertSpacer()];
        for(var i = 0; i < animKeys.length; i++) {
            animButtons.push(UI.MakeActivateAnimButton(animKeys[i], animState, caSubPanel));
        }
        caSubPanel.isVisible = false;
        UI.AddControlsToTarget(animButtons, caSubPanel);
        UI.AddControlsToTarget([headerButton, caSubPanel], caPanel);
        return caPanel;
    }

    static MakeChooseAnimMenu(animState, gui) {
        var caMenu = UI.MakeSubMenu('simulations', gui.mainMenu, gui, 'choose simulation');
        var animKeys = Object.keys(animState.anims);
        var animButtons = [];
        for(var i = 0; i < animKeys.length; i++) {
            animButtons.push(UI.MakeMenuActivateAnimButton(animKeys[i], animState, caMenu));
        }
        caMenu.addControls(animButtons);
        //add a property that holds the active sim button to change its color to highlight that its active
        caMenu.activeAnimButton = animButtons[0];
        caMenu.activeAnimButton.color = 'green';
        return caMenu;
    }

    static MakeShowHideButton(gui) {
        var shButton = UI.MakeDualButton('shButton', 'show', 'hide', function() {
            gui.activeMenu.hide();
        }, function() {
            gui.activeMenu.show();
        });
        UI.AlignControlsTopLeft([shButton]);
        shButton.width = '60px';
        shButton.height = '30px';
        gui.texture.addControl(shButton);

        return shButton;
    }

    static MakeFullscreenButton(canvas) { 
        var fsButton = UI.MakeDualButton('fsButton', 'enter fullscreen', 'exit fullscreen', function() {
            if(screenfull.isEnabled) {
                screenfull.exit();
            }
        }, function() {
            if(screenfull.isEnabled) {
                screenfull.request(canvas);
            }
        });
        return fsButton;
    }

    static MakeActivateAnimButton(text, animState, parentPanel) {
        var aaButton = UI.MakeButton('', text, function() {
            animState.activeAnim.deactivate();
            animState.activeAnim = animState.anims[text];
            animState.activeAnim.activate();
            parentPanel.isVisible = false;
        });
        aaButton.color = 'white';
        return aaButton;
    }

    static MakeMenuActivateAnimButton(text, animState, caMenu) {
        var aaButton = UI.MakeButton('', text, function() {
            animState.activeAnim.deactivate();
            animState.activeAnim = animState.anims[text];
            animState.activeAnim.activate();
            caMenu.activeAnimButton.color = 'white';
            caMenu.activeAnimButton = aaButton;
            caMenu.activeAnimButton.color = 'green';
        });
        aaButton.color = 'white';
        return aaButton;
    }

    static MakeDualTextButton(name, text0, text1, onPressedFn) {
        // button acts like a checkbox (hide/show settings button)
        // text0 is initial (true) state;
        // onPressedFn0 is run when state switches to true
        var state = 0
        var texts = [text0, text1];
        var button = UI.MakeButton(name, text0, function() {
            state = (state + 1) % 2;
            button.children[0].text = texts[state];
            onPressedFn();
        });

        return button;
    }

    static MakeDualButton(name, text0, text1, onPressedFn0, onPressedFn1) {
        // button acts like a checkbox (hide/show settings button)
        // text0 is initial 0 state;
        // onPressedFn0 is run when state switches to 0
        var state = 0
        var texts = [text0, text1];
        var fns = [onPressedFn0, onPressedFn1]
        var button = UI.MakeButton(name, text0, function() {
            state = (state + 1) % 2;
            button.children[0].text = texts[state];
            fns[state]();
        });

        return button;
    }

    static MakeParentButton(name, text, subMenu, gui) {
        var parentButton = UI.MakeButton(name, text, function() {
            gui.setActiveMenu(subMenu);
        });
        parentButton.color = 'white'
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

    static MakeVertSpacer(spacing = UI.SPACING) {
        // s
        var spacer = new BABYLON.GUI.Rectangle();
        spacer.width = '1px';
        spacer.height = spacing;
        spacer.color = 'green'
        spacer.alpha = 0;
        return spacer;
    }

    static MakeButton(name, text, onPressedFn, width = UI.STANDARDW, height = UI.STANDARDH) {
        var button = BABYLON.GUI.Button.CreateSimpleButton(name, text);
        button.onPointerClickObservable.add(onPressedFn);
        UI.SetControlsWidthHeight([button], width, height);
        button.color = 'white';
        return button;
    }

    static MakeTextBlock(text, fontSize, color = 'white') {
        var textBlock = new BABYLON.GUI.TextBlock();
        textBlock.text = text;
        textBlock.fontSize = fontSize;
        textBlock.color = color;

        return textBlock;
    }

    static MakePanel(isVertical = true, topLeft = false, adaptSize = true) {
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

    static MakeScrollViewer(name = '') {
        var sv = new BABYLON.GUI.ScrollViewer(name);
        sv.width = '270px'
        sv.height = '340px'
        UI.AlignControlsTopLeft([sv]);
        sv.barSize = 20;
        sv.color = 'black'
        return sv;
    }

    // helpers
    static AddControlsToTarget(controls, target) {
        // controls is ar(control)
        // root is the gui texture
        for(var i = 0; i < controls.length; i++) {
            target.addControl(controls[i]);
        }
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
}