

all: quadratic.html

%.html: %.md
	echo '<!doctype html>' > $@.new
	Markdown.pl $< >> $@.new
	mv $@.new $@
