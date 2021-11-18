const ExtensionUtils = imports.misc.extensionUtils;
const Gtk = imports.gi.Gtk;

function init() {}

function buildPrefsWidget() {
  let settings = ExtensionUtils.getSettings();

  const boxers = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    spacing: 5,
  });

  boxers.prepend(
    getSomePixels(
      "How many pixels to enlarge the window with",
      settings,
      "enlarge-width"
    )
  );

  boxers.append(
    getSomePixels(
      "How many pixels before we start placing the window (ie: larger panels)",
      settings,
      "top-start"
    )
  );

  boxers.append(
    getSomePixels(
      "How many pixels to increase the window height with",
      settings,
      "height-increase"
    )
  );

  if (boxers.show_all) {
    boxers.show_all();
  }

  return boxers;
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
  field.connect("value-changed", (widget) => {
    settings.set_int(id, widget.get_value_as_int());
  });

  settings.connect("changed::top-start", () => {
    field.set_value(settings.get_int(id));
  });
  return box;
}
