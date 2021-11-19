const ExtensionUtils = imports.misc.extensionUtils;
const {GObject, Gtk} = imports.gi;

const COLUMN_KEY = 0;
const COLUMN_MODS = 1;

const KEYBOARD_SHORTCUTS = [
    {id: 'center-shortcut', desc: 'Center window'},
    {id: 'rotate-shortcut', desc: 'Rotate window position'},
];

function init() {}

function buildPrefsWidget() {
    let settings = ExtensionUtils.getSettings();
    const allTreeViews = [];

    const grid = new Gtk.Grid({
        margin_start: 12,
        margin_end: 12,
        margin_top: 12,
        margin_bottom: 12,
        column_spacing: 12,
        row_spacing: 12,
        visible: true,
    });

    const tileConfigLabel = new Gtk.Label({
        label: '<b>Pixels ajustement</b>',
        use_markup: true,
        visible: true,
    });
    grid.attach(tileConfigLabel, 0, 0, 1, 1);

    const boxers = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 5,
    });

    boxers.prepend(
        getSomePixels(
            'How many pixels to enlarge the window with',
            settings,
            'enlarge-width'
        )
    );

    boxers.append(
        getSomePixels(
            'How many pixels before we start placing the window (ie: larger panels)',
            settings,
            'top-start'
        )
    );

    boxers.append(
        getSomePixels(
            'How many pixels to increase the window height with',
            settings,
            'height-increase'
        )
    );
    grid.attach(boxers, 0, 1, 1, 1);

    const keyboardShortcutsLabel = new Gtk.Label({
        label: '<b>Keyboard shortcuts</b>',
        use_markup: true,
        visible: true,
    });
    grid.attach(keyboardShortcutsLabel, 0, 2, 1, 1);

    const keyboardShortcutsWidget = buildKeyboardShortcutsWidget(
        settings,
        allTreeViews
    );
    grid.attach(keyboardShortcutsWidget, 0, 3, 1, 1);

    return grid;
}

function buildKeyboardShortcutsWidget(settings, allTreeViews) {
    const grid = new Gtk.Grid({
        halign: Gtk.Align.CENTER,
        column_spacing: 12,
        row_spacing: 12,
        visible: true,
    });

    KEYBOARD_SHORTCUTS.forEach((shortcut, index) => {
        const label = new Gtk.Label({
            halign: Gtk.Align.END,
            label: shortcut.desc,
            visible: true,
        });
        grid.attach(label, 0, index, 1, 1);

        const accelerator = buildAcceleratorWidget(
            settings,
            shortcut.id,
            124,
            26,
            allTreeViews
        );
        grid.attach(accelerator, 1, index, 1, 1);
    });

    return grid;
}

function getSomePixels(labeltext, settings, id) {
    const box = new Gtk.Box({
        orientation: Gtk.Orientation.HORIZONTAL,
        spacing: 5,
    });
    let label = new Gtk.Label({
        label: labeltext,
        halign: Gtk.Align.START,
    });
    box.prepend(label);

    const field = new Gtk.SpinButton({
        adjustment: new Gtk.Adjustment({
            lower: 0,
            upper: 1000,
            step_increment: 1,
        }),
        visible: true,
    });
    box.append(field);

    field.set_value(settings.get_int(id));
    field.connect('value-changed', widget => {
        settings.set_int(id, widget.get_value_as_int());
    });

    settings.connect('changed::top-start', () => {
        field.set_value(settings.get_int(id));
    });
    return box;
}

function buildAcceleratorWidget(settings, id, width, height, allTreeViews) {
    // Model
    const model = new Gtk.ListStore();
    model.set_column_types([GObject.TYPE_INT, GObject.TYPE_INT]);
    model.set(
        model.append(),
        [COLUMN_KEY, COLUMN_MODS],
        parseAccelerator(settings, id)
    );

    // Renderer
    const renderer = new Gtk.CellRendererAccel({
        accel_mode: Gtk.CellRendererAccelMode.GTK,
        width,
        height,
        editable: true,
    });
    renderer.connect('accel-edited', function (renderer, path, key, mods) {
        const [ok, iter] = model.get_iter_from_string(path);
        if (!ok)
            return;

        model.set(iter, [COLUMN_KEY, COLUMN_MODS], [key, mods]);
        settings.set_strv(id, [Gtk.accelerator_name(key, mods)]);
    });
    renderer.connect('accel-cleared', function (renderer, path) {
        const [ok, iter] = model.get_iter_from_string(path);
        if (!ok)
            return;

        model.set(iter, [COLUMN_KEY, COLUMN_MODS], [0, 0]);
        settings.set_strv(id, []);
    });

    // Column
    const column = new Gtk.TreeViewColumn();
    column.pack_start(renderer, true);
    column.add_attribute(renderer, 'accel-key', COLUMN_KEY);
    column.add_attribute(renderer, 'accel-mods', COLUMN_MODS);

    // TreeView
    const treeView = new Gtk.TreeView({
        model,
        headers_visible: false,
        visible: true,
    });
    treeView.append_column(column);

    // TreeViews keep their selection when they loose focus
    // This prevents more than one from being selected
    treeView.get_selection().connect('changed', function (selection) {
        if (selection.count_selected_rows() > 0) {
            allTreeViews
        .filter(it => it !== treeView)
        .forEach(it => it.get_selection().unselect_all());
        }
    });
    allTreeViews.push(treeView);

    return treeView;
}

function parseAccelerator(settings, id) {
    const accelerator = settings.get_strv(id)[0] || '';
    const [ok, key, mods] = Gtk.accelerator_parse(accelerator);
    // Gtk3 compatibility
    if (typeof ok === 'number')
        return [ok, key];

    return [key, mods];
}
