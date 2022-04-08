'use strict';

const {Meta, Shell} = imports.gi;

const Main = imports.ui.main;
const ExtensionUtils = imports.misc.extensionUtils;

var LEFT = 'LEFT';
var RIGHT = 'RIGHT';
var CENTER = 'CENTER';

class Extension {
    constructor() {
        this._window = null;
        this._previous = null;
    }

    getActiveWindow() {
        return global.workspace_manager
        .get_active_workspace()
        .list_windows()
        .find(window => window.has_focus());
    }

    enable() {
        this._settings = ExtensionUtils.getSettings();
        this.bindKey('center-shortcut', () => this.moveCenter());
        this.bindKey('rotate-shortcut', () => this.moveAround());
    }

    disable() {
        this.unbindKey('center-shortcut');
        this.unbindKey('rotate-shortcut');
    }

    moveCenter() {
        this.moveByMode('center');
        this._previous = CENTER;
    }

    moveAround() {
        if (!this._previous || this._previous === LEFT)
            return this.moveCenter();


        if (this._previous === CENTER) {
            this._previous = RIGHT;
            return this.moveByMode(RIGHT);
        }

        if (this._previous === RIGHT) {
            this._previous = LEFT;
            return this.moveByMode(LEFT);
        }
        return null;
    }

    moveByMode(mode) {
        const activeWindow = this.getActiveWindow();
        if (!activeWindow) {
            log('No active window');
            return;
        }
        const monitor = activeWindow.get_monitor();
        const workarea = this.getWorkAreaForMonitor(monitor);

        const rightMargin = 10;
        const enlargeWidth = this._settings.get_int('enlarge-width');

        const heightIncrease = this._settings.get_int('height-increase');
        const topStart = this._settings.get_int('top-start');

        const W = workarea.width / 2 - rightMargin + enlargeWidth;
        // from the topbar #TODO:setting
        const Y = topStart; // gnome default top bar is 25, dash to panel is 48
        const H = workarea.height + heightIncrease;

        // position from the left
        let X = workarea.width / 3 - enlargeWidth;
        if (mode === RIGHT)
            X = workarea.width / 2 - rightMargin;
        else if (mode === LEFT)
            X = 0;


        this.moveWindow(activeWindow, {
            x: X,
            y: Y,
            width: W,
            height: H,
        });
    }

    moveWindow(window, area) {
        if (!window)
            return;

        if (window.maximized_horizontally || window.maximized_vertically) {
            window.unmaximize(
                Meta.MaximizeFlags.HORIZONTAL | Meta.MaximizeFlags.VERTICAL
            );
        }
        window.move_resize_frame(true, area.x, area.y, area.width, area.height);
        // In some cases move_resize_frame() will resize but not move the window, so we need to move it again.
        // This usually happens when the window's minimum size is larger than the selected area.
        window.move_frame(true, area.x, area.y);
    }

    getWorkAreaForMonitor(monitor) {
        return global.workspace_manager
      .get_active_workspace()
      .get_work_area_for_monitor(monitor);
    }

    bindKey(key, callback) {
        Main.wm.addKeybinding(
            key,
            this._settings,
            Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
            Shell.ActionMode.NORMAL,
            callback
        );
    }

    unbindKey(key) {
        Main.wm.removeKeybinding(key);
    }
}

/**
 *
 */
function init() {
    return new Extension();
}
