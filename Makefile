.PHONY: build clean test-wayland follow-log

ext_id := one-third-window@chmouel.com
zip = $(ext_id).zip
schema = schemas/gschemas.compiled

build: $(zip)

install: $(zip)
	unzip -o $(zip) -d ~/.local/share/gnome-shell/extensions/$(ext_id)/

clean:
	rm -f $(zip) $(schema)

$(zip): *.json extension.js prefs.js $(schema)
	zip - $^ > $@

$(schema): schemas/*.xml
	glib-compile-schemas --strict schemas

test-wayland:
	dbus-run-session -- gnome-shell --nested --wayland

follow-log:
	journalctl -f /usr/bin/gnome-shell
