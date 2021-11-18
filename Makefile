schema = schemas/gschemas.compiled

all: $(schema)

$(schema): schemas/*.xml
	glib-compile-schemas --strict schemas
